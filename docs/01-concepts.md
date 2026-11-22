# 1. Concepts

## What Pojarush runs

Pojarush is an Android launcher. It does not run Fabric, Forge or NeoForge `.jar` files, because those call and patch
Minecraft's Java classes and Pojarush's game has none. The game is **Horizon**, a Minecraft 26.3 client and server
written in Rust. Mods for it are `.hmod` files (a zip with a `horizon-mod.toml` manifest).

## The kinds of mod

| Kind | Manifest | Contains | Runs on | Use it for |
|---|---|---|---|---|
| **Content mod** | `api = "0.2"`, capability `registries`, no `[wasm]` | `data/` and `assets/` only | 64 and 32 bit | Blocks, items, recipes, loot, tags, models, textures, names, structures |
| **Code mod** (Pojarush API) | `api = "0.1"` | `mod.wasm` built from Rust with `horizon-mod-sdk` | 64 bit only | HUD, keys, commands, settings pages, inventory actions, camera, models, shaders shortcuts |
| **Upstream wasm mod** | `api = "0.2"` and a `[wasm]` table | `mod.wasm` built with Horizon's newer SDK | 64 bit only | Mods made for Horizon itself, such as the official Keystrokes |
| **Native mod** | `.hnmod` | Rust mixins compiled into the game | **Not supported** | Needs a PC build of the game; cannot run in the app |

How to choose:

1. Only adds blocks, items, recipes, loot, textures, names or tags? -> **content mod** ([page 5](05-content-mods.md)).
2. Needs to react to the game (keys, ticks, frames, the inventory, chat, commands) or draw on screen? -> **code mod**
   ([page 4](04-code-mods.md)).
3. Already exists as a Horizon `.hmod` with a `[wasm]` table? -> try it first; it may run as is (see below).
4. Exists only as a Java mod? -> it must be rewritten; see [page 7](07-porting.md).

## The two "wasm" families, and why they differ

- **Pojarush code mods (`api = "0.1"`)** are WebAssembly *components* built with the SDK in
  [`../sdk/horizon-mod-sdk`](../sdk/horizon-mod-sdk). The game offers them the interfaces listed in the
  [API cheat sheet](06-api-cheatsheet.md) (`game`, `chat`, `hud`, `storage`, `command`, `ui`, `render`, `input`...).
  This is the API this tutorial documents. It is Pojarush's own and is the one new mods should use.
- **Upstream wasm mods (`api = "0.2"` with `[wasm]`)** are made for Horizon's newer SDK (a different, richer contract).
  Pojarush links Horizon's wasm mod runtime for them (`horizon/vendor/horizon-wasm-mods` in the launcher repository,
  LGPL-3.0-or-later) and serves a **subset**: what HUD, key and settings mods use. A mod that asks for something outside
  that subset has that one call stopped ("unprovided"), and the game keeps running. Details and the exact list:
  [page 9](09-limits-and-needs.md). Such a mod is *not* written with this tutorial's SDK.

You can tell them apart by the manifest: `api = "0.1"` is a Pojarush code mod; `api = "0.2"` with a `[wasm]` table is an
upstream wasm mod; `api = "0.2"` with `capabilities = ["registries"]` and no `[wasm]` is a content mod.

## Sandbox and permissions

A code mod is isolated in a WebAssembly sandbox. It reaches only the interfaces its manifest lists in `capabilities`.
Before turning a mod on, the player sees these as "May ..." lines. Experimental interfaces (`render`, `input`, `ui`,
`recipes`) must also be listed in `experimental = [...]`. A mod cannot supply shader code, open files, or use the network.

## The mod lifecycle

1. The game reads `horizon-mods/*.hmod`, checks the manifest, and compares the API level with its own.
2. `init()` runs once; it returns the hooks the mod wants (`tick`, `frame`, `chat`, commands). An error keeps the mod off
   and is shown in red on its row in the mod list.
3. The game calls the hooks. `tick` runs 20 times a second **while in a world**; `frame` runs every drawn frame and has a
   budget of 0.1 ms.
4. State lives in the mod's own struct (and a per-mod storage folder). There is no shared state between mods.

## Where files live on the phone

Everything is under `Pojarush_Test3/horizon/game/` (internal storage root when the storage permission is granted;
otherwise inside the app's own folder):

| Folder | What goes in it |
|---|---|
| `horizon-mods/` | `.hmod` mods (put the file here, or import it on the launcher's **Packs** page) |
| `horizon-mods/.horizon-mod-data/<id>/` | what a mod saved with `storage` (never delete it for the player) |
| `resourcepacks/`, `shaderpacks/` | resource packs and shader packs |
| `logs/latest.log` | the game log: a mod's `log::write` lines read `[mod <id>] message` |

Installed mods always load on start. To turn one off, take it out of the folder. A mod's settings page is in
Options > Mods.
