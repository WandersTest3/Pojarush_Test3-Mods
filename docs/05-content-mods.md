# 5. Content mods

A content mod has **no code**. It is a `.hmod` holding `horizon-mod.toml`, `assets/` and `data/`. It runs on the 64-bit and the
32-bit APK. The game reads the content **once when it starts**, so restart the game after installing or changing one.

Start from the template:

```sh
cargo horizon-mod new my-blocks --template content --name "My Blocks"
cd my-blocks
cargo horizon-mod build
cargo horizon-mod check target/horizon-mod/my_blocks.hmod
```

A working copy is [`../examples/content-glowing-block`](../examples/content-glowing-block).

## Manifest

```toml
id = "content_glowing_block"
name = "Example Glowing Block"
version = "1.0.0"
description = "A glowing amethyst block."
authors = ["Wanders_Test3"]
api = "0.2"
side = "both"
capabilities = ["registries"]
minecraft = "26.3"
license = "Mod Test3 License V1.0"
```

## Files

| Path in the `.hmod` | Purpose |
|---|---|
| `data/<id>/horizon/block/<name>.json` | declares a block from a vanilla template |
| `data/<id>/horizon/item/<name>.json` | declares an item from a vanilla template |
| `assets/<id>/blockstates/<name>.json` | which model for which state (resource-pack format) |
| `assets/<id>/models/block/<name>.json` | the block model |
| `assets/<id>/models/item/<name>.json`, `assets/<id>/items/<name>.json` | the item's look (26.3 item definition) |
| `assets/<id>/textures/...` | PNG textures |
| `assets/<id>/lang/en_us.json` | names: `"block.<id>.<name>": "Name"`, `"item.<id>.<name>": "Name"` |
| `data/<id>/recipe/<name>.json` | recipes (26.3 data-pack format) |
| `data/<id>/loot_table/blocks/<name>.json` | what the block drops |
| `data/minecraft/tags/block/mineable/pickaxe.json` | **adds** to a vanilla tag (the only `minecraft` files allowed) |
| `data/c/tags/...` | adds to the convention tags Fabric and NeoForge mods share |

## Declaring a block

A block copies a vanilla block (its behaviour class, state properties and shapes) and overrides numbers:

```json
{
  "template": "minecraft:amethyst_block",
  "properties": { "hardness": 2.0, "light": 7 }
}
```

Properties seen in the launcher's reference docs: `hardness`, `light`, `explosion_resistance`, `map_color`, `requires_tool`,
a sound set taken from a vanilla block (`sounds` in `horizon/docs/mods.md`, `sound` in `horizon/docs/modpacks.md`: confirm the
key with `cargo horizon-mod check`, which refuses unknown keys), and `"item": true` to create the block item at the same time.
A block may set `shapes` (up to 16 boxes per template state value, in block units), and `default_state`
(`{"facing": "north"}`) to change the template's default state.

## Declaring an item

An item copies a vanilla item. `max_stack_size` and `rarity` change directly; any other 26.3 data component is set or
removed in `components`, written as a data component patch (`minecraft:<type>` sets, `!minecraft:<type>` with `{}` removes):

```json
{
  "template": "minecraft:iron_sword",
  "components": {
    "minecraft:max_damage": 900,
    "minecraft:attribute_modifiers": [{ "type": "minecraft:attack_damage",
      "id": "minecraft:base_attack_damage", "amount": 7.0,
      "operation": "add_value", "slot": "mainhand" }],
    "!minecraft:repairable": {}
  }
}
```

A component type that no vanilla item has is **refused** (a misspelling fails the load instead of doing nothing).
Behaviour the game ties to a vanilla item's id does not come along: a copy of the trident does not throw.

## Rules

- Files go in the mod's own namespaces (`assets/<id>/`, `data/<id>/`, and any listed in `namespaces = [...]`), plus additions
  to vanilla tags (`data/minecraft/tags/`) and convention tags (`data/c/tags/`).
- Tags merge as a data pack's do: a mod's file adds its values after vanilla's. `"replace": true` drops what came before.
  An entry naming an id nobody registers is dropped; the rest of the tag still loads.
- Two mods that are on cannot own the same namespace; the first by file name loads.
- Paths use vanilla's resource characters; at most 65,536 files, 16 MiB each and 512 MiB in all.
- A mod whose content is refused is left out, with the reason in the log. A blockstate that does not bind, a model that is
  missing or does not parse, or a recipe that does not parse is logged and skipped; the rest loads.
- Mod block states are appended after vanilla's, so vanilla ids never move. Saves store block names.
- Not available yet: syncing mod registries in multiplayer, redefining vanilla ids (refused), mod biomes and density functions.
- Blocks and items only get behaviour that the **template** has. For new behaviour (a machine, a custom GUI) there is no content-only
  way; see [limits](09-limits-and-needs.md).

## Textures and assets

Do **not** put Mojang's textures or sounds in a mod. Reference vanilla textures by id (`"minecraft:block/amethyst_block"` in a
model), draw your own PNGs, or use assets you own or that are licensed for reuse, and say so in the description and license.

## Adding to structures

To add to structure sets or template pools that are not the mod's own, a set or pool file in the mod's namespace holds
`horizon:add_to`:

```json
{ "horizon:add_to": "minecraft:villages",
  "structures": [ { "structure": "mymod:village_beach", "weight": 10 } ] }
```

Structures and worldgen JSON from the mod join the game's worldgen bundles. See the launcher repository's
`horizon/docs/mods.md` and `horizon/docs/modpacks.md` for the data formats in full.

## Check it

```sh
cargo horizon-mod check target/horizon-mod/<id>.hmod
```

It prints the size, SHA-256 and "may add blocks, items, mob effects and entity types to your worlds"; a refused file
prints the reason.
