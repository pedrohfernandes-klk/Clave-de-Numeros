import http from 'node:http';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createGmailSender } from './mailer.js';

const config = loadConfig();
const sendMail = await createGmailSender(config);
const server = http.createServer(createApp({ config, sendMail }));

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Contact API listening on port ${config.port}`);
});
