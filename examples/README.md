# Example mods

Four small mods. Each one was built with `cargo horizon-mod build`, passed `cargo horizon-mod check`, and (the code mods)
passed `cargo horizon-mod test`. They were **not** run on a device: what draws, what keys do and how the settings page looks
still needs a phone or the PC game.

| Folder | Kind | Needs API level | Shows |
|---|---|---|---|
| `hello-command` | code | 0 | `/hello [name]` and `/hellocount`, state in the struct, `chat::show`, command feedback, a test script |
| `hud-session-timer` | code | 8 | a timer drawn with `render::set_corner`, a settings page (`ui::set_settings_v2`) with a toggle and a corner button, settings saved with `storage`, `/timer` and `/timer reset` |
| `key-toggle` | code | 0 | `input::register_key` (J, rebindable), `input::poll` in `tick`, a `hud::set_panel` line |
| `content-glowing-block` | content | - | a block and its item from a vanilla template, model, blockstate, name, recipe, loot table and a tag addition |

## Build one

```sh
cd examples/hello-command
cargo horizon-mod build                                   # target/horizon-mod/example_hello_command.hmod
cargo horizon-mod check target/horizon-mod/example_hello_command.hmod
cargo horizon-mod test
```

The code examples depend on the SDK copy in `../../sdk/horizon-mod-sdk`. The tool is installed with
`cargo install --path <Pojarush_Test3>/horizon/crates/cargo-horizon-mod` (see `docs/02-setup-and-workflow.md`).
If `CARGO_TARGET_DIR` is set, the `.hmod` is written there instead of `target/`.

## Use one as a template

Copy the folder, then change: the folder and crate name in `Cargo.toml`, `id`, `name`, `description` and `authors` in
`horizon-mod.toml` (the `id` must be unique and `[a-z0-9_]`), and the code. Keep `[workspace]` at the end of `Cargo.toml`.
