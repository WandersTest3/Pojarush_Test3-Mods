# 9. Limits and missing features

What Pojarush mods **cannot do yet**, what is only partly there, and what to ask the maintainer for. Use this page to give an
honest feasibility answer. Where something is not verified, the table says so.

How to read the "Evidence" column: **reference** = stated in the launcher's API reference or manifest code (reliable);
**docs** = stated in the launcher's mod docs; **not verified** = nobody has checked it on a device.

## Hard limits (by design)

| Limit | Why | Evidence |
|---|---|---|
| No Java: `.jar` mods (Fabric, Forge, NeoForge, Quilt) do not load | the game has no Java classes to call or patch | docs: `horizon/docs/mods.md` |
| No mixins and no native mods (`.hnmod`) in the app | native mods are compiled into the game on a PC; the app ships a prebuilt game | docs: `horizon/docs/native-mods.md` and the launcher README |
| A mod cannot supply shader code | the renderer draws shapes for the mod with its own shaders | reference: `render` ("A mod never supplies shader code") |
| No file system, network or threads in a code mod | WebAssembly sandbox | reference |
| Code mods run only on the **64-bit** APK | the wasm runtime is built for 64-bit; the 32-bit APK runs content mods only | launcher README |
| `mod.wasm` at most 32 MiB; a `.hmod` uploaded to the site at most 5 MiB | manifest code; site config | reference / site |

## Missing features (what mod ideas run into)

| Idea | Status | Notes |
|---|---|---|
| New mobs, bosses, custom AI, spawning | **missing** | a data-driven `entity` interface is planned upstream (modpacks roadmap, 0.5); nothing in the mod API today |
| Machines, block entities, per-block data | **missing** | content blocks copy a vanilla template; no per-block state beyond block states |
| Custom container GUIs, menus with slots | **missing** | `ui` has its own screens (text, buttons, sliders, lists, items, entities), not container menus |
| Custom drawing in menus and screens | **partial** | `render::set_hud_always` draws over menus; no per-screen drawing hooks |
| Custom blocks with behavior (use, break, tick) | **missing** | behavior callbacks are planned upstream (0.3 `server` interface) |
| New dimensions and custom world generators | **partial** | data-driven structures and features can be added by content mods; custom generators cannot |
| Networking between client and server halves | **missing** | no `net` interface |
| Sound: playing or adding sounds | **not in the mod API** | content mods can carry `assets/<id>/sounds`; no call to play a sound from code (not verified end to end) |
| Reading effects, armor durability, held-item components, target health, scoreboard, ping, server address | **missing** | `game` exposes player (position, yaw, pitch, health, food, dimension), clock, raycast block, entities |
| Sending chat messages or commands as the player | **partial** | `command::run` runs a vanilla command as the player; `say` and `msg` are refused in `run_quiet` |
| Key combinations, modifiers, mouse buttons as binds | **partial** | `register_key` takes one key id as `options.txt` writes it; a combo must be built in code from `input::mapping` and several keys (not verified for mouse-button key ids) |
| Item tooltips, entity outlines, name tags | **missing** | tooltips are a native-mod hook (not available in the app) |
| Moving arbitrary inventory slots | **partial** | `input::swap_offhand(slot)` swaps slots 0-35 with the off hand; no general slot-to-slot moves, drops, or crafting actions |
| Recipe viewers | **available** | `recipes` and `browser` interfaces (experimental), for item and recipe panels |
| Server mods (`api = "0.3"`, `side = "server"`) | **experimental** | the SDK has `ServerMod`; whether and how the app runs them on its integrated server is **not verified** |
| Multiplayer registry sync for content mods | **missing** | single player and the integrated server first |
| Redefining a vanilla block or item | **refused** | a content mod may only add |

## The upstream wasm `.hmod` subset

Horizon's newer `.hmod` packages (`api = "0.2"` with a `[wasm]` table, such as the official Keystrokes 3.0.1) run through the
runtime in the launcher's `horizon/vendor/horizon-wasm-mods`, bridged by `horizon/crates/pojarush-wasm-mods`. State as of
Pojarush 1.11.27, 64-bit only:

| Upstream feature | Pojarush | Detail |
|---|---|---|
| Load, compile (in-process, cached) and run | **works** | the first load compiles; later loads use the `.horizon-wasm-cache` folder |
| HUD drawing (`render_gui_post`: fills, text) | **works** | corners and used space are bridged |
| Per-frame hook (`render_frame_pre`) | **works** | |
| Mouse button hook | **works** | pressed / released |
| Resources reloaded hook | **works** | |
| Settings page (labels, clicks) and saved settings | **works** | registered through the upstream phases; stored in a per-mod data folder |
| Translations from the package's `assets/<id>/lang/*.json` | **works** | |
| Mappings of vanilla keys (`key.forward`...) | **works** | |
| Mod keys (`mod_key`), key events (`poll`), `is_down`, `consume_click`, `claim_items` | **stubbed** | return nothing; mods that depend on them lose that feature |
| Config files (`config_files`) | **stubbed** | reading returns "not found" |
| Anything else the upstream host API offers | **unprovided** | the one call stops, the game keeps running (`guarded`, a panic is caught) |
| Packages built with another SDK commit | **not verified** | the runtime is pinned to Horizon commit `0a875da`; a package built for a different contract may be refused |
| 32-bit devices | **no** | |

When a wasm mod looks half-working, read `logs/latest.log` for the "unprovided" lines: they name the host call that is missing.

## Not verified on a device (as of Pojarush 1.11.27)

- How long the first compile of an upstream wasm mod takes on a phone (about 90 s in a debug PC build; 0.4 s from cache).
- Auto Totem's timings and the inventory open/close path under real survival play.
- Anything that depends on a specific GPU or driver (drawing, shaders): behavior can differ between devices.

## How to ask for a missing feature

Open an issue at https://github.com/WandersTest3/Pojarush_Test3/issues with:

1. **The mod idea** in one sentence and who it is for.
2. **What blocks it**: the exact function or event that is missing (for example "read the player's active potion effects").
3. **The shape you propose**: a function name, its arguments and return value, and the capability that should guard it
   (for example `game::effects() -> list<effect>`, capability `game-read`). Small, read-only additions are the cheapest to add.
4. **What you tried**: the closest existing function and why it is not enough.
5. **Is it a new level?** Every new function raises the API level; say which mods would need it.

Additions are added for everyone and never remove or change an old function (see `horizon/docs/api/stability.md`).
