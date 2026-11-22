# 2. Setup and workflow

## Tools

```sh
# Rust (https://rustup.rs), then the WebAssembly target (code mods only):
rustup target add wasm32-unknown-unknown

# the mod tool, built from the launcher repository:
git clone https://github.com/WandersTest3/Pojarush_Test3
cargo install --path Pojarush_Test3/horizon/crates/cargo-horizon-mod

# this repository: the SDK copy, the examples and these docs
git clone https://github.com/WandersTest3/Pojarush_Test3-Mods
```

`cargo horizon-mod` is a cargo subcommand. Commands used here:

| Command | What it does |
|---|---|
| `cargo horizon-mod new <path> --template code --sdk-path <dir>` | A code mod from a template (`--template content` for a content mod). `--sdk-path` points at the SDK folder |
| `cargo horizon-mod build` | Writes `target/horizon-mod/<id>.hmod` (a folder without `Cargo.toml` is a content mod) |
| `cargo horizon-mod build --debug` | Same, unoptimised (faster to compile) |
| `cargo horizon-mod check <file.hmod>` | What the registry checks: size, SHA-256, manifest, API level needed, the "May ..." permission lines, and a **trial run** of the mod outside the game. `--json` for machine output |
| `cargo horizon-mod test` | Builds, then runs `tests/*.toml` scripts against the mod with no game |
| `cargo horizon-mod run` | PC only: builds and starts `horizon-client` with the mod turned on |

If `CARGO_TARGET_DIR` is set, the `.hmod` is written to `$CARGO_TARGET_DIR/horizon-mod/`, not `target/horizon-mod/`.

## A new code mod, step by step

```sh
cargo horizon-mod new my-mod --template code --name "My Mod" \
  --sdk-path Pojarush_Test3-Mods/sdk/horizon-mod-sdk
cd my-mod
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/my_mod.hmod
cargo horizon-mod test
```

The template writes `Cargo.toml`, `horizon-mod.toml`, `src/lib.rs` (a `/hello` command), `.gitignore` and
`tests/hello.toml`. The mod id is the folder name lowercased with `_` instead of other characters (`my-mod` -> `my_mod`).
Edit `horizon-mod.toml` ([page 3](03-manifest.md)) and `src/lib.rs` ([page 4](04-code-mods.md)).

For a mod kept in its own repository, depend on the SDK by git (a small repository, so Cargo finds the crate quickly):

```toml
[dependencies]
horizon-mod-sdk = { git = "https://github.com/WandersTest3/Pojarush_Test3-Mods" }
```

Pin a `rev = "<commit>"` for reproducible builds. Do **not** point a git dependency at the launcher repository: it is
very large and Cargo takes many minutes to scan it.

## Test scripts (`tests/*.toml`)

`cargo horizon-mod test` plays steps against the mod in a sandbox with no game. Steps run in order; each can set the
player, the clock, advance ticks or frames, send chat or a command, then `expect` what the mod did.

```toml
[[step]]
expect.commands = ["timer"]            # the commands the mod registered

[[step]]
ticks = 100                            # 100 game ticks (5 seconds)
command = "timer"                      # the player types /timer
expect.feedback = "Session time 00:00:05"

[[step]]
command = "timer reset"
expect.feedback = "Timer reset"
```

Step keys: `reload`, `title-screen`, `player = { x, y, z, yaw, pitch, health, food, dimension }`,
`clock = { game-time, day-time }`, `ticks`, `frames`, `chat`, `command`. `expect` keys: `commands`, `chat` (lines shown by
`chat::show`, in order), `feedback` (a command's returned text), `error` (a command's red error), `panel` and `corner`
(a `hud::set_panel` panel), `stopped` (the mod is turned off with a reason containing this text).

What the sandbox does **not** do: it does not simulate key presses, the inventory, the screen or `render`/`ui` output.
A test can prove a command, a tick count, chat and HUD panels; for keys, settings pages and drawing, use the PC game or
the phone.

## Installing on the phone

1. Send the `.hmod` to the phone.
2. In Pojarush, open **Packs** and import it, or copy it into `Pojarush_Test3/horizon/game/horizon-mods/`.
3. Start the game. The mod appears in Options > Mods (and in the PR Mod Menu mod, key M, when that mod is installed).
4. Read `Pojarush_Test3/horizon/game/logs/latest.log` for `[mod <id>]` lines if something is wrong.

A code mod needs the **64-bit** APK. The first time a wasm mod loads, the game compiles it; this can take a few seconds
on a phone and is cached afterwards.

## Working without a PC

An AI or developer with no PC can still deliver a working mod:

1. Build in a cloud or CI machine with the commands above.
2. Run `check` and `test`; both must pass.
3. Deliver the `.hmod`; the player installs it as above and reports what they see (and sends `latest.log`).
4. Say plainly what was **not** tested on a device. `check` proves the mod loads and does not crash in a trial run; it
   does not prove that keys, screens or drawing look right.

## Versions

Every release of a mod needs a higher `version` in `horizon-mod.toml`; a published version cannot be sent again. The
maintainer's rule for releases is to raise the **last digit first** (`1.0.0` -> `1.0.1` -> `1.0.2`) and not jump to the
next minor.
