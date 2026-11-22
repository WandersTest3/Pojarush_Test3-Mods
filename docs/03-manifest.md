# 3. Manifest and capabilities

Every mod has `horizon-mod.toml` at the root of the `.hmod`. **Unknown keys are refused**, so a typo is an error, not a
silently ignored permission.

## Full manifest

```toml
id = "my_mod"                    # [a-z0-9_], 1-64 chars. Folder, log name and settings key. Never change it after release
name = "My Mod"
version = "1.0.0"                # letters, digits . - _ +  (site rule); raise it on every release
description = "What it does."    # plain text; shown in lists
authors = ["Your name"]
api = "0.1"                      # "0.1" code mod, "0.2" content mod, "0.3" server mod (experimental)
side = "client"                  # "client", "server" or "both" (content mods use "both")
capabilities = ["chat", "ui"]    # what the mod may do (below)
experimental = ["ui"]            # must repeat every experimental capability used
minecraft = "26.3"               # "26.3", "26.3.x", ">=26.3" or "*"
license = "Mod Test3 License V1.0"
icon = "assets/my_mod/icon.png"  # PNG inside the .hmod, shown in lists (a code mod: put it in assets/<id>/)

namespaces = []                  # content mods only: extra namespaces the files use

[contact]
homepage = "https://github.com/you/my-mod"
sources  = "https://github.com/you/my-mod"
issues   = "https://github.com/you/my-mod/issues"

[translations.pt_br]             # name and description by game language code
name = "Meu Mod"
description = "O que ele faz."
```

Rules enforced when the game or `cargo horizon-mod check` reads it:

- A capability that is experimental and not repeated in `experimental` is an error.
- A `minecraft` value that does not include the running game version refuses the mod and names the version it was made for.
- `mod.wasm` is at most 32 MiB.
- A content mod's namespaces cannot be `minecraft`, `c` or `horizon`, and two mods that are on cannot own the same
  namespace (the first by file name wins).

## Capabilities

The player reads the right column before turning a mod on. List only what the mod needs.

| Capability | Experimental | Grants | Player reads "May ..." |
|---|---|---|---|
| `game-read` | no | `game`: player, clock, block under the crosshair, entities | see your position, health and the time |
| `chat` | no | `chat::show`: messages only the local player sees | show you chat messages |
| `hud` | no | `hud`: one text panel in a screen corner | draw text on your screen |
| `storage` | no | `storage`: small key/value files in the mod's own folder | save its own settings to disk |
| `command` | no | `command::run`: vanilla commands as the player | run commands as you, with your permissions |
| `registries` | no | data files (`assets/`, `data/`), no interface | add blocks, items, mob effects and entity types to your worlds |
| `ui` | **yes** | `ui`: screens, a settings page, mod list, shader packs | show its own screens and a settings page |
| `render` | **yes** | `render`: shapes, HUD, zoom, shake, models, world shapes | draw on your screen, shake and zoom the camera |
| `input` | **yes** | `input`: own keys, mouse wheel, held item, inventory, screens | see the keys you hold and your clicks, take over the use button on its own items and the mouse wheel, and add keys |
| `recipes` | **yes** | `recipes`: recipes and items for recipe viewers | read the game's recipes and items and which recipes you know, place recipes in your crafting grid and, in creative mode, give you items |
| `players` | no | server mods: see and message players | see who is on the server and message them |
| `world` | no | server mods: read and change blocks | read and change the world's blocks |

`log::write` needs no capability.

## The API level a mod needs

Each function the game offers has the **level** it arrived at. A mod needs the level of the newest function it calls; if
the installed game is older, it is refused with "update Horizon" instead of failing to link. `cargo horizon-mod check`
prints `needs mod API level N or newer`. The level table is in the [API cheat sheet](06-api-cheatsheet.md). Using only
old functions keeps a mod working on more game versions, so avoid calling a newer function when an older one will do.

## Common manifest mistakes

| Symptom | Cause | Fix |
|---|---|---|
| "capability ui is experimental..." | `ui` in `capabilities` but not in `experimental` | add `experimental = ["ui"]` |
| Refused: version | `minecraft` does not include 26.3 | set `minecraft = "26.3"` |
| Mod listed but nothing happens | the hook was not requested | add `.on_tick()` / `.on_frame()` / `.command("x")` to the `Registration` |
| The mod is refused or a call fails | the interface's capability is missing from `capabilities` | add it (and to `experimental` if it is experimental) |
| Site rejects the upload | `id` has capitals or `-` | use `[a-z0-9_]` |
