
const encodeBase64Url = (value) => Buffer.from(value)
  .toString('base64')
  .replaceAll('+', '-')
  .replaceAll('/', '_')
  .replace(/=+$/g, '');

const safeHeader = (value) => value.replace(/[\r\n]+/g, ' ').trim();

export const buildMessage = ({ data, from, to }) => {
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
    `From: Clave de NÃºmeros <${safeHeader(from)}>`,
    `To: ${safeHeader(to)}`,
    `Reply-To: ${safeHeader(data.email)}`,
    `Subject: ${safeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    text
  ].join('\r\n');
};

export const createGmailSender = async (config, fetchImpl = fetch) => {
  return async (data) => {
    const tokenResponse = await fetchImpl('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.gmailClientId,
        client_secret: config.gmailClientSecret,
        refresh_token: config.gmailRefreshToken,
        grant_type: 'refresh_token'
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!tokenResponse.ok) throw new Error('Gmail OAuth token request failed');
    const { access_token: accessToken } = await tokenResponse.json();
    if (!accessToken) throw new Error('Gmail OAuth token missing');

    const message = buildMessage({
      data,
      from: config.gmailUser,
      to: config.contactRecipient
    });
    const sendResponse = await fetchImpl('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw: encodeBase64Url(message) }),
      signal: AbortSignal.timeout(8000)
    });
    if (!sendResponse.ok) throw new Error('Gmail API send failed');
  };
};
