import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { createApp } from '../src/app.js';

const config = {
  allowedOrigins: ['https://www.clavedenumeros.pt'],
  turnstileSecret: 'test',
  maxBodyBytes: 16384,
  rateLimitWindowMs: 60000,
  rateLimitMax: 5
};

const request = async (handler, { origin = config.allowedOrigins[0], body = {}, method = 'POST' } = {}) => {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await fetch(`http://127.0.0.1:${port}/contact`, {
      method,
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(body) : undefined
    });
  } finally {
    server.close();
  }
};

const valid = {
  nome: 'Maria Silva',
  email: 'maria@example.com',
  atividade: 'Empresa',
  mensagem: 'Gostaria de receber mais informaÃ§Ãµes.',
  idioma: 'pt',
  rgpd: true,
  website: '',
  turnstileToken: 'valid-token'
};

test('accepts a valid request and sends mail', async () => {
  const sent = [];
  const handler = createApp({
    config,
    sendMail: async (data) => sent.push(data),
    captchaVerifier: async () => true
  });
  const response = await request(handler, { body: valid });
  assert.equal(response.status, 202);
  assert.equal(sent.length, 1);
});

test('rejects origins outside the allow-list', async () => {
  const handler = createApp({ config, sendMail: async () => {}, captchaVerifier: async () => true });
  const response = await request(handler, { origin: 'https://example.com', body: valid });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('rejects invalid fields without sending mail', async () => {
  let sent = false;
  const handler = createApp({
    config,
    sendMail: async () => { sent = true; },
    captchaVerifier: async () => true
  });
  const response = await request(handler, { body: { ...valid, email: 'invalid' } });
  assert.equal(response.status, 422);
  assert.equal(sent, false);
});

test('silently accepts honeypot submissions', async () => {
  let captchaChecked = false;
  const handler = createApp({
    config,
    sendMail: async () => assert.fail('mail should not be sent'),
    captchaVerifier: async () => { captchaChecked = true; return true; }
  });
  const response = await request(handler, { body: { ...valid, website: 'spam' } });
  assert.equal(response.status, 202);
  assert.equal(captchaChecked, false);
});
