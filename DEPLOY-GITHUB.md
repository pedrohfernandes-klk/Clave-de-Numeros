# Publicar no GitHub Pages

Esta versão está preparada para funcionar:

- num domínio próprio, por exemplo `https://www.clavedenumeros.pt/`;
- num site de projecto GitHub Pages, por exemplo `https://UTILIZADOR.github.io/NOME-DO-REPOSITORIO/`.

A pasta `/pt/` **não é um problema**. O GitHub Pages precisa apenas de um `index.html` na raiz. Esse ficheiro existe e redirecciona, de forma relativa, para `pt/`, preservando automaticamente o nome do repositório.

## Método recomendado

1. Criar um repositório novo no GitHub.
2. Descompactar o ZIP e carregar **o conteúdo da pasta**, não a pasta exterior.
3. Confirmar que `index.html`, `404.html`, `.nojekyll`, `assets/` e `pt/` ficam na raiz do repositório.
4. No GitHub, abrir **Settings → Pages**.
5. Em **Build and deployment**, escolher **Deploy from a branch**.
6. Seleccionar a branch `main` e a pasta `/(root)`.
7. Guardar e aguardar a publicação.

## Estrutura correcta na raiz

```text
index.html
404.html
.nojekyll
assets/
pt/
robots.txt
sitemap.xml
```

## Antes da publicação definitiva

- Substituir o endpoint provisório do formulário em `pt/contactos.html`.
- Substituir ou remover testemunhos fictícios.
- Confirmar telefone, email, LinkedIn, horário, NIF e CAE.
- Publicar Política de Privacidade e Aviso Legal.
- Se for usado domínio próprio, configurar o domínio em **Settings → Pages → Custom domain**. O GitHub criará o ficheiro `CNAME` automaticamente.

## Idiomas futuros

Quando existirem as versões espanhol, inglês e francês, criar as pastas:

```text
/es/
/en/
/fr/
```

O `index.html` da raiz poderá continuar a encaminhar para `/pt/` ou ser substituído por uma página de selecção de idioma.
