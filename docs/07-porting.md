# 7. Porting a mod to Pojarush

A "port" is a **rewrite**: Pojarush cannot load a `.jar`. What can be carried over is the mod's data, assets and ideas; the
logic is written again against the Pojarush mod API ([page 4](04-code-mods.md)). Do this in order.

## Step 0: is the license compatible?

Before copying anything, read the original's license.

- **Data and assets** (textures, models, sounds, lang): copy only if the license allows redistribution, and keep the credits.
- **Code**: a port rewrites the code in Rust against another API; it is a derivative work. Keep the original author in
  `authors`, the original license text in `LICENSE.txt` / `NOTICE.txt` when it requires it, and a link to the original in
  `[contact].homepage`. Examples: `keystrokes-port` (MIT original, kept with a `NOTICE.txt`) and `acvcape`.
- The Pojarush Mods site makes the uploader confirm that the mod does not violate the rights of any ported Java mod. If the
  license forbids ports, **do not port it**; offer an original mod with the same idea instead.
- Never copy Mojang's assets. Never invent a license for someone else's work.

## Step 1: classify what the mod does

| The Java mod mostly... | Pojarush route | Feasible today |
|---|---|---|
| adds blocks, items, recipes, loot, tags, textures, lang | **content mod** (page 5) | yes, if the blocks and items can copy a vanilla template |
| draws a HUD (FPS, coords, keys, armor, potions, minimap) | code mod: `render` / `hud` | yes |
| adds keybinds that act on the client (zoom, toggles, shortcuts) | code mod: `input` + `render` / `command` | yes |
| edits the inventory, off hand, hotbar | code mod: `input::inventory`, `swap_offhand`, `open_inventory`, `select_hotbar`, `swap_hands` | partly: selects a hotbar slot, swaps hands (F), swaps slots 0-35 with the off hand; no arbitrary slot moves |
| adds screens or settings (Mod Menu style, cosmetics) | code mod: `ui` | yes, within the widget kinds |
| adds cosmetics (capes, player models, skin layers) | code mod: `render` models | yes, see `acvcape`, `pojarush-3dskinlayers` |
| adds shaders or shader shortcuts | `.hshader` / OptiFine packs + a `ui` mod | shortcuts yes; GLSL is the shader pack's, not the mod's |
| adds mobs, bosses, custom AI | none | **no** ([page 9](09-limits-and-needs.md)) |
| adds machines, block entities, custom GUIs in containers | none | **no** |
| adds new dimensions, biomes, world generation code | content mod for data-driven parts only | partial (structures, features; not custom generators) |
| changes vanilla behavior with mixins | none (native mods do not run in the app) | **no** |
| networking between client and server halves | none | **no** |

If the answer is "no" or "partial", say so in the report ([page 10](10-ai-playbook.md)) instead of shipping something that
only looks similar.

## Step 2: map the concepts

| Java (Fabric / Forge / NeoForge) | Pojarush |
|---|---|
| `ClientModInitializer`, `@Mod` | `impl Mod for MyMod { fn init() }` |
| `ClientTickEvents.END_CLIENT_TICK` | `fn tick(&mut self, tick: u64)` with `.on_tick()` |
| `HudRenderCallback`, `RenderGuiLayerEvent` | `render::set_hud` / `set_corner` / `hud::set_panel` |
| `KeyBindingHelper.registerKeyBinding` | `input::register_key(name, label, "key.keyboard.x")` + `input::poll()` |
| `ClientCommandRegistrationCallback` | `Registration::new().command("name")` + `fn command` |
| `Minecraft.getInstance().player` position, health | `game::get_player()` |
| `player.getInventory()` | `input::inventory()` |
| `MinecraftClient.setScreen(new MyScreen())` | `ui::open_screen_v3(...)` with widgets (no custom drawing code) |
| Cloth Config / owo-lib config screens | `ui::set_settings_v2` page + `storage` file (or the `pojarush-lib` helper) |
| `Language` / `I18n` | `ui::language()` + a table of strings, `[translations.*]` in the manifest |
| Config file in `config/` | `storage::get` / `storage::set` (a per-mod folder, `[a-z0-9_.-]{1,64}` keys) |
| `ChatHud.addMessage` | `chat::show` |
| `ClientPlayerEntity.sendCommand` | `command::run` (capability `command`) |
| Data pack / resource pack inside the jar | the same `data/` and `assets/` inside the `.hmod` (content) |
| `fabric.mod.json` / `mods.toml` | `horizon-mod.toml` |
| Mod icon | `icon = "assets/<id>/icon.png"` |
| `Identifier("modid", "path")` | `modid:path`; the id is `[a-z0-9_]` |
| GeckoLib models and animations | `render::spawn_model` with `models/*.geo.json` and `*.animation.json` |

Things with **no equivalent**: custom widgets with arbitrary drawing, drawing in menus (only `set_hud_always`), reading arbitrary
game state (only what `game`, `input` and `ui` expose), mixins, reflection, threads, file and network access.

## Step 3: port workflow

1. **Inventory the source.** List its features, the events it listens to, the data it ships, its settings and its
   keybinds. Write a one-line verdict per feature (feasible, partial, not possible) using the table above.
2. **Create the project** with `cargo horizon-mod new <id> --template code --sdk-path <sdk>` (or `--template content`).
3. **Carry over data first.** Copy lang, textures and models you are allowed to reuse into `assets/<id>/` or `models/`.
4. **Port one feature at a time**, smallest first, building and running `check` after each.
5. **Keep the original's behavior and numbers**, but follow Pojarush's conventions: settings on a page in Options > Mods,
   keys in Controls > Key Binds, saved settings through `storage`, texts in English with `pt_br` / `pt_pt` translations.
6. **Test**: `cargo horizon-mod test` for commands, ticks, chat and panels; a device for keys, screens and drawing.
7. **Document**: README or description with what was ported, what was left out, and why. Credit the original.

## Porting a Horizon (upstream) `.hmod`

Horizon's own mods come in two forms:

- **`api = "0.2"` with a `[wasm]` table** (for example the official Keystrokes 3.0.1). Pojarush links Horizon's wasm runtime
  and **tries to run them as they are**, on 64-bit phones, using a subset of the upstream host API (what HUD, key and settings
  mods use; see [page 9](09-limits-and-needs.md)). Try installing the `.hmod` first. If it loads and draws, nothing needs
  porting. If a feature is "unprovided", the rest of the mod keeps running.
- **Pojarush port**: rewrite the mod against the Pojarush SDK when the upstream form needs host calls Pojarush does not serve,
  or when you want the settings page, keys and storage to follow Pojarush's conventions. `keystrokes-port` is exactly this:
  the same layout and numbers as the upstream Keystrokes 3.0.1, written with `render`, `input`, `ui` and `storage`.

How to tell what an upstream `.hmod` needs: unzip it (it is a zip), read `horizon-mod.toml` and `uses.json`, and read
`src/lib.rs` if the source is included. Then check each host call against the subset listed in page 9.

## Porting checklist

- [ ] License checked, credits and license text kept.
- [ ] Each feature classified; impossible ones listed in the README, not faked.
- [ ] `id` is `[a-z0-9_]` and different from every existing mod (check `registry/` in this repository).
- [ ] `minecraft = "26.3"`; `api` and `capabilities` match what the code uses; experimental ones repeated.
- [ ] No Mojang assets in the file.
- [ ] Settings page, key bindings and saved settings use the patterns of page 4.
- [ ] Translations: English plus `pt_br` and `pt_pt` for name and description.
- [ ] `cargo horizon-mod check` passes; `cargo horizon-mod test` passes.
- [ ] The report states what was and what was **not** tested on a device.
