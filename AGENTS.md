# Instructions for AI assistants

This repository is the Pojarush Mods site **and** the mod tutorial. If you were asked to make, port, fix or evaluate a
mod for the Pojarush launcher, read `docs/10-ai-playbook.md` first, then only the pages you need from `docs/README.md`.

Essentials:

- Never invent functions, capabilities, files or compatibility. The exact API is `docs/06-api-cheatsheet.md` and
  `sdk/horizon-mod-sdk/`.
- Never claim you built, checked or tested something you did not run. Say what was not tested on a device.
- No Mojang assets; respect licenses; do not invent or swap a license.
- Build with `cargo horizon-mod build`, then `cargo horizon-mod check <file.hmod>` and `cargo horizon-mod test`.
- Raise `version` on every release (last digit first).
- Site and Action code is in `site/`, `scripts/`, `worker/` and `.github/`: do not change it when asked to make a mod.
