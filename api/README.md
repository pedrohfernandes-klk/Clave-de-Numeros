# API do formulÃ¡rio de contacto

ServiÃ§o Node.js preparado para Google Cloud Run. Recebe pedidos do formulÃ¡rio,
valida os dados, verifica Cloudflare Turnstile e entrega a mensagem em
`geral@clavedenumeros.pt` atravÃ©s da Gmail API.

## SeguranÃ§a incluÃ­da

- CORS limitado a `https://clavedenumeros.pt` e `https://www.clavedenumeros.pt`;
- validaÃ§Ã£o e limites de tamanho;
- honeypot invisÃ­vel;
- Cloudflare Turnstile;
- limite por IP, por instÃ¢ncia, como defesa adicional;
- respostas sem dados pessoais e logs sem conteÃºdo do formulÃ¡rio;
- OAuth do Gmail exclusivamente em variÃ¡veis/Secret Manager.

O rate limit em memÃ³ria nÃ£o Ã© global entre instÃ¢ncias. Para limites globais
rigorosos, colocar o serviÃ§o atrÃ¡s de um HTTPS Load Balancer com Cloud Armor ou
usar uma store partilhada. Para o trÃ¡fego normal deste site, Turnstile,
honeypot e o limite local formam uma proteÃ§Ã£o proporcional.

## VariÃ¡veis

| Nome | Tipo | Exemplo |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | configuraÃ§Ã£o | `https://clavedenumeros.pt,https://www.clavedenumeros.pt` |
| `CONTACT_RECIPIENT` | configuraÃ§Ã£o | `geral@clavedenumeros.pt` |
| `GMAIL_USER` | configuraÃ§Ã£o | conta Workspace autorizada a enviar |
| `GMAIL_CLIENT_ID` | segredo | cliente OAuth do Google |
| `GMAIL_CLIENT_SECRET` | segredo | segredo OAuth |
| `GMAIL_REFRESH_TOKEN` | segredo | refresh token com Ã¢mbito `gmail.send` |
| `TURNSTILE_SECRET` | segredo | chave secreta Turnstile |
| `RATE_LIMIT_MAX` | opcional | `5` |
| `RATE_LIMIT_WINDOW_MS` | opcional | `600000` |

Nunca guardar os quatro segredos num ficheiro `.env` versionado.

## PreparaÃ§Ã£o no Google Cloud

1. Criar/selecionar um projeto e ativar Cloud Run, Cloud Build, Artifact
   Registry, Secret Manager e Gmail API.
2. Criar credenciais OAuth e obter uma Ãºnica vez um refresh token da conta
   Workspace que enviarÃ¡ as mensagens, com o Ã¢mbito
   `https://www.googleapis.com/auth/gmail.send`.
3. Criar os segredos:

```sh
printf %s "$GMAIL_CLIENT_ID" | gcloud secrets create gmail-client-id --data-file=-
printf %s "$GMAIL_CLIENT_SECRET" | gcloud secrets create gmail-client-secret --data-file=-
printf %s "$GMAIL_REFRESH_TOKEN" | gcloud secrets create gmail-refresh-token --data-file=-
printf %s "$TURNSTILE_SECRET" | gcloud secrets create turnstile-secret --data-file=-
```

4. Criar uma conta de serviÃ§o dedicada e conceder-lhe apenas
   `roles/secretmanager.secretAccessor` nos quatro segredos.

## Deployment de revisÃ£o

O comando cria uma revisÃ£o Cloud Run, mas nÃ£o altera o GitHub Pages:

```sh
gcloud run deploy clave-contact-api \
  --source api \
  --region europe-west1 \
  --allow-unauthenticated \
  --service-account clave-contact-api@PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars "ALLOWED_ORIGINS=https://clavedenumeros.pt,https://www.clavedenumeros.pt,CONTACT_RECIPIENT=geral@clavedenumeros.pt,GMAIL_USER=geral@clavedenumeros.pt" \
  --set-secrets "GMAIL_CLIENT_ID=gmail-client-id:latest,GMAIL_CLIENT_SECRET=gmail-client-secret:latest,GMAIL_REFRESH_TOKEN=gmail-refresh-token:latest,TURNSTILE_SECRET=turnstile-secret:latest"
```

ApÃ³s o deployment:

1. testar `GET /health`;
2. definir o URL `.../contact` em `assets/contact-config.js`;
3. testar no domÃ­nio de produÃ§Ã£o;
4. confirmar receÃ§Ã£o, `Reply-To` e ausÃªncia de dados nos logs.

## Testes locais

```sh
cd api
npm install
npm test
```

O frontend fica desativado enquanto o URL da API e a chave pÃºblica Turnstile
forem placeholders, evitando envios acidentais antes da revisÃ£o.
