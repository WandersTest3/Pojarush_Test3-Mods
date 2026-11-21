# Pojarush Mods

A site for `.hmod` mods for the Pojarush launcher: https://wanderstest3.github.io/Pojarush_Test3-Mods/

## How it works

- The site (`site/`) is static and hosted on GitHub Pages.
- To submit a mod, you sign in with GitHub. The site forks this repository into your account and opens a pull request with `submissions/<id>/`.
- The `Publish` Action validates the `.hmod` with Horizon's own code (`tools/hmod-inspect`, built from `WandersTest3/Pojarush_Test3`), creates the Release `<id>-<version>` with the file, writes `registry/<id>.json` and the images in `site/mods/<id>/`, comments the result and closes the pull request. Then it publishes the site.
- Only a mod's owners (`owners`) can submit new versions of it. A published version cannot be submitted again.
- `index.json` follows the schema 1 format of Horizon's registry (`docs/api/mod-index.md`). The launcher can read this index with `HORIZON_MOD_INDEX=https://wanderstest3.github.io/Pojarush_Test3-Mods/index.json`.
- The `Site` Action publishes the site on every push to `main`, every 6 hours (to refresh download counts) and when called by `Publish`.

## Setup (one time)

1. **Pages:** Settings > Pages > Build and deployment > Source: **GitHub Actions**. Then, in Actions > Site, use **Run workflow**.
2. **OAuth App:** github.com > Settings > Developer settings > OAuth Apps > New OAuth App.
   - Homepage URL: `https://wanderstest3.github.io/Pojarush_Test3-Mods/`
   - Authorization callback URL: `https://wanderstest3.github.io/Pojarush_Test3-Mods/callback.html`
   - Copy the **Client ID** and generate a **Client secret**.
3. **Cloudflare Worker** (free plan): dash.cloudflare.com > Workers & Pages > Create > Import a repository, and pick this repository. The Worker is named `pojarush-test3-mods` and is deployed on every push, using `wrangler.toml` (which already defines `CLIENT_ID` and `ALLOWED_ORIGIN`). In the Worker, under Settings > Runtime variables and secrets > Add variable, create `CLIENT_SECRET` with the Client secret and tick **Secret**. To check, open `https://pojarush-test3-mods.wanderstest3.workers.dev/status`: it must show `"secret_set":true`.
4. In `site/config.json`, `oauthClientId` is the Client ID and `authWorker` is the Worker address.

Without steps 2 to 4, the site still works for browsing and downloading mods, and the upload page says that uploading is not enabled yet.

## Removing a mod or file

Add an entry to `registry/revoked.json` (the `revoked` format of schema 1):

```json
[{ "id": "mod_id", "reason": "Reason", "date": "2026-11-20" }]
```

With `"sha256"`, only that file is withdrawn; without it, the whole mod.

## Limits

Defined in `site/config.json`: `.hmod` up to 5 MiB, icon up to 2 MiB (at least 8×8 px), images up to 8 MiB, up to 5 gallery images, up to 3 categories.

## Pages, edits and profiles

- `mod.html?id=<id>`: description, gallery (up to 5 images), changelog, versions and details. The image starred in the gallery becomes the card banner.
- `user.html?u=<login>`: the creator's profile with all of their mods.
- `edit.html?id=<id>`: mod owners only. Sends a pull request with `edits/<id>/edit.json` (and images/description); the bot checks the owner and updates the registry without creating a release.
- Uploading asks for the minimum Pojarush_Test3 version (`pojarushVersions` in `site/config.json`, currently only `2.0.0`).
- The Discord link and the footer notices come from `site/config.json` (`discord`) and the texts in `assets/js/core.js` and `assets/js/i18n.js`.
- Deleting: on the edit page, owners can delete a version (`delete_versions`) or the whole page (`delete_mod`). The bot removes the registry entry and images and, after the commit, deletes the matching releases.
- The bottom bar has 3 buttons: home, upload mod and profile (profile opens `user.html?u=<login>`, where the sign-out button is).
