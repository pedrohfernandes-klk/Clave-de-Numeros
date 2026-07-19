# Memo para o próximo dev — Clave de Números

## Objetivo

Concluir e estabilizar a versão atual do site da Clave de Números, preservando a direção já aprovada: uma experiência clara, sóbria, profissional, próxima e visualmente interessante, sem cair em clichés de contabilidade ou em excesso decorativo.

O site está publicado a partir da branch `main` do repositório `pedrohfernandes-klk/Clave-de-Numeros`.

## Direção visual consolidada

A solução visual passou a assentar em quatro componentes coordenados:

1. uma ilustração principal por página;
2. um conjunto modular de pequenos elementos gráficos;
3. miniaturas próprias para os guias;
4. animação discreta e funcional.

Foi evitado o uso de fotografias locais como elementos editoriais. O Google Maps integrado foi mantido na página de contactos.

A linguagem visual deve continuar a ser:

- clara e minimalista;
- técnica sem parecer fria;
- institucional sem parecer genérica;
- com boa hierarquia tipográfica;
- sem pessoas ilustradas, ícones banais ou fundos fotográficos;
- sem animações vistosas, parallax forte ou movimento permanente.

## Alterações editoriais recentes

### Homepage

Foram afinados vários títulos e textos:

- `Contas claras. Decisões simples.`
- `Adaptamo-nos à sua realidade.`
- `Mais clareza, menos ruído.`
- `Uma colaboração baseada na confiança.`
- `Obrigações e decisões, com clareza.`
- `Respostas e artigos sobre contabilidade, fiscalidade, ENI, IRS e negócios online.`
- separador da secção 05: `Porquê a Clave`.

O texto do método, na fase `Acompanhar`, passou para:

> Processamos o trabalho contabilístico, fiscal, salarial ou administrativo contratado com regularidade e comunicamos o que é necessário em tempo útil.

A origem da empresa foi condensada e clarificada, reforçando a evolução desde 2011, a constituição em 2013 e as relações duradouras com os clientes.

### Serviços e perfis

A introdução de Serviços foi revista para explicitar contabilidade, fiscalidade e gestão, bem como enquadramento, dimensão, obrigações fiscais e forma de trabalho.

A secção `Para quem` passou a utilizar uma formulação mais direta e centrada na realidade do cliente.

### Sobre nós

O hero foi simplificado para `Uma empresa de relações.`

A secção de equipa foi transformada num sistema de cartões expansíveis:

- cartão fechado com fotografia, nome, cargo, resumo e botão `Saber mais`;
- modal leve com fotografia maior, cargo e três parágrafos curtos;
- grelha de duas colunas em desktop;
- composição vertical em mobile;
- fecho por botão, clique no backdrop e tecla Escape através do elemento nativo `dialog`;
- foco devolvido ao botão que abriu o perfil.

Arquivos principais:

- `assets/team-profiles.js`
- `assets/team-overrides.css`
- `pt/sobre.html`
- `assets/equipa/isabel-photo.css`
- `assets/equipa/gisela-photo.css`
- `assets/equipa/ana-photo.css`
- `assets/equipa/tatiana-photo.css`

## Equipa e textos atuais

### Isabel Monteiro

Cargo:

`Fundadora e Contabilista Certificada`

Resumo atual:

> Dirige a Clave de Números e acompanha diretamente os clientes, articulando o conhecimento técnico com a leitura global de cada atividade.

O texto expandido foi reforçado para lhe dar a autoridade adequada enquanto fundadora, responsável técnica e pessoa com visão transversal sobre os clientes e processos.

### Gisela Oliveira

Cargo:

`Técnica de Contabilidade · Coordenação operacional`

O último parágrafo passou para:

> Articulada, organizada e fiável, contribui para que cada processo avance com clareza, método e rigor.

### Ana Fernandes

Cargo:

`Administrativa de Contabilidade`

Foco: ENI, trabalhadores independentes, IRS, organização documental e obrigações fiscais.

### Tatiana dos Santos

Cargo:

`Assistente Administrativa`

Foco: gestão documental, tarefas administrativas e comunicações do dia a dia.

## Fotografias da equipa

As quatro fotografias foram substituídas por versões mais recentes e tratadas para maior consistência visual.

A fotografia de Isabel apresentou um problema de renderização após a primeira atualização. Foi corrigida substituindo o conteúdo da folha `assets/equipa/isabel-photo.css` por uma imagem WebP incorporada em `data URI`, com regras explícitas de `background-size`, `background-position` e `background-repeat`.

Verificar obrigatoriamente:

- fotografia visível no cartão fechado;
- fotografia visível no modal;
- enquadramento adequado em desktop e mobile;
- ausência de cache antigo no GitHub Pages;
- consistência de recorte entre as quatro pessoas.

Se o problema reaparecer, a solução recomendada é abandonar definitivamente imagens incorporadas em CSS e passar para ficheiros WebP reais em `assets/equipa/`, usando `<img>` com `object-fit: cover`, dimensões declaradas e `loading="lazy"`. Esta seria uma melhoria estrutural importante.

## Problemas técnicos a corrigir na próxima passagem

### 1. Remover conteúdo editorial injetado por JavaScript

Muitos textos principais são atualmente substituídos em `assets/script.js`. Isto dificulta manutenção, SEO, testes e tradução.

Recomendação:

- colocar o texto final diretamente nos ficheiros HTML;
- deixar o JavaScript apenas para comportamento;
- retirar progressivamente os blocos `setText(...)` de `assets/script.js`.

### 2. Rever carregamento dos perfis expansíveis

`assets/team-profiles.js` é atualmente carregado dinamicamente a partir de `assets/script.js` quando existe `#equipa`.

Recomendação:

- incluir o script diretamente no final de `pt/sobre.html` e `en/about.html`;
- usar `defer`;
- evitar criação dinâmica de scripts;
- garantir que a versão inglesa recebe conteúdo equivalente e não texto português.

### 3. Passar fotografias de CSS para HTML

As fotografias estão armazenadas como grandes `data URI` em ficheiros CSS separados. Funciona, mas é pouco robusto.

Recomendação:

- gerar quatro WebP reais, idealmente entre 600×750 e 800×1000;
- usar qualidade WebP 75–85;
- colocar as imagens em `assets/equipa/`;
- usar `<img width height loading="lazy" decoding="async">`;
- aplicar `object-fit: cover` e `object-position` individualmente.

Benefícios:

- cache correto;
- HTML mais acessível;
- debugging simples;
- CSS mais leve;
- melhor controlo de LCP e CLS.

### 4. Consolidar CSS

O sistema visual está distribuído entre:

- `assets/styles.css`
- `assets/visual-system.css`
- `assets/team-overrides.css`
- `assets/local-photos.css`
- quatro folhas de fotografia.

Recomendação:

- manter `styles.css` como base;
- integrar regras visuais estabilizadas num único ficheiro de componentes;
- deixar `team-overrides.css` apenas para a secção de equipa;
- remover regras obsoletas e duplicadas;
- documentar tokens de espaçamento, raio, sombra e cor.

### 5. Corrigir dados institucionais remanescentes

O CAE correto é:

`69200 — Contabilidade, auditoria e consultoria fiscal`

Existem páginas cujo rodapé ainda apresenta `69201`. Corrigir em todas as páginas PT e EN.

### 6. Rever versão inglesa

A versão inglesa foi alinhada conceptualmente, mas nem todas as páginas são traduções finais linha a linha.

Verificar:

- textos da homepage;
- cartões expansíveis da equipa;
- rótulos e botões;
- metadados e dados estruturados;
- consistência entre `Porquê a Clave` e `Why Clave`;
- terminologia de `sole trader`, `freelancer`, `personal income tax` e `Certified Accountant`.

### 7. Verificação funcional e acessibilidade

Executar uma passagem manual em Chrome, Firefox e Safari, desktop e mobile.

Testar:

- menu mobile;
- carrossel de testemunhos;
- modal da equipa;
- foco de teclado;
- fecho por Escape;
- scroll bloqueado durante o modal;
- Google Maps;
- formulário;
- `prefers-reduced-motion`;
- contraste;
- ausência de conteúdo cortado em 320 px de largura.

## Melhorias futuras recomendadas

### Sistema de ilustrações

Consolidar a gramática visual das ilustrações principais:

- mesma espessura de linha;
- mesma família de formas;
- variação cromática contida;
- composição diferente em cada página;
- sem repetir exatamente o mesmo enquadramento.

### Guias

As miniaturas dos guias devem passar de padrões CSS genéricos para pequenas capas SVG próprias, uma por tema, mantendo a mesma grelha e linguagem visual.

### Ritmo das páginas

Melhorar o ritmo sem acrescentar decoração:

- alternar blocos densos e abertos;
- reduzir secções repetitivas em grelha;
- criar mais variação entre duas colunas, largura integral e cartões;
- controlar melhor o comprimento de linha;
- reforçar espaços de pausa visual.

### SEO e estrutura

- colocar todo o conteúdo editorial no HTML;
- rever títulos e meta descriptions;
- rever dados estruturados `AccountingService`, `Person`, `FAQPage` e breadcrumbs;
- garantir `hreflang` correto;
- corrigir links antigos de Blogue removidos apenas por JavaScript.

### Desempenho

- substituir `data URI` de imagens por ficheiros reais;
- verificar peso total de CSS e JavaScript;
- eliminar regras e scripts mortos;
- usar cache busting apenas quando necessário;
- medir LCP, CLS e INP em mobile.

## Princípios que não devem ser alterados

- PT-PT, AO90;
- sem `você`;
- tom técnico, claro e próximo;
- sem marketing vazio;
- sem fotografias genéricas de stock;
- sem excesso de animação;
- fotografias da equipa discretas e equilibradas;
- testemunhos integrais e com a mesma hierarquia;
- três testemunhos visíveis em desktop;
- mapa Google integrado na página de contactos;
- design minimalista, branco predominante e sem clichés empresariais.

## Prioridade de conclusão

1. confirmar que a fotografia de Isabel aparece em cartão e modal;
2. testar os quatro perfis expansíveis em mobile e desktop;
3. corrigir CAE 69200 em todo o site;
4. mover textos injetados por JavaScript para HTML;
5. substituir as fotografias em CSS por ficheiros WebP reais;
6. alinhar completamente a versão inglesa;
7. realizar auditoria final de acessibilidade, desempenho e responsividade.
