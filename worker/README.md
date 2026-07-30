
# Worker do formulÃ¡rio de contacto

API gratuita para Cloudflare Workers. Valida os pedidos, verifica Cloudflare
Turnstile e envia a mensagem para `geral@clavedenumeros.pt` atravÃ©s da Gmail
API.

## ProteÃ§Ãµes

- CORS limitado aos dois hosts de `clavedenumeros.pt`;
- validaÃ§Ã£o e limite de 16 KB por pedido;
- honeypot invisÃ­vel;
- Turnstile;
- limite de cinco tentativas por IP em dez minutos, por isolate;
- logs sem conteÃºdo do formulÃ¡rio;
- segredos armazenados pelo Cloudflare, nunca no GitHub.

O limite em memÃ³ria Ã© uma defesa auxiliar e nÃ£o Ã© global entre todos os
isolates. Turnstile e honeypot sÃ£o as defesas principais. Se houver abuso real,
pode acrescentar-se uma Rate Limiting Rule ou armazenamento coordenado.

## Criar o Worker sem faturaÃ§Ã£o

1. Criar uma conta gratuita em <https://dash.cloudflare.com/>.
2. Em **Workers & Pages**, criar um Worker chamado `clave-contact-api`.
3. Instalar o Wrangler ou usar o editor do painel.
4. Adicionar os segredos:

```sh
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put GMAIL_CLIENT_ID
npx wrangler secret put GMAIL_CLIENT_SECRET
npx wrangler secret put GMAIL_REFRESH_TOKEN
```

As variÃ¡veis pÃºblicas jÃ¡ estÃ£o em `wrangler.jsonc`. Nenhum dos quatro valores
secretos deve ser escrito nesse ficheiro.

## Publicar uma versÃ£o de teste

```sh
cd worker
npx wrangler login
npx wrangler deploy
```

O comando devolve um endereÃ§o `https://clave-contact-api.<conta>.workers.dev`.
Testar primeiro:

```text
GET https://...workers.dev/health
```

Depois definir em `assets/contact-config.js`:

- `apiUrl`: URL terminada em `/contact`;
- `turnstileSiteKey`: chave pÃºblica do widget Turnstile.

## Gmail

O cliente OAuth deve pertencer a um projeto Google que tenha a Gmail API
ativada, mas nÃ£o Ã© necessÃ¡rio ativar faturaÃ§Ã£o. O refresh token deve ter apenas
o Ã¢mbito:

```text
https://www.googleapis.com/auth/gmail.send
```

## Testes

```sh
cd worker
npm test
```

Os placeholders do frontend mantÃªm o envio desativado atÃ© Ã  configuraÃ§Ã£o final.
