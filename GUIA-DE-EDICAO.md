# Guia de edição · Clave de Números v20

Este guia explica como a equipa edita o site sem conhecimentos técnicos avançados. O site é HTML puro: não há build, base de dados nem dependências — qualquer editor de texto serve (recomendado: VS Code, gratuito).

## Como está organizado

```
/index.html          → redireciona de forma relativa para /pt/; compatível com GitHub Pages
/robots.txt          → instruções para motores de busca
/sitemap.xml         → mapa do site (atualizar ao publicar artigos)
/assets/             → estilos, script, logótipos e imagens (raramente se edita)
/pt/                 → TODO o conteúdo em português
   index.html        → homepage
   servicos.html     → fichas de serviço
   para-empresas.html → página de público: empresas, PME, ENI e independentes (2 sub-grupos internos)
   para-particulares.html → página de público: particulares
   sobre.html        → história, valores, equipa
   guias.html        → perguntas frequentes
   contactos.html    → formulário e contactos
   blogue/           → índice, artigos e modelo
/es/ /en/ /fr/       → (futuro) versões localizadas, com a mesma estrutura
```

## Editar texto

Abrir o ficheiro `.html` da página e procurar os comentários `✏️ EDITAR`. Tudo o que está entre as tags (`<h1>…</h1>`, `<p>…</p>`) é texto editável. Regras:

1. Nunca apagar as tags — só o texto entre elas.
2. Escrever em PT-PT com AO90, sem "você" e sem brasileirismos.
3. Depois de editar, abrir o ficheiro no browser e confirmar que nada partiu.

Os comentários `⚠️ CONFIRMAR` assinalam dados por validar com a cliente (telefone, horário, NIF/CAE, LinkedIn). Devem ser resolvidos antes de publicar.

## Publicar um artigo no blogue (5 minutos)

1. Duplicar `/pt/blogue/_modelo-artigo.html` e renomear: minúsculas, hífens, sem acentos (ex.: `iva-negocios-online.html`).
2. Preencher os 10 campos marcados com ✏️ dentro do ficheiro (título, descrição, data, texto).
3. Em `/pt/blogue/index.html`, copiar um cartão `<a class="post-card">…</a>` para o topo da lista e apontar para o novo ficheiro.
4. Acrescentar o URL do artigo ao `/sitemap.xml`.

Regras editoriais: o primeiro parágrafo começa sempre por "Resposta direta:", os subtítulos H2 são perguntas ou afirmações claras, e todo o artigo liga a pelo menos um serviço e à página de contactos.

## Cabeçalho e rodapé

São iguais em todas as páginas. Se editar o menu ou o rodapé numa página, replicar a alteração em todas (índice, serviços, sobre, guias, contactos, blogue e artigos). Sugestão: usar "localizar e substituir em todos os ficheiros" no VS Code.

## Formulário de contacto

O formulário precisa de um serviço externo de receção (o site é estático). Passos:

1. Criar conta num serviço como Formspree (formspree.io) ou equivalente europeu.
2. Copiar o endereço do formulário (ex.: `https://formspree.io/f/abcd1234`).
3. Em `/pt/contactos.html`, substituir `SUBSTITUIR-ENDPOINT` por esse endereço.
4. Testar um envio real antes de publicar.

## Imagens

- Abstractos: SVG em `/assets/` (leves, não editar sem designer).
- Equipa: guardar em `/assets/equipa/` em formato WebP, ~440×550 px, e seguir as instruções no comentário `✏️ EDITAR EQUIPA` em `sobre.html`. Todas as imagens devem ter `alt` descritivo e `width`/`height` definidos.
- Proibido: fotografia de stock, calculadoras, apertos de mão, escritórios genéricos.

## Idiomas (próxima fase)

Quando as versões ES/EN/FR estiverem traduzidas por localização editorial (nunca tradução automática):

1. Duplicar a pasta `/pt/` para `/es/`, `/en/`, `/fr/` e substituir todo o texto, metadata e schema.
2. No selector de idioma de cada página, trocar os `<span>` por `<a>` apontando para a página equivalente no outro idioma.
3. Ativar os blocos `hreflang` comentados no `<head>` de cada página.
4. Criar sitemaps por idioma e atualizar o `robots.txt`.

## Antes de cada publicação (checklist)

- [ ] Site servido em HTTPS com certificado SSL válido (configurar no alojamento)
- [ ] Morada correta em todas as páginas: Rua Cidade de Ponta Delgada, Loja 136 · 2870-261 Montijo
- [ ] Sem testemunhos fictícios (secção "Confiança" de sobre.html substituída ou removida)
- [ ] Sem comentários ⚠️ CONFIRMAR por resolver
- [ ] Formulário testado com envio real
- [ ] Schema validado em search.google.com/test/rich-results
- [ ] Performance verificada em pagespeed.web.dev (alvo: LCP < 2,5 s em mobile)
- [ ] Navegação por teclado testada (Tab percorre tudo, focus visível)
- [ ] Política de Privacidade e Aviso Legal publicados (links do rodapé)


## Publicação no GitHub Pages

Consultar `DEPLOY-GITHUB.md`. O `index.html` da raiz é obrigatório e já está configurado para encaminhar para `pt/` sem perder o caminho do repositório. Não usar um endereço absoluto como `/pt/` no redireccionamento quando o site estiver alojado num repositório de projecto.
