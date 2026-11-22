# 4. Code mods (Rust to WebAssembly)

A code mod is a Rust `cdylib` crate that implements the `Mod` trait of `horizon-mod-sdk`, exported with
`export_mod!`. `cargo horizon-mod build` compiles it for `wasm32-unknown-unknown` and packs it into a `.hmod`.

Every snippet on this page is taken from, or is a reduced form of, a mod in this repository's `examples/` (built and
tested) or in the launcher repository's `horizon/mods/` (shipped). Function names are exact; the list of every function is
in the [API cheat sheet](06-api-cheatsheet.md).

## Project layout

```
my-mod/
├── Cargo.toml          cdylib crate depending on horizon-mod-sdk
├── horizon-mod.toml    the manifest (page 3)
├── LICENSE.txt         optional, a license text or pointer
├── src/lib.rs          the mod
├── assets/<id>/icon.png    optional icon
├── models/             optional: GeckoLib-style models, capes (page 4, Models)
└── tests/*.toml        test scripts
```

`Cargo.toml`:

```toml
[package]
name = "my-mod"
version = "1.0.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]

[dependencies]
horizon-mod-sdk = { path = "../Pojarush_Test3-Mods/sdk/horizon-mod-sdk" }

[profile.release]
opt-level = "s"
lto = true
strip = true

[workspace]
```

The empty `[workspace]` keeps Cargo from joining a parent workspace.

## The `Mod` trait

```rust
use horizon_mod_sdk::{Mod, Registration, chat};

struct Hello { greeted: u32 }

impl Mod for Hello {
    // once, after loading. Err(text) keeps the mod off and shows the text in red
    fn init() -> Result<(Self, Registration), String> {
        Ok((Hello { greeted: 0 }, Registration::new().command("hello")))
    }

    // /hello args. Ok(Some(text)) = feedback, Ok(None) = nothing, Err(text) = red error
    fn command(&mut self, _name: &str, args: &str) -> Result<Option<String>, String> {
        self.greeted += 1;
        chat::show(&format!("Hello {args}! ({} so far)", self.greeted));
        Ok(None)
    }
}

horizon_mod_sdk::export_mod!(Hello);
```

| Method | Called | Ask for it with |
|---|---|---|
| `init()` | once, after loading | always |
| `tick(tick: u64)` | 20 times per second **while in a world** (50 ms per tick) | `Registration::new().on_tick()` |
| `frame(seconds: f32)` | every drawn frame, with the seconds since the last one; budget **0.1 ms** | `.on_frame()` |
| `command(name, args)` | the player types `/name args` | `.command("name")` (a name vanilla already uses is refused) |
| `chat(text)` | a chat line reached the player | `.on_chat()` |
| `ui_select(id, row)` | a button, slider or list row was used (capability `ui`) | automatic |
| `ui_closed()` | the player left the mod's own screen | automatic |
| `ui_settings_opened()` | the player opened the mod's page in Options > Mods | automatic |

Rules that follow from the sandbox:

- The mod is **single-threaded**; state lives in your struct. Do not spawn threads.
- No file system, no network, no wall clock. Count time with `tick` (50 ms each) or with the `seconds` that `frame` gives.
- A panic stops the mod and the game shows why. Prefer returning `Err` from `init` and ignoring failures elsewhere
  (`let _ = storage::set(...)`).
- Do as little as possible in `frame`; skip work when nothing changed (see "Draw only when it changed").
- `render` and `hud` output **stays until you replace or clear it**; you do not redraw every frame.

## Pattern: saved settings (capability `storage`)

`storage` is a per-mod folder of small files. Keys are `[a-z0-9_.-]{1,64}`. Values are bytes.

```rust
use horizon_mod_sdk::storage;

const FILE: &str = "timer.txt";

fn load() -> (bool, usize) {
    let mut enabled = true;
    let mut corner = 0;
    if let Some(text) = storage::get(FILE).and_then(|v| String::from_utf8(v).ok()) {
        for line in text.lines() {
            match line.split_once('=') {
                Some(("enabled", v)) => enabled = v.trim() == "1",
                Some(("corner", v)) => corner = v.trim().parse::<usize>().unwrap_or(0).min(3),
                _ => {}
            }
        }
    }
    (enabled, corner)
}

fn save(enabled: bool, corner: usize) {
    let _ = storage::set(FILE, format!("enabled={}\ncorner={}\n", u8::from(enabled), corner).as_bytes());
}
```

Parse defensively (clamp, default on error) and keep old keys readable when you rename one: Auto Totem 1.0.2 still reads
the `delay` (ticks) of 1.0.1 and converts it to `delay_ms`.

## Pattern: a settings page (capability `ui`, experimental)

The page appears in Options > Mods on the mod's row. Layout and look belong to the game: you say what the widgets hold.

```rust
use horizon_mod_sdk::ui::{self, ButtonWidget, SliderWidget, WidgetV2 as Widget};

const TOGGLE: u32 = 0;
const DELAY: u32 = 1;

fn page(enabled: bool, delay_ms: u32) {
    ui::set_settings_v2(&[
        Widget::Button(ButtonWidget { id: TOGGLE, label: format!("Enabled: {}", if enabled { "On" } else { "Off" }) }),
        Widget::Slider(SliderWidget { id: DELAY, label: format!("Delay: {delay_ms} ms"), steps: 40, position: delay_ms / 25 }),
    ]);
}

// in impl Mod:
fn ui_settings_opened(&mut self) { page(self.enabled, self.delay); }   // push fresh widgets when the page opens

fn ui_select(&mut self, id: u32, row: u32) {
    match id {
        TOGGLE => self.enabled = !self.enabled,        // a button click is row 0
        DELAY => self.delay = row * 25,                // a slider drag: row is the position 0..=steps
        _ => return,
    }
    self.save();
    page(self.enabled, self.delay);                    // update the labels while the page shows
}
```

- Widget `id`s are yours. Reserve `0xFFFFFF00` and above (the game uses them for the title and video buttons).
- A slider has `steps + 1` positions (0 to `steps`, at most 100000); you map the position to your value and write the value in
  the label. `ui::set_slider(id, position, label)` updates one slider without resending the page.
- `ui::set_resets(&[ids])` marks buttons and sliders that **Shift + click** puts back to the default. The game then calls
  `ui_select(id, u32::MAX)`; set your default and push the page again.
- Widget kinds: `Text`, `Button`, `Item` (icon and name), `List` (rows), `Slider` (`WidgetV2`); `WidgetV3` adds `Entity`
  (the player or a mob in 3D). `ui::open_screen_v3` opens a screen of the mod's own.
- Translate labels with `ui::language()` (`"en_us"`, `"pt_br"`, `"pt_pt"`...). The usual shape is a table of strings
  per language and an index (see `examples/` and `pojarush-autototem`).
- A settings page of 64 widgets at most; text up to 256 characters.

`pojarush-lib` (launcher repository, `horizon/mods/pojarush-lib`) builds this page from a typed `Config` for you.

## Pattern: HUD and drawing (capability `render`, experimental)

Three ways to put things on screen, from simplest to most flexible:

| Tool | Use it for |
|---|---|
| `hud::set_panel(corner, &[Line])` (capability `hud`, not experimental) | up to 16 plain text lines in a corner; the game stacks it with other mods' panels |
| `render::set_corner(corner, w, h, &shapes)` | your own shapes in a `w x h` box that the game places in a corner and stacks with other panels |
| `render::set_hud(&shapes)` | shapes anywhere on the HUD (up to 1024), hidden with F1; with `set_hud_scale`, `set_hud_always`, `set_hud_drag` for size, always-visible and finger-draggable |

Shapes: `Shape::Fill`, `Shape::Quad`, `Shape::Sprite` (a GUI sprite by name), `Shape::Item` (an item icon),
`Shape::Text`. Coordinates are **GUI pixels from the screen's top left**; colors are `0xAARRGGBB` for fills and `0xRRGGBB`
for text. `render::text_width(&text)` measures a line; `render::gui_size()` gives the screen size.

```rust
use horizon_mod_sdk::render::{self, Corner, FillShape, Point, Rect, Shape, TextShape};

let text = format!("Session {}", self.clock());
let w = render::text_width(&text) + 6.0;
render::set_corner(Corner::TopLeft, w, 13.0, &[
    Shape::Fill(FillShape { rect: Rect { x: 0.0, y: 0.0, w, h: 13.0 }, color: 0x80000000 }),
    Shape::Text(TextShape { text, at: Point { x: 3.0, y: 3.0 }, color: 0xFFFFFF, centered: false, shadow: true }),
]);
```

### Draw only when it changed

Remember the last thing drawn and skip the call when it is identical:

```rust
if text == self.shown { return; }   // nothing to resend
self.shown = text.clone();
```

Auto Totem keeps `(count, gui_size)` and redraws its totem counter only when either changes.

### Draggable HUD

```rust
render::set_hud_scale(self.scale);
render::set_hud_always(true);                              // visible over menus too
render::set_hud(&shapes);
render::set_hud_drag(Some(Rect { x, y, w, h }));           // the area a finger or the mouse can drag
// each tick or frame:
if let Some(d) = render::take_hud_drag() { self.x += d.dx; self.y += d.dy; if d.done { self.save(); } }
```

Coordinates passed to `set_hud_drag` are in HUD pixels, before `set_hud_scale`.

## Pattern: a key of the mod's own (capability `input`, experimental)

```rust
use horizon_mod_sdk::input::{self, Event};

// init():
input::register_key("toggle_line", "Toggle the HUD line", "key.keyboard.j")?;   // name, label, default key as options.txt writes it

// tick() or frame():
for event in input::poll() {
    if let Event::KeyDown(name) = event {
        if name == "toggle_line" { /* ... */ }
    }
}
```

- At most 16 keys per mod. An unknown key string is an error. The player can rebind the key in Controls > Key Binds
  (a section per mod) or on the mod's page; that binding wins.
- `key-down` / `key-up` events arrive only while playing with **no screen open**; opening a screen releases every held key.
  The game's own binding on that key still runs.
- Use `key.keyboard.unknown` as the default to register a key that is unbound until the player picks one.
- `input::mapping("key.forward")` reads a vanilla binding (`key.forward/left/back/right/jump/sneak/sprint/attack/use`)
  as the player bound it: `{ label, down }`. `input::clicks_per_second()` gives `(attack, use)` over the last second.
- `input::claim_wheel(true)` takes the mouse wheel (the hotbar stops moving) and delivers `Event::Wheel(f32)`; the game gives it
  back when the mod stops. `input::claim_items(&[ids])` takes over the use button on those items (`Event::UseStart` /
  `UseStop`).
- Events wait for `poll` (at most 256 are kept).

## Pattern: inventory, off hand and screens (level 14 and 15)

```rust
use horizon_mod_sdk::input::{self, ScreenKind};

let stacks = input::inventory();     // slots: 0-8 hotbar, 9-35 inventory, 36-39 armor (feet, legs, chest, head), 40 off hand
input::select_hotbar(2).ok();            // level 16: select hotbar slot 3 (0-8), as the number keys do
input::swap_hands();                  // level 16: swap main and off hand, as the F key does
let totems: u32 = stacks.iter().filter(|s| s.id == "minecraft:totem_of_undying").map(|s| s.count).sum();

input::swap_offhand(slot)?;          // swap slot 0..=35 with the off hand at the end of the tick (like F in the inventory)
match input::current_screen() {      // Playing, Inventory or Other (chat, a chest, the pause menu...)
    ScreenKind::Playing => input::open_inventory(),   // opens the player's inventory screen at the end of the tick
    ScreenKind::Inventory => input::close_inventory(),
    ScreenKind::Other => {}
}
```

The game skips `swap_offhand` while another container is open or the cursor holds a stack, and `open_inventory` /
`close_inventory` while another screen is open, in creative mode or without a player. At most 4 swaps per call.

`pojarush-autototem` uses these in a **frame-driven state machine** (`Idle -> Waiting(ms) -> Opening -> swap -> Closing(ms)
-> Cooldown -> Idle`) so delays are in milliseconds regardless of frame rate. The shape worth copying:

```rust
enum Step { Idle, Waiting(f32), Opening(f32), Closing(f32), Cooldown(f32) }

fn frame(&mut self, seconds: f32) {
    let ms = seconds * 1000.0;
    self.step = match std::mem::replace(&mut self.step, Step::Idle) {
        Step::Waiting(t) if t + ms < self.delay as f32 => Step::Waiting(t + ms),
        Step::Waiting(_) => { /* do the action, move on */ Step::Cooldown(0.0) }
        Step::Cooldown(t) if t + ms < 300.0 => Step::Cooldown(t + ms),
        _ => Step::Idle,
    };
}
```

Full source: https://github.com/WandersTest3/Pojarush_Test3/blob/main/horizon/mods/pojarush-autototem/src/lib.rs

## Pattern: commands that run vanilla commands (capability `command`)

`command::run("time set day")` runs a vanilla command as the player with the player's permissions after the hook returns
(8 per call). `command::run_quiet(&[...])` runs up to 256 lines with no chat feedback (64 a tick). A mod's own commands are
never run this way.

## Pattern: camera, zoom and shake (capability `render`)

```rust
use horizon_mod_sdk::render::{self, Zoom};
render::set_zoom(Zoom { factor: 4.0, smooth: true, turn: 0.5 });   // factor 1 ends it; 0.25 (wide) to 50
render::shake(0.4, 1.5);                                            // strength 0..1, seconds (at most 10)
```

Zoom applies only while playing; the spyglass wins. With several mods, the strongest zoom counts.
`pojarush-zoom` combines this with `input::claim_wheel`.

## Pattern: models (capability `render`, level 11)

GeckoLib-style: put `models/<name>.geo.json` (Bedrock geometry), `models/<name>.animation.json` and a PNG (at most 128x128)
in the mod; `cargo horizon-mod build` packs the `models/` folder.

```rust
let id = render::spawn_model("totem.geo.json", "totem.png", ModelPlace { x, y, z, yaw, pitch: 0.0, scale: 1.0 })?;
render::play_animation(id, "totem.animation.json", "animation.totem.spin", true);
render::set_bone(id, "head", (0.0, 45.0, 0.0), true);
render::remove_model(id);
```

At most 64 models per mod. `spawn_model_json` takes geometry text built in code with the texture `"player:skin"`;
`attach_model(id, "head")` hangs it on a part of the player; `hide_player_parts`, `player_skin`, `player_skin_slim` and
`set_player_cape` exist too. Molang expressions in animations count as 0 for now. Examples: `pojarush-geckodemo`,
`pojarush-3dskinlayers`, `acvcape`.

## Pattern: drawing in the world and reading entities (level 13)

```rust
let near = game::entities(32.0);                       // nearest first, as this frame shows them
render::set_world_shapes(&[WorldShape::Cuboid(WorldBox { min, max, color: 0xFFFF0000, width: 2.0 })], &[]);
render::hide_hitboxes(true);                           // leave out the game's own F3+B boxes
```

`set_world_shapes(shapes, on_top)`: `shapes` are hidden by blocks in front; `on_top` draw over everything (8192 each at most).
Example: `combat-hitboxes`.

## Pattern: server mods (`api = "0.3"`, experimental)

The SDK has a `server` module (`ServerMod`, `export_server_mod!`, typed command arguments, player and block events) for mods that
run where the world is simulated. This tutorial's examples are client mods. A server mod is not covered by device testing
here; read `sdk/horizon-mod-sdk/src/lib.rs` and the `horizon-server-mod` world in the reference before relying on it.

## Gotchas

| Gotcha | Detail |
|---|---|
| `tick` stops outside a world | on the title screen only `frame` runs (if requested). Keep per-world state out of `init` |
| Time | 1 tick = 50 ms. Use the `seconds` of `frame` for millisecond timing, not tick counts |
| Strings | text up to 256 characters per line or label; at most 16 HUD panel lines |
| Colors | text `0xRRGGBB`; fills, quads and sprite tints `0xAARRGGBB` |
| Unknown ids | an unknown item or sprite draws nothing (or a "?"); it is not an error |
| Experimental interfaces | may change in any release; keep the use small and isolated so a fix is one place |
| `render::set_hud` clears | calling it with `&[]` removes your shapes; a mod that shares the HUD with `set_corner` must pick one owner |
| One map, one far terrain | `set_minimap` and `set_far_terrain` show the first loaded mod's |
| Two `Corner` types | `hud::Corner` (for `hud::set_panel`) and `render::Corner` (for `render::set_corner`) are different types; import the right one |
| Library size | `opt-level = "s"`, `lto = true`, `strip = true` keep a mod around 10-40 KB |
