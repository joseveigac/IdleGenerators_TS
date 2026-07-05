# Wood Set — Design & Build Spec (v1.1.0 Workstream C)

**Date:** 2026-07-05
**Branch:** `feat/v1.1.0-storage-sharding`
**Status:** approved, building
**Depends on:** nothing (independent of Storage Sharding / Workstream A). Reuses the existing
`oak_log_generator` as the structural template.

## Goal

Add a **Wood Set**: idle generators for every natural overworld tree log, mirroring the already-wired
(but recipe-less, therefore "disabled") `oak_log` generator. Also **enable `oak_log`** by giving it the
crafting recipe it currently lacks.

## Scope — 8 new generators + enable oak

| key | block id | item produced | glyph | side / top vanilla texture |
|-----|----------|---------------|-------|----------------------------|
| `spruce_log`   | `idleoregen:spruce_log_generator`   | `minecraft:spruce_log`   | `` | `log_spruce` / `log_spruce_top` |
| `birch_log`    | `idleoregen:birch_log_generator`    | `minecraft:birch_log`    | `` | `log_birch` / `log_birch_top` |
| `jungle_log`   | `idleoregen:jungle_log_generator`   | `minecraft:jungle_log`   | `` | `log_jungle` / `log_jungle_top` |
| `acacia_log`   | `idleoregen:acacia_log_generator`   | `minecraft:acacia_log`   | `` | `log_acacia` / `log_acacia_top` |
| `dark_oak_log` | `idleoregen:dark_oak_log_generator` | `minecraft:dark_oak_log` | `` | `log_big_oak` / `log_big_oak_top` |
| `mangrove_log` | `idleoregen:mangrove_log_generator` | `minecraft:mangrove_log` | `` | `mangrove_log_side` / `mangrove_log_top` |
| `cherry_log`   | `idleoregen:cherry_log_generator`   | `minecraft:cherry_log`   | `` | `cherry_log_side` / `cherry_log_top` |
| `pale_oak_log` | `idleoregen:pale_oak_log_generator` | `minecraft:pale_oak_log` | `` | `pale_oak_log_side` / `pale_oak_log_top` |

`oak_log` already exists (``). Out of scope by decision: nether stems (crimson/warped) and
`bamboo_block` — thematically not overworld tree logs; can be a later set.

## Balance (uniform, per decision)

- **Stats:** every wood generator uses oak's stats — `interval: 5` s, `cap: 64`.
- **Recipe (shaped, `crafting_table`) — "planting station" theme:**
  ```
  G B G      G = minecraft:glass
  S L S      B = minecraft:bone_meal          (top-center cardinal)
  G S G      S = minecraft:<wood>_sapling      (other 3 cardinals)
             L = minecraft:<wood>_log          (center)
  ```
  `unlock` = the produced log. Result = `idleoregen:<wood>_log_generator`, count 1.
  The same recipe is added for **oak** to enable it.
  **Exception:** mangrove has no sapling — it uses `minecraft:mangrove_propagule` for `S`.

## Texture pipeline (deterministic, Python/PIL — "auto from vanilla, BOX")

Every generator texture is **64×64**. Analysis proved that across all 12 existing generators the images
are **byte-identical except a single 24×12 region `[35..58, 11..22]`** — the inner 6³ "resource core"
cube (`uv [35,11]`, model `geometry.generator_entity` / `geometry.generator`). The outer 16³ machine
frame is shared.

To make a wood texture:
1. Take an existing generator PNG as the frame template (entity: `*_generator_entity.png`,
   block: `*_generator.png`) — the frame is shared, so any works.
2. Build the 24×12 core from the wood's vanilla textures, downscaled 16→6 with the **BOX** filter:
   - box-UV faces for the 6³ cube at `uv [35,11]`:
     - top `(41,11)`, bottom `(47,11)` → `*_log_top` (tree rings)
     - east `(35,17)`, north `(41,17)`, west `(47,17)`, south `(53,17)` → `*_log` side (bark)
3. Paste the core at `(35,11)` onto both the entity template and the block template.

Vanilla source: **`Mojang/bedrock-samples`** (`resource_pack/textures/blocks/…`), resolved via the vanilla
`terrain_texture.json` mapping. Known caveat: 6×6 is too small to hold vanilla's concentric top-ring
detail, so top faces read slightly flatter than oak's hand-styled ring — accepted (auto-BOX decision).

**Glyphs:** each wood's 16×16 vanilla bark (side) texture is written into its glyph cell in
`font/glyph_E2.png` (256×256, 16×16 grid, 16px cells). Cell for `\uE2NM` = row `N`, col `M` →
pixel `(M*16, N*16)`. So E212–E219 land in row 1, cols 2–9 (currently empty).

## Files touched

**New per wood (×8):**
- `behavior_packs/idleoregen/blocks/<w>_log_generator.block.json` (oak template; swap identifier + texture key)
- `behavior_packs/idleoregen/entities/<w>_log_generator.behavior.json` (oak template; swap identifier)
- `resource_packs/idleoregen/entity/<w>_log_generator.entity.json` (oak template; swap identifier + texture path)
- `behavior_packs/idleoregen/recipes/crafting/<w>_log_generator.json` (new; from the recipe above)
- `resource_packs/idleoregen/textures/blocks/<w>_log_generator.png`
- `resource_packs/idleoregen/textures/entity/<w>_log_generator_entity.png`

**New for oak enablement (×1):** `behavior_packs/idleoregen/recipes/crafting/oak_log_generator.json`

**Shared — append/insert entries:**
- `scripts/definitions/generator_definitions.ts` — 8 `GENERATORS` entries (after `oak_log`, before `cobblestone`)
- `resource_packs/idleoregen/textures/terrain_texture.json` — 8 `<w>_log_generator` keys
- `resource_packs/idleoregen/blocks.json` — 8 `<w>_log_generator: { "sound": "stone" }` keys
- `resource_packs/idleoregen/texts/en_US.lang` — 8 tile+entity name pairs
- `resource_packs/idleoregen/texts/es_ES.lang` — 8 tile+entity name pairs (inside GENERATORS region)
- `resource_packs/idleoregen/font/glyph_E2.png` — 8 glyphs (E212–E219)

**Untouched:** the user's unrelated WIP (netherite recipe redesign, `scripts/ui/` HUD, `logger.ts` DEBUG).

## format_version reference (must match existing files of the same kind)

- block: `1.21.50` · BP entity: `1.16.100` · RP client entity: `1.10.0` · recipe: `1.21.50`
- `blocks.json`: `1.21.0` · geometry/terrain_texture: unchanged (shared, no version bump)

## Verification

1. `npm run build` (tsc + esbuild) and `npm run lint` green.
2. Multi-agent adversarial pass: every cross-reference resolves (block↔entity↔texture↔recipe↔lang↔
   terrain_texture↔blocks.json), `format_version`s correct per file kind, all `minecraft:*_log` /
   `*_sapling` / `mangrove_propagule` / `bone_meal` ids are real Bedrock ids, textures are 64×64 with the
   exact shared frame (only the 24×12 core differs), both `.lang` files complete for all 8 woods, glyph
   cells filled. (Adversarial pass caught + fixed: all 9 wood blocks were missing `menu_category` — they'd
   have been invisible in Creative; oak's block.json was also given `menu_category` as part of enabling it.)
3. **In-world testing remains the human gate** (same policy as Workstream A): place each generator, verify
   the rotating entity shows the right wood, withdraw, craft via recipe.
