# 10. AI playbook

Instructions for an AI assistant (Claude, ChatGPT, Gemini, a coding agent...) asked to **make a Pojarush mod, port a mod, or
say what is missing**. Follow it in order. Everything it refers to is in this repository.

## Rules that never bend

1. **Do not invent.** No made-up functions, capabilities, files, levels, values or compatibility. If a function is not in the
   [API cheat sheet](06-api-cheatsheet.md) or the SDK source, it does not exist. Say so and offer the closest real option.
2. **Do not claim what you did not run.** Say "built", "checked" or "tested in the sandbox" only after running
   `cargo horizon-mod build`, `check` and `test` and reading the output. Say plainly that nothing was tested on a device when
   that is the case.
3. **Never use Mojang's assets** (textures, sounds, models) or another author's files without a license that allows it.
4. **Respect licenses.** For ports, read the original's license first ([page 7](07-porting.md)). For the maintainer's own
   mods use `Mod Test3 License V1.0` (https://github.com/WandersTest3/Mod-Test3-License-V1.0). Never invent or swap a license.
5. **If the user names a reference file, repository or mod that you cannot read, ask for it** before going on. Never invent its
   content.
6. **No fake features.** Settings, buttons and options must do something real. Do not add placeholder menus.
7. **Report limits honestly.** If part of the request is impossible, say which part and why in one or two lines, then deliver
   the best feasible version.

## Decision flow

```
Request
 ├─ "Make a mod that ..."          -> A. New mod
 ├─ "Port <Java mod / .hmod> ..."  -> B. Port
 ├─ "Can Pojarush do X?" / "what is missing" -> C. Feasibility report
 └─ "Fix / update my mod"          -> D. Change an existing mod
```

### A. New mod

1. **Classify** with [page 1](01-concepts.md): content (data only) or code (logic). If both are needed, make a code mod and a
   content mod, or say that blocks with new behavior are impossible ([page 9](09-limits-and-needs.md)).
2. **Check feasibility** against the API cheat sheet. List the functions you will use and their levels. Note the highest level:
   it is the mod's minimum game version.
3. **Start from the nearest example** in [`../examples`](../examples):
   - command or chat logic -> `hello-command`
   - HUD, settings page, saved settings -> `hud-session-timer`
   - own key -> `key-toggle`
   - blocks and items -> `content-glowing-block`
   For larger patterns (inventory, zoom, models, world shapes) open the mod named on the [docs index](README.md#larger-real-mods).
4. **Create the project**: `cargo horizon-mod new <id> --template code --sdk-path <path>/sdk/horizon-mod-sdk`
   (or `--template content`).
5. **Write the manifest** ([page 3](03-manifest.md)): `api`, `side`, exact `capabilities`, `experimental` for `ui` / `render` /
   `input` / `recipes`, `minecraft = "26.3"`, `license`, `[contact]`, `[translations.pt_br]`.
6. **Write the code** with the patterns of [page 4](04-code-mods.md). Conventions that match the other Pojarush mods:
   - settings on a page in Options > Mods, saved with `storage`, defaults restorable (`ui::set_resets`);
   - keys through `input::register_key`, rebindable;
   - texts in English with Brazilian and European Portuguese tables chosen by `ui::language()`;
   - no comments in the code unless the user asks for them (the maintainer's rule), no dead code, simple functions;
   - draw only when something changed; do almost nothing in `frame`.
7. **Verify**:
   ```sh
   cargo horizon-mod build
   cargo horizon-mod check target/horizon-mod/<id>.hmod     # note "needs mod API level N"
   cargo horizon-mod test                                    # add tests/*.toml for commands, ticks, chat, panels
   ```
   Fix every error and warning you can. If `check` prints a trial-run failure, the mod will not load.
8. **Deliver** the `.hmod`, plus the source folder when the user wants it, and a short note (below).

### B. Port

Follow [page 7](07-porting.md): license, classification, concept mapping, one feature at a time. Deliver the feasibility verdict per
feature with the port: ported / partly ported / not possible (and why).

For an upstream Horizon `.hmod` with a `[wasm]` table, first suggest trying it as it is on a 64-bit phone and reading the log for
"unprovided" lines ([page 9](09-limits-and-needs.md)); port it with the Pojarush SDK only if features are missing.

### C. Feasibility report

Use this exact shape so the maintainer can act on it:

```
Idea: <one sentence>
Verdict: possible | partly possible | not possible today

What works today
- <feature> -> <function(s) and level> (evidence: <page / reference>)

What does not
- <feature> -> missing: <exact function or event>, because <reason>
  Proposed addition: <name>(<args>) -> <return>, capability <x>, level +1

Not verified
- <anything you could not check>

Closest alternative: <what could be built now>
```

Base every line on [page 9](09-limits-and-needs.md), the API cheat sheet or the SDK source. If you are unsure, move it to "Not verified".

### D. Change an existing mod

1. Read the existing source and manifest before editing. Keep the architecture, names and file layout.
2. **Raise the version** (last digit first: `1.0.0` -> `1.0.1`; the site refuses a version already published).
3. Keep saved settings readable: if a key is renamed or its unit changes, convert the old value on load (see Auto Totem's `delay`
   -> `delay_ms`).
4. Re-run `build`, `check`, `test`.

## What to hand back

Keep it short and verifiable:

```
Built: <id> <version> (<kind>) - <file name>
Needs: mod API level <N>, Pojarush <version>, <64-bit only | any device>
Checked: cargo horizon-mod check passed; test passed (<n> steps)
Not tested on a device: <keys / screens / drawing / ...>
Limits: <what the mod does not do>
```

Include the changelog line for the site and the files that must be installed.

## Common mistakes seen in practice

| Mistake | Fix |
|---|---|
| Calling a function from a newer level than the player's game | check the level column; avoid it or document the minimum |
| Forgetting `experimental = [...]` | repeat every experimental capability |
| Redrawing every frame | remember the last output and skip identical calls |
| Using ticks for millisecond delays | use `frame(seconds)` and accumulate milliseconds |
| Treating `ui_select` row as a value for a button | a button click is row 0; a slider's row is its position |
| Pointing the SDK dependency at the launcher repository by git | use the vendored SDK in this repository (`sdk/horizon-mod-sdk`) |
| Assuming the test sandbox simulates keys or drawing | it does not; say what needs a device |
| Putting Mojang's textures in the `.hmod` | reference vanilla textures by id instead |
| Declaring compatibility that was not verified | write only what you checked |
| Renaming `id` between versions | the id is the identity on the site and for saved settings |

## Where to look things up

| Need | File |
|---|---|
| An exact function, its signature and level | [06-api-cheatsheet.md](06-api-cheatsheet.md) |
| A record or enum field | the launcher's `horizon/docs/api/mods-reference.md` (link in page 6) |
| The Rust trait and macros | [`../sdk/horizon-mod-sdk/src/lib.rs`](../sdk/horizon-mod-sdk/src/lib.rs) |
| A working example | [`../examples`](../examples) |
| Data formats for content mods | the launcher's `horizon/docs/mods.md` and `horizon/docs/modpacks.md` |
| What the site accepts | [08-publishing.md](08-publishing.md) and `../site/config.json` |
