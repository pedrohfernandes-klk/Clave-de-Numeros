
import assert from 'node:assert/strict';
import test from 'node:test';
import worker, { handleRequest } from '../src/index.js';

const env = {
  ALLOWED_ORIGINS: 'https://clavedenumeros.pt,https://www.clavedenumeros.pt',
  CONTACT_RECIPIENT: 'geral@clavedenumeros.pt',
  GMAIL_USER: 'geral@clavedenumeros.pt',
  TURNSTILE_SECRET: 'secret',
  GMAIL_CLIENT_ID: 'client',
  GMAIL_CLIENT_SECRET: 'client-secret',
  GMAIL_REFRESH_TOKEN: 'refresh'
};

const valid = {
  nome: 'Maria Silva',
  email: 'maria@example.com',
  atividade: 'Empresa',
  mensagem: 'Gostaria de receber mais informaÃ§Ãµes.',
  idioma: 'pt',
  rgpd: true,
  website: '',
  turnstileToken: 'token'
};

const request = (body, origin = 'https://www.clavedenumeros.pt') => new Request(
  'https://worker.example/contact',
  {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      'CF-Connecting-IP': `198.51.100.${Math.floor(Math.random() * 200) + 1}`
    },
    body: JSON.stringify(body)
  }
);

const successfulFetch = async (url) => {
  if (String(url).includes('siteverify')) {
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  if (String(url).includes('oauth2')) {
    return new Response(JSON.stringify({ access_token: 'access' }), { status: 200 });
  }
  return new Response(JSON.stringify({ id: 'message' }), { status: 200 });
};

test('accepts and sends a valid request', async () => {
  const result = await handleRequest(request(valid), env, successfulFetch);
  assert.equal(result.status, 202);
});

test('rejects an unapproved origin without CORS headers', async () => {
  const result = await handleRequest(request(valid, 'https://example.com'), env, successfulFetch);
  assert.equal(result.status, 403);
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
});

test('rejects invalid contact fields', async () => {
  const result = await handleRequest(request({ ...valid, email: 'invalid' }), env, successfulFetch);
  assert.equal(result.status, 422);
});

test('silently accepts the honeypot without external calls', async () => {
  const result = await handleRequest(request({ ...valid, website: 'spam' }), env, async () => {
    assert.fail('External APIs must not be called');
  });
  assert.equal(result.status, 202);
});

test('rejects a failed Turnstile challenge', async () => {
  const result = await handleRequest(request(valid), env, async (url) => {
    if (String(url).includes('siteverify')) {
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }
    assert.fail('Gmail must not be called');
  });
  assert.equal(result.status, 400);
});

test('Cloudflare default handler does not treat execution context as fetch', async () => {
  const healthRequest = new Request('https://worker.example/health');
  const result = await worker.fetch(healthRequest, env, { waitUntil() {} });
  assert.equal(result.status, 200);
});
