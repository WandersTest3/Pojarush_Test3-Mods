# Pojarush mod tutorial

Everything needed to make, port, test and publish a mod for the **Pojarush** launcher (Android, Minecraft Java 26.3
running on the Rust engine Horizon). It is written for people **and for AI assistants**: every page is self-contained,
states exact file names and function names, and says what is verified and what is not.

If you are an AI reading this: start with [10 - AI playbook](10-ai-playbook.md), then open only the pages your task needs.

## Pages

| # | Page | Read it when |
|---|---|---|
| 1 | [Concepts](01-concepts.md) | You need to know what kinds of mod exist and which one fits the idea |
| 2 | [Setup and workflow](02-setup-and-workflow.md) | You are installing tools, building, testing and installing a mod on a phone |
| 3 | [Manifest and capabilities](03-manifest.md) | You write or fix `horizon-mod.toml`, or a mod is refused to load |
| 4 | [Code mods (Rust to WebAssembly)](04-code-mods.md) | The mod needs logic: HUD, keys, commands, settings, inventory, models |
| 5 | [Content mods](05-content-mods.md) | The mod only adds blocks, items, recipes, loot, tags, textures or names |
| 6 | [API cheat sheet](06-api-cheatsheet.md) | You need the exact function for something, and the API level it needs |
| 7 | [Porting a mod](07-porting.md) | You are bringing a Java (Fabric, Forge, NeoForge) or Horizon mod to Pojarush |
| 8 | [Publishing](08-publishing.md) | You are sending a mod to the Pojarush Mods site |
| 9 | [Limits and missing features](09-limits-and-needs.md) | You must say what Pojarush cannot do yet, or what to ask the maintainer for |
| 10 | [AI playbook](10-ai-playbook.md) | You are an AI assistant asked to make a mod, a port or a feasibility report |

## Examples

Four small mods in [`../examples`](../examples), each built, checked and tested with `cargo horizon-mod`:

| Folder | Kind | Shows |
|---|---|---|
| [`hello-command`](../examples/hello-command) | code | `/hello` and `/hellocount`, state, chat, a test script |
| [`hud-session-timer`](../examples/hud-session-timer) | code | HUD in a corner, settings page, saved settings, a command |
| [`key-toggle`](../examples/key-toggle) | code | a key of its own (rebindable) and a HUD line |
| [`content-glowing-block`](../examples/content-glowing-block) | content | a block, an item, recipe, loot, tag and name with no code |

The SDK the examples build against is copied (MIT) in [`../sdk/horizon-mod-sdk`](../sdk/horizon-mod-sdk).

## Larger real mods

All in the launcher repository, folder `horizon/mods/`
(https://github.com/WandersTest3/Pojarush_Test3/tree/main/horizon/mods):

| Mod | Good example of |
|---|---|
| `pojarush-zoom` | own key, mouse wheel, camera zoom, settings page, saved settings |
| `pojarush-autototem` | inventory reading, swapping into the off hand, opening and closing the inventory, timed state machine, HUD counter |
| `pojarush-fps` | HUD text that can be dragged, scaled and always visible |
| `pojarush-modmenu` | `ui` entity widgets, columns, a title-screen button |
| `pojarush-shaders` | shader pack shortcuts and a Video Settings button |
| `pojarush-3dskinlayers` | models built in code and attached to the player |
| `pojarush-geckodemo` | GeckoLib-style models and animations |
| `combat-hitboxes` | drawing shapes in the world, reading entities |
| `acvcape` | a port of a Java mod (capes) with a two-column screen |
| `keystrokes-port` | a port of Horizon's official Keystrokes to the Pojarush API |
| `pojarush-lib` | a helper crate: config, settings pages, translations, keys, scheduler, HUD panel, text colors |

## Facts that apply everywhere

- Game: Minecraft Java **26.3**. Manifest `minecraft = "26.3"`.
- Code mods are WebAssembly and run only in the **64-bit** APK (`arm64-v8a`). The 32-bit APK runs content mods only.
- The mod API has a **level** (currently **15**). A mod needs the level of the newest function it calls.
  `cargo horizon-mod check` prints it.
- Mod author license used by the maintainer: `Mod Test3 License V1.0`
  (https://github.com/WandersTest3/Mod-Test3-License-V1.0). Do not invent a license for someone else's mod.
- The language of the site, the docs and mod manifests is English; add Portuguese through `[translations.pt_br]`.
