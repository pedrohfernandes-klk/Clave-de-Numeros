
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map();

const clean = (value) => typeof value === 'string' ? value.trim() : '';
const allowedOrigins = (env) => (env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const response = (status, body, origin = '') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    ...(origin ? {
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin'
    } : {})
  }
});

const validate = (input) => {
  const data = {
    nome: clean(input?.nome),
    email: clean(input?.email).toLowerCase(),
    atividade: clean(input?.atividade),
    mensagem: clean(input?.mensagem),
    idioma: clean(input?.idioma) === 'en' ? 'en' : 'pt',
    rgpd: input?.rgpd === true,
    website: clean(input?.website),
    turnstileToken: clean(input?.turnstileToken)
  };
  const fields = {};
  if (data.nome.length < 2 || data.nome.length > 100) fields.nome = 'invalid';
  if (!EMAIL.test(data.email) || data.email.length > 254) fields.email = 'invalid';
  if (data.atividade.length > 100) fields.atividade = 'invalid';
  if (data.mensagem.length < 10 || data.mensagem.length > 5000) fields.mensagem = 'invalid';
  if (!data.rgpd) fields.rgpd = 'required';
  if (!data.turnstileToken) fields.turnstileToken = 'required';
  return { ok: Object.keys(fields).length === 0, data, fields };
};

const rateAllowed = (key, now = Date.now()) => {
  const windowMs = 10 * 60 * 1000;
  const recent = (attempts.get(key) || []).filter((time) => now - time < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  if (attempts.size > 2000) {
    for (const [entry, times] of attempts) {
      if (!times.some((time) => now - time < windowMs)) attempts.delete(entry);
    }
  }
  return recent.length <= 5;
};

const verifyTurnstile = async (env, token, remoteIp, fetchImpl) => {
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET);
  body.append('response', token);
  if (remoteIp) body.append('remoteip', remoteIp);
  const result = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body
  });
  return result.ok && (await result.json()).success === true;
};

const safeHeader = (value) => value.replace(/[\r\n]+/g, ' ').trim();
const base64Url = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
};

const buildMessage = (data, env) => {
  const subject = data.idioma === 'en'
    ? `Website contact â€” ${data.nome}`
    : `Contacto pelo website â€” ${data.nome}`;
  const text = [
    'Novo pedido recebido atravÃ©s de clavedenumeros.pt',
    '',
    `Nome: ${data.nome}`,
    `Email: ${data.email}`,
    `Atividade: ${data.atividade || 'NÃ£o indicada'}`,
    `Idioma: ${data.idioma.toUpperCase()}`,
    '',
    'Mensagem:',
    data.mensagem,
    '',
    'O consentimento para resposta foi confirmado no formulÃ¡rio.'
  ].join('\r\n');
  return [
    `From: Clave de NÃºmeros <${safeHeader(env.GMAIL_USER)}>`,
    `To: ${safeHeader(env.CONTACT_RECIPIENT)}`,
    `Reply-To: ${safeHeader(data.email)}`,
    `Subject: ${safeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    text
  ].join('\r\n');
};

const sendGmail = async (env, data, fetchImpl) => {
  const tokenResult = await fetchImpl('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GMAIL_CLIENT_ID,
      client_secret: env.GMAIL_CLIENT_SECRET,
      refresh_token: env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  if (!tokenResult.ok) throw new Error('Gmail OAuth failed');
  const { access_token: accessToken } = await tokenResult.json();
  if (!accessToken) throw new Error('Gmail OAuth token missing');

  const result = await fetchImpl('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Url(buildMessage(data, env)) })
  });
  if (!result.ok) throw new Error('Gmail send failed');
};

export const handleRequest = async (request, env, fetchImpl = fetch) => {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = allowedOrigins(env).includes(origin) ? origin : '';

  if (request.method === 'GET' && url.pathname === '/health') {
    return response(200, { ok: true });
  }
  if (url.pathname !== '/contact') return response(404, { error: 'not_found' }, allowedOrigin);
  if (!allowedOrigin) return response(403, { error: 'origin_not_allowed' });

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        Vary: 'Origin'
      }
    });
  }
  if (request.method !== 'POST') return response(405, { error: 'method_not_allowed' }, allowedOrigin);
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) {
    return response(415, { error: 'unsupported_media_type' }, allowedOrigin);
  }
  if (Number(request.headers.get('Content-Length') || 0) > 16384) {
    return response(413, { error: 'payload_too_large' }, allowedOrigin);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!rateAllowed(ip)) return response(429, { error: 'too_many_requests' }, allowedOrigin);

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 16384) {
      return response(413, { error: 'payload_too_large' }, allowedOrigin);
    }
    const result = validate(JSON.parse(raw));
    if (!result.ok) {
      return response(422, { error: 'validation_failed', fields: result.fields }, allowedOrigin);
    }
    if (result.data.website) return response(202, { ok: true }, allowedOrigin);
    if (!await verifyTurnstile(env, result.data.turnstileToken, ip, fetchImpl)) {
      return response(400, { error: 'captcha_failed' }, allowedOrigin);
    }
    await sendGmail(env, result.data, fetchImpl);
    return response(202, { ok: true }, allowedOrigin);
  } catch (error) {
    console.error('Contact request failed', error?.message || 'unknown');
    return response(500, { error: 'internal_error' }, allowedOrigin);
  }
};

export default {
  fetch: handleRequest
};
