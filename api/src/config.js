const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const csv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export const loadConfig = () => ({
  port: Number(process.env.PORT || 8080),
  allowedOrigins: csv(process.env.ALLOWED_ORIGINS || 'https://clavedenumeros.pt,https://www.clavedenumeros.pt'),
  turnstileSecret: required('TURNSTILE_SECRET'),
  gmailClientId: required('GMAIL_CLIENT_ID'),
  gmailClientSecret: required('GMAIL_CLIENT_SECRET'),
  gmailRefreshToken: required('GMAIL_REFRESH_TOKEN'),
  gmailUser: required('GMAIL_USER'),
  contactRecipient: required('CONTACT_RECIPIENT'),
  maxBodyBytes: Number(process.env.MAX_BODY_BYTES || 16384),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 600000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 5)
});
