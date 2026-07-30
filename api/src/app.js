import { validateContact } from './validation.js';
import { createRateLimiter, verifyTurnstile } from './security.js';

const json = (res, status, body, origin) => {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ...(origin ? {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin'
    } : {})
  });
  res.end(JSON.stringify(body));
};

const clientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim()
    || req.socket.remoteAddress
    || 'unknown';
};

const readJson = (req, maxBytes) => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxBytes) {
      reject(Object.assign(new Error('Payload too large'), { status: 413 }));
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    } catch {
      reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
    }
  });
  req.on('error', reject);
});

export const createApp = ({ config, sendMail, captchaVerifier = verifyTurnstile }) => {
  const allowRequest = createRateLimiter({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax
  });

  return async (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigin = config.allowedOrigins.includes(origin) ? origin : '';

    if (req.method === 'GET' && req.url === '/health') {
      return json(res, 200, { ok: true }, '');
    }
    if (req.url !== '/contact') return json(res, 404, { error: 'not_found' }, allowedOrigin);
    if (!allowedOrigin) return json(res, 403, { error: 'origin_not_allowed' }, '');

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        Vary: 'Origin'
      });
      return res.end();
    }
    if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' }, allowedOrigin);
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
      return json(res, 415, { error: 'unsupported_media_type' }, allowedOrigin);
    }

    const ip = clientIp(req);
    if (!allowRequest(ip)) return json(res, 429, { error: 'too_many_requests' }, allowedOrigin);

    try {
      const input = await readJson(req, config.maxBodyBytes);
      const result = validateContact(input);
      if (!result.ok) return json(res, 422, { error: 'validation_failed', fields: result.errors }, allowedOrigin);

      // Honeypot: return success so automated senders do not learn how they were detected.
      if (result.data.website) return json(res, 202, { ok: true }, allowedOrigin);

      const captchaOk = await captchaVerifier({
        secret: config.turnstileSecret,
        token: result.data.turnstileToken,
        remoteIp: ip
      });
      if (!captchaOk) return json(res, 400, { error: 'captcha_failed' }, allowedOrigin);

      await sendMail(result.data);
      return json(res, 202, { ok: true }, allowedOrigin);
    } catch (error) {
      const status = error.status || 500;
      if (status === 500) console.error('Contact request failed', error);
      return json(res, status, { error: status === 500 ? 'internal_error' : error.message }, allowedOrigin);
    }
  };
};
