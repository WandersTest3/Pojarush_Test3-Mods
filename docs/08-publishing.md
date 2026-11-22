# 8. Publishing to the Pojarush Mods site

Site: https://wanderstest3.github.io/Pojarush_Test3-Mods/ . It is static (GitHub Pages) and the "database" is this repository.
How the machinery works is in the [repository README](../README.md); this page is what a mod author or an AI needs to prepare.

## The easy way: the upload page

1. Build and check the mod ([page 2](02-setup-and-workflow.md)): `cargo horizon-mod check` must pass.
2. Open **Upload** on the site and sign in with GitHub. The site forks this repository into your account and opens a pull
   request.
3. Pick the `.hmod`, the minimum Pojarush version, a short summary, a license, up to 3 categories, an optional icon, up to 5
   gallery images and a description. Confirm that the mod does not violate the rights of any ported Java mod.
4. The **Publish** Action validates the file with Horizon's own code, creates the GitHub Release `<id>-<version>` holding the
   `.hmod`, writes `registry/<id>.json` and the images, comments the result on the pull request and closes it. The
   **Site** Action then publishes the page.

## The pull request, by hand

A submission is a pull request that adds **only** files under `submissions/<id>/` (the folder must be named after the mod id):

| File | Required | Notes |
|---|---|---|
| `mod.hmod` | yes | at most 5 MiB |
| `submission.json` | yes | metadata, below (at most 64 KiB) |
| `description.md` | no | UTF-8 text, at most 20,000 characters kept |
| `icon.png` / `.jpg` / `.webp` | no | at most 2 MiB and at least 8x8 px; the icon in the `.hmod` is used when absent |
| `description-image.<ext>` | no | image for the description |
| `gallery-1.<ext>` ... `gallery-5.<ext>` | no | at most 5, each at most 8 MiB (`png`, `jpg`, `jpeg`, `webp`) |

`submission.json` keys the Publish Action reads:

```json
{
  "pojarush": "2.0.0",
  "summary": "One line, at most 160 characters.",
  "license": "Mod Test3 License V1.0",
  "source": "https://github.com/you/my-mod",
  "categories": ["hud", "utility"],
  "changelog": "What changed in this version."
}
```

- `pojarush` is **required** and must be one of `pojarushVersions` in `site/config.json` (currently `2.0.0`): the minimum
  Pojarush version the mod works from.
- `summary` falls back to the manifest `description`; it is required one way or the other.
- `license` falls back to the manifest `license`, then `MIT`.
- `source` falls back to the manifest `[contact].sources`, then `homepage`.
- `categories` are filtered to the allowed list and cut to 3: `adventure`, `decoration`, `equipment`, `food`,
  `game-mechanics`, `hud`, `library`, `magic`, `mobs`, `optimization`, `social`, `storage`, `technology`,
  `transportation`, `utility`, `worldgen`.
- `changelog` at most 6000 characters.
- Gallery entries and the featured image are handled by the upload page; for a hand-made pull request, send the
  `gallery-N` files and name them in `gallery` / `featured` as `edit.json` does for edits.

## Rules the Publish Action enforces

- `id` matches `[a-z0-9_]{1,64}` and the folder name; `version` uses letters, digits, `.`, `-`, `_`, `+`.
- A mod is owned by the GitHub user who first publishes it. **Only owners can send new versions**, and a version that is
  already published **cannot be sent again**: raise `version` in `horizon-mod.toml`.
- The release tag `<id>-<version>` must not exist yet.
- The `.hmod` must be readable by Horizon's code (`hmod-inspect`): a valid manifest, content or `mod.wasm`.
- Only files under `submissions/<id>/` or `edits/<id>/` may be in the pull request.

## Editing an existing mod

`edit.html?id=<id>` on the site (owners only) sends a pull request with `edits/<id>/edit.json` (and images or description).
It can change the summary, license, categories, gallery, featured image and description, and delete versions
(`delete_versions`) or the whole page (`delete_mod`). No new release is created.

## Removing a mod or a file

Add an entry to `registry/revoked.json` (maintainer only): `{ "id": "mod_id", "reason": "...", "date": "YYYY-MM-DD" }`; with
`"sha256"` only that file is withdrawn.

## Installing from the site into the launcher

The launcher's **Packs** page downloads from the Pojarush Mods site and Horizon's registry. The registry index is
`index.json` on the site, in the schema-1 format of Horizon's registry. A Horizon build can read it with
`HORIZON_MOD_INDEX=https://wanderstest3.github.io/Pojarush_Test3-Mods/index.json`.

## Pre-flight list before sending

- [ ] `cargo horizon-mod check target/horizon-mod/<id>.hmod` passes; size at most 5 MiB.
- [ ] `version` higher than the last published one; `id` unchanged.
- [ ] `minecraft = "26.3"`, `license` set, `[contact]` filled, `[translations.pt_br]` present.
- [ ] Icon at least 8x8 (a 128x128 PNG is ideal) and at most 2 MiB.
- [ ] The summary is one honest line; the description says what the mod does **not** do.
- [ ] No Mojang assets, no secrets, nothing copied without a license.
