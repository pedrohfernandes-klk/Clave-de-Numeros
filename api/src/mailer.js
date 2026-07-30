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

export const createGmailSender = async (config) => {
  const { google } = await import('googleapis');
  const auth = new google.auth.OAuth2(config.gmailClientId, config.gmailClientSecret);
  auth.setCredentials({ refresh_token: config.gmailRefreshToken });
  const gmail = google.gmail({ version: 'v1', auth });

  return async (data) => {
    const message = buildMessage({
      data,
      from: config.gmailUser,
      to: config.contactRecipient
    });
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodeBase64Url(message) }
    });
  };
};
