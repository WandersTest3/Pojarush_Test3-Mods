# 6. API cheat sheet

Every function a Pojarush code mod can call, with the **API level** it arrived at (the game serves every level up to its
own; Pojarush 1.11.28 serves **level 16**). The tables below are generated from the launcher's own reference
(`horizon/docs/api/mods-reference.md`, itself generated from `horizon.wit` and `api_level.rs`), so the names and levels are
exact. The full reference, with every record and enum field, is in the launcher repository:

- Reference: https://github.com/WandersTest3/Pojarush_Test3/blob/main/horizon/docs/api/mods-reference.md
- WIT contract: [`../sdk/horizon-mod-sdk/wit/horizon.wit`](../sdk/horizon-mod-sdk/wit/horizon.wit) (a copy)
- SDK source (traits, macros, helpers): [`../sdk/horizon-mod-sdk/src/lib.rs`](../sdk/horizon-mod-sdk/src/lib.rs)

In Rust, call them as `horizon_mod_sdk::<interface>::<function>`; WIT `kebab-case` becomes `snake_case`.

## What each level added

| Level | Pojarush | Added |
|---|---|---|
| 0 | base | `log`, `game` (player, clock), `chat`, `hud`, `storage`, `command`, `ui` screens and settings, `input` keys / wheel / mappings / CPS, `render` HUD / zoom / shake / corners |
| 1 | | `render::set_minimap`, `players` (server) |
| 2 | | `game::raycast` |
| 3 | | `command::run_quiet` |
| 4 | | `world` (get / set blocks, biome; server) |
| 5-6 | | `recipes`, `browser` (recipe viewers), placing recipes, giving items |
| 7 | | `render::set_far_terrain`, `render::set_hud_scale` |
| 8 | | `ui::set_settings_v2`, `ui::set_slider`, `ui::language` (sliders and translations) |
| 9 | 1.11.14 | `render::set_hud_always`, `set_hud_drag`, `take_hud_drag` (always visible, draggable HUD) |
| 10 | 1.11.17 | `ui::mods`, `open_mod_settings`, shader pack functions |
| 11 | 1.11.18 | title and video buttons, `open_mod_list`, GeckoLib-style models, player models, capes |
| 12 | 1.11.22 | `ui::open_screen_v3`, `set_settings_v3` (entity widgets), `set_resets` |
| 13 | 1.11.23 | `game::entities`, `hitboxes_shown`, `render::set_world_shapes`, `hide_hitboxes` |
| 14 | 1.11.25 | `input::inventory`, `swap_offhand` |
| 15 | 1.11.27 | `input::current_screen`, `open_inventory`, `close_inventory` |
| 16 | 1.11.28 | `input::select_hotbar`, `swap_hands` (hotbar slot and the F key) |

(The "Pojarush" column is the launcher version in which the level appeared, from the launcher's commit history.)

## Events the game sends to the mod

| Hook | Trait method | Registered with |
|---|---|---|
| tick | `tick(tick: u64)` | `Registration::on_tick()` |
| frame | `frame(seconds: f32)` | `Registration::on_frame()` |
| command | `command(name, args) -> Result<Option<String>, String>` | `Registration::command("name")` |
| chat | `chat(text)` | `Registration::on_chat()` |
| UI | `ui_select(id, row)`, `ui_closed()`, `ui_settings_opened()` | capability `ui` |
| input events | `input::poll() -> Vec<Event>` (`KeyDown(name)`, `KeyUp(name)`, `UseStart(item-use)`, `UseStop(item-use)`, `Wheel(f32)`) | capability `input` |
| browser events | `browser::poll()` | capability `recipes` |

Reserved UI ids: `0xFFFFFF00` (title-screen button click), `0xFFFFFF01` (video-settings button click); a reset by
Shift + click arrives as `ui_select(id, 0xFFFFFFFF)`.

## Functions by interface

### `log` (always granted)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `log::write` | 0 | `func(level: level, message: string)` | One line in the game's log as `[mod <id>] message`, at that level. |

### `game` (game-read)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `game::get_player` | 0 | `func() -> option<player>` | None on the title screen. |
| `game::get_clock` | 0 | `func() -> option<clock>` | None on the title screen. |
| `game::raycast` | 2 | `func(distance: f32) -> option<hit>` | The first block along the player's view (fluids pass), up to `distance` blocks (at most 1024; past the loaded chunks, across the distant terrain when LOD Distance is on), as of this tick. |
| `game::entities` | 13 | `func(distance: f32) -> list<entity>` | The entities whose position lies within `distance` blocks (at most 256) of the player, nearest first, as of this frame; empty on the title screen. |
| `game::hitboxes_shown` | 13 | `func() -> bool` | The hitboxes are shown (F3+B). |

### `chat` (chat)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `chat::show` | 0 | `func(text: string)` | Shown in chat after the mod's name, like a system message. |

### `hud` (hud)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `hud::set_panel` | 0 | `func(corner: corner, lines: list<line>)` | Replaces the mod's panel: up to 16 lines in that corner of the screen. |
| `hud::clear` | 0 | `func()` | Removes the mod's panel. |

### `storage` (storage)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `storage::get` | 0 | `func(key: string) -> option<list<u8>>` | None if `key` has never been `set`, or the key is not well-formed. |
| `storage::set` | 0 | `func(key: string, value: list<u8>) -> result<_, string>` | Errs on a malformed key or over quota (bytes for the whole mod). |
| `storage::delete` | 0 | `func(key: string)` | No error if `key` was already absent. |

### `command` (command)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `command::run` | 0 | `func(line: string)` | `line` without its slash; its feedback goes to the chat as if typed. |
| `command::run_quiet` | 3 | `func(lines: list<string>)` | `lines` (each without its slash, at most 256 a call) as `run` does, but with nothing in the chat: no feedback and no failure. |

### `ui` (ui, experimental)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `ui::open_screen` | 0 | `func(screen: screen)` | Show `screen` over the game; a second call while it is open replaces it. |
| `ui::close_screen` | 0 | `func()` | Close the mod's screen when it is open (the mod hears no `closed` for this: it was its own doing). |
| `ui::set_settings` | 0 | `func(widgets: list<widget>)` | The mod's page in Options > Mods, reached from a settings button on its row: the widgets it shows, an empty list for no page. |
| `ui::set_settings_v2` | 8 | `func(widgets: list<widget-v2>)` | `set-settings` taking the newer widget kinds too. |
| `ui::open_screen_v3` | 12 | `func(screen: screen-v3)` | `open-screen` taking every widget kind, sliders and entity boxes too (API level 12). |
| `ui::set_settings_v3` | 12 | `func(widgets: list<widget-v3>)` | `set-settings` taking every widget kind (API level 12). |
| `ui::set_resets` | 12 | `func(ids: list<u32>)` | The buttons and sliders, by id, that Shift + click puts back at the mod's default (API level 12): the game calls `ui-events::select(id, 4294967295)` (`0xFFFFFFFF`) for them, and the mod sets its default and pushes fre... |
| `ui::language` | 8 | `func() -> string` | The game's selected language code, lowercase (`en_us`, `pt_br`), for mods that translate their widgets. |
| `ui::set_slider` | 8 | `func(id: u32, position: u32, label: string)` | Move the handle and change the label of the slider `id` on the screen and the settings page without sending every widget again. |
| `ui::mods` | 10 | `func() -> list<mod-info>` | Every mod installed, in the order Options > Mods lists them. |
| `ui::open_mod_settings` | 10 | `func(id: string) -> bool` | Opens the settings page of the mod `id` once this hook returns; false when it has none. |
| `ui::shader_packs` | 10 | `func() -> list<string>` | The shader packs in the `shaderpacks` folder, by file name. |
| `ui::shader_pack` | 10 | `func() -> string` | The shader pack in use, empty when shaders are off. |
| `ui::set_shader_pack` | 10 | `func(name: string)` | Picks the shader pack `name` (empty: shaders off) once this hook returns. |
| `ui::open_shader_options` | 10 | `func() -> bool` | Opens the Shader Options page of the pack in use; false when none is. |
| `ui::open_shader_packs` | 10 | `func()` | Opens Options > Shader Packs. |
| `ui::reload_shader_pack` | 10 | `func()` | Loads the shader pack in use again, from its files. |
| `ui::set_title_button` | 11 | `func(label: string)` | An icon button (the mod's icon, this label as its name) in the title screen's and pause menu's icon rows, as Mod Menu adds; empty takes it away. |
| `ui::set_video_button` | 11 | `func(label: string)` | A full-width button at the top of Options > Video Settings with this label (as Iris's "Shader Packs..."); empty takes it away. |
| `ui::open_mod_list` | 11 | `func()` | Opens the game's Mod Menu screen (API level 11): the installed mods in a list with their icons, the picked one's details, links and settings. |

### `input` (input, experimental)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `input::claim_items` | 0 | `func(ids: list<string>)` | The items whose use the mod handles instead of the game, by id (at most 64). |
| `input::register_key` | 0 | `func(name: string, label: string, key: string) -> result<_, string>` | A key of the mod's: `name` comes back in `key-down` and `key-up`, `label` says what it does, `key` is the key as options.txt writes it (`key.keyboard.r`), the default: the player can bind another one on the mod's page... |
| `input::held` | 0 | `func() -> option<held-item>` | The main hand's stack, as of this tick; none when it is empty. |
| `input::poll` | 0 | `func() -> list<event>` | The events since the last call, oldest first. |
| `input::claim_wheel` | 0 | `func(on: bool)` | Takes the mouse wheel while playing (true) or gives it back: while taken, its steps are the mod's `wheel` events and the hotbar doesn't move. |
| `input::mapping` | 0 | `func(name: string) -> option<mapping-state>` | A movement or click mapping as the player has bound it: `key.forward`, `key.left`, `key.back`, `key.right`, `key.jump`, `key.sneak`, `key.sprint`, `key.attack` or `key.use`. |
| `input::clicks_per_second` | 0 | `func() -> tuple<u32, u32>` | Clicks of the attack and use buttons in the last second. |
| `input::inventory` | 14 | `func() -> list<inventory-stack>` | The player's stacks as of this tick; empty slots are left out. |
| `input::swap_offhand` | 14 | `func(slot: u32) -> result<_, string>` | Swaps inventory slot `slot` (0 to 35) with the off hand at the end of the tick, as F over it in the inventory screen does (`ServerboundContainerClickPacket`, SWAP with button 40, on the player's own menu). |
| `input::current_screen` | 15 | `func() -> screen-kind` | The screen as of this tick (or frame, for a mod with a `frame` hook). |
| `input::open_inventory` | 15 | `func()` | Opens the player's inventory screen at the end of the tick, as the inventory key does (vanilla opens it without a packet). |
| `input::close_inventory` | 15 | `func()` | Closes the player's inventory screen at the end of the tick, as Esc does (`ServerboundContainerClosePacket` for the player's menu). |
| `input::select_hotbar` | 16 | `func(slot: u32) -> result<_, string>` | Selects hotbar slot `slot` (0 to 8) at the end of the tick, as the number keys do (the server learns of it with the next `ServerboundSetCarriedItemPacket`). |
| `input::swap_hands` | 16 | `func()` | Swaps the main hand with the off hand at the end of the tick, as the swap-hands key (F) does: on a server it sends `ServerboundPlayerActionPacket` SWAP_ITEM_WITH_OFFHAND and the server answers with both slots. |

### `render` (render, experimental)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `render::set_hud` | 0 | `func(shapes: list<shape>)` | Replaces the mod's HUD shapes: up to 1024, drawn every frame in order over the HUD (after the hotbar, under chat and screens), hidden with the HUD (F1). |
| `render::set_hud_scale` | 7 | `func(scale: f32)` | Draws the mod's HUD shapes `scale` times larger from the screen's top left (0.25 to 16; 1 is as given), the text included. |
| `render::set_hud_always` | 9 | `func(on: bool)` | Draws the mod's HUD shapes over everything, menus and the title screen included, and keeps them with the HUD hidden (true), or only with the HUD (false, the default). |
| `render::set_hud_drag` | 9 | `func(area: option<rect>)` | The part of the mod's HUD the player can drag with a touch, in its HUD pixels (before `set-hud-scale`); none ends it. |
| `render::take_hud_drag` | 9 | `func() -> option<hud-drag>` | The drag since the last call, if any. |
| `render::gui_size` | 0 | `func() -> tuple<f32, f32>` | The screen's size in GUI pixels (width, height), as of this tick. |
| `render::shake` | 0 | `func(strength: f32, seconds: f32)` | Shakes the camera: a jolt of `strength` (0 to 1, 1 the hardest) that fades out over `seconds` (at most 10). |
| `render::set_corner` | 0 | `func(corner: corner, width: f32, height: f32, shapes: list<shape>)` | Replaces the mod's corner panel: shapes in GUI pixels from the top left of a `width` × `height` box that the game places in `corner`, stacked with the game's overlays and the other mods' panels (under the status effec... |
| `render::clear_corner` | 0 | `func()` | Removes the mod's corner panel. |
| `render::text_width` | 0 | `func(text: string) -> f32` | The width of one line of text in GUI pixels, in the HUD's font: exact for Latin letters (U+0000 to U+024F), 6 per other character. |
| `render::frame_stats` | 0 | `func() -> frame-rate` | The game's frame counter, recomputed twice a second. |
| `render::set_zoom` | 0 | `func(zoom: zoom)` | Zooms the camera until the next call (`factor` 1 ends it), only while playing: a screen opening or the spyglass's own view (which wins) leave the camera vanilla's. |
| `render::spawn_model` | 11 | `func(geometry: string, texture: string, place: model-place) -> result<u32, string>` | GeckoLib-style models (API level 11): a Bedrock geometry from the mod's `models/` folder (`models/<name>.geo.json`, GeckoLib's format) drawn with a PNG of at most 128x128 from the same folder, in the world. |
| `render::place_model` | 11 | `func(id: u32, place: model-place)` | Moves, turns and scales model `id` to `place`. |
| `render::play_animation` | 11 | `func(id: u32, file: string, name: string, looping: bool)` | Plays animation `name` of `models/<file>.animation.json` (Bedrock animations, GeckoLib's format) on the model, from its start. |
| `render::stop_animation` | 11 | `func(id: u32)` | Stops the animation playing on model `id`; it keeps its pose. |
| `render::set_bone` | 11 | `func(id: u32, bone: string, rotation: tuple<f32, f32, f32>, visible: bool)` | Turns a bone by `rotation` (degrees, Bedrock axes) on top of the animation, and shows or hides it with its children (GeckoLib's `getBone(...).setRot` and `setHidden`). |
| `render::remove_model` | 11 | `func(id: u32)` | Takes model `id` away. |
| `render::spawn_model_json` | 11 | `func(geometry: string, texture: string, place: model-place) -> result<u32, string>` | A model from Bedrock geometry text the mod builds itself (as 3D Skin Layers builds voxels), textured by a PNG in `models/` or by `player:skin`, the local player's skin. |
| `render::attach_model` | 11 | `func(id: u32, part: string)` | Hangs the model on a part of the local player's model (`head`, `body`, `right_arm`, `left_arm`, `right_leg`, `left_leg`), drawn with it in third person and moving with it; empty puts it back in the world. |
| `render::hide_player_parts` | 11 | `func(parts: list<string>)` | Hides these parts of the local player's model (`hat`, `jacket`, `left_sleeve`, ...), as 3D Skin Layers hides the flat second layer. |
| `render::player_skin_slim` | 11 | `func() -> bool` | Whether the local player's skin has slim (3 pixel) arms. |
| `render::player_skin` | 11 | `func() -> option<list<u8>>` | The local player's skin as drawn: 64x64 RGBA, row by row; none before a world is open. |
| `render::set_player_cape` | 11 | `func(texture: string) -> result<_, string>` | Gives the local player this cape, a 64x32 PNG in the mod's `models/` (also drawn on its elytra), in place of its account's; empty gives the account's back. |
| `render::set_minimap` | 1 | `func(minimap: option<minimap>)` | Shows a map of the world around the player in `corner`, stacked with the game's overlays and the mods' panels, until the next call (none hides it). |
| `render::set_far_terrain` | 7 | `func(far-terrain: option<far-terrain>)` | Draws the world beyond the render distance as distant terrain, out to `distance` chunks, until the next call (none ends it). |
| `render::set_world_shapes` | 13 | `func(shapes: list<world-shape>, on-top: list<world-shape>)` | Draws lines in the world every frame until the next call: `shapes` hidden by the blocks in front of them, `on-top` over everything. |
| `render::hide_hitboxes` | 13 | `func(hide: bool)` | Leaves out the game's own hitboxes (F3+B) while true, for a mod that draws its own with `set-world-shapes`. |

### `recipes` (recipes, experimental)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `recipes::items` | 5 | `func() -> list<item>` | Every item, in the registry's order: `stack.item` indexes this list. |
| `recipes::all` | 5 | `func() -> list<recipe>` | Every recipe: the book's in its order, then campfire, stonecutting, smithing and brewing. |
| `recipes::known` | 5 | `func() -> list<s32>` | The `book-id`s of the recipes the player's recipe book holds now. |
| `recipes::place` | 6 | `func(book-id: s32, all: bool) -> result<_, string>` | Places a recipe in the open screen's grid as a click in the recipe book does (`ServerboundPlaceRecipePacket`): the inventory's grid or a crafting table. |
| `recipes::give` | 6 | `func(stack: stack) -> result<_, string>` | Creative mode only: gives the player the stack, as taking it from the creative inventory does (`ServerboundSetCreativeModeSlot`): the selected slot first, then the hotbar, then the inventory. |

### `browser` (recipes, experimental)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `browser::set_items` | 6 | `func(items: list<stack>)` | The panel's items, at most 8192 (an empty list hides the panel). |
| `browser::set_recipes` | 6 | `func(title: string, tabs: list<stack>, tab: u32, recipes: list<recipe-view>)` | Shows these recipes in the panel instead of its items, as many as fit a page, under `title` and a back button, with a row of `tabs` (each an icon; `tab` is the selected one) between them; an empty list of recipes show... |
| `browser::poll` | 6 | `func() -> list<event>` | What the player did on the panel since the last poll, at most 256 kept. |

### `players` (players)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `players::online` | 1 | `func() -> list<player>` | The players online, in the order they joined. |
| `players::tell` | 1 | `func(player: string, text: string) -> bool` | A system message to one player, after the mod's name; false when no player with that id is online. |
| `players::broadcast` | 1 | `func(text: string)` | A system message to every player and the server's log, after the mod's name. |

### `world` (world)

| Rust call | Level | WIT signature | What it does |
|---|---|---|---|
| `world::get_block` | 4 | `func(dimension: string, x: s32, y: s32, z: s32) -> option<string>` | The block state at a position in a dimension (`minecraft:overworld`, ...), as `minecraft:oak_log[axis=y]`, as of this call: none where the server has no chunk loaded there. |
| `world::get_biome` | 4 | `func(dimension: string, x: s32, y: s32, z: s32) -> option<string>` | The biome at a position (`minecraft:plains`, ...), as the server stores it (one per 4 x 4 x 4 cell): none where no chunk is loaded. |
| `world::set_blocks` | 4 | `func(dimension: string, blocks: list<block-change>) -> result<_, string>` | Sets blocks as `/setblock` does: the old block entity removed, neighbours and shapes updated, light, and every player told. |
