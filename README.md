# Pojarush Mods

Site de mods `.hmod` para o launcher Pojarush: https://wanderstest3.github.io/Pojarush_Test3-Mods/

## Como funciona

- O site (`site/`) é estático e fica no GitHub Pages.
- Quem envia um mod entra com o GitHub. O site cria um fork deste repositório na conta da pessoa e abre um pull request com `submissions/<id>/`.
- A Action `Publish` valida o `.hmod` com o código do próprio Horizon (`tools/hmod-inspect`, compilado a partir de `WandersTest3/Pojarush_Test3`), cria a Release `<id>-<versão>` com o arquivo, grava `registry/<id>.json` e as imagens em `site/mods/<id>/`, comenta o resultado e fecha o pull request. Depois publica o site.
- Só os donos de um mod (`owners`) podem enviar novas versões dele. Uma versão já publicada não pode ser enviada de novo.
- `index.json` segue o formato schema 1 do registro do Horizon (`docs/api/mod-index.md`). O launcher pode ler este índice com `HORIZON_MOD_INDEX=https://wanderstest3.github.io/Pojarush_Test3-Mods/index.json`.
- A Action `Site` publica o site a cada push na `main`, a cada 6 horas (para atualizar os downloads) e quando chamada pela `Publish`.

## Configuração (uma vez)

1. **Pages:** Settings > Pages > Build and deployment > Source: **GitHub Actions**. Depois, em Actions > Site, use **Run workflow**.
2. **OAuth App:** github.com > Settings > Developer settings > OAuth Apps > New OAuth App.
   - Homepage URL: `https://wanderstest3.github.io/Pojarush_Test3-Mods/`
   - Authorization callback URL: `https://wanderstest3.github.io/Pojarush_Test3-Mods/callback.html`
   - Copie o **Client ID** e gere um **Client secret**.
3. **Cloudflare Worker** (plano gratuito): dash.cloudflare.com > Workers & Pages > Create > Import a repository, escolha este repositório. O Worker se chama `pojarush-test3-mods` e é publicado a cada push, usando `wrangler.toml` (que já define `CLIENT_ID` e `ALLOWED_ORIGIN`). No Worker, em Settings > Runtime variables and secrets > Add variable, crie `CLIENT_SECRET` com o Client secret e marque **Secret**. Para conferir, abra `https://pojarush-test3-mods.wanderstest3.workers.dev/status`: deve mostrar `"secret_set":true`.
4. Em `site/config.json`, `oauthClientId` é o Client ID e `authWorker` é o endereço do Worker.

Sem os passos 2 a 4, o site funciona para ver e baixar mods, e a página de envio mostra que o envio ainda não foi ativado.

## Remover um mod ou arquivo

Adicione uma entrada em `registry/revoked.json` (formato `revoked` do schema 1):

```json
[{ "id": "mod_id", "reason": "Motivo", "date": "2026-11-20" }]
```

Com `"sha256"`, só aquele arquivo é retirado; sem ele, o mod inteiro.

## Limites

Definidos em `site/config.json`: `.hmod` até 5 MiB, ícone até 2 MiB, banner até 8 MiB, até 3 categorias.


## Páginas, edição e perfis

- `mod.html?id=<id>`: descrição, galeria (até 5 imagens), changelog, versões e detalhes. A imagem marcada com a estrela na galeria vira o banner do card.
- `user.html?u=<login>`: perfil do criador com todos os mods dele.
- `edit.html?id=<id>`: só os donos do mod. Envia um pull request com `edits/<id>/edit.json` (e imagens/descrição); o bot valida o dono e atualiza o registro, sem criar release.
- O envio pede a versão mínima do Pojarush_Test3 (`pojarushVersions` em `site/config.json`, hoje só `2.0.0`).
- O link do Discord e os avisos do rodapé vêm de `site/config.json` (`discord`) e dos textos em `assets/js/core.js` e `assets/js/i18n.js`.
- Excluir: na página de edição, os donos podem excluir uma versão (`delete_versions`) ou a página inteira (`delete_mod`). O bot remove o registro e as imagens e, depois do commit, apaga as releases correspondentes.
- A barra inferior tem 3 botões: início, enviar mod e perfil (o perfil abre `user.html?u=<login>`, onde fica o botão de sair).
