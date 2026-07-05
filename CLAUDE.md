# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Idle Generators** — a Minecraft **Bedrock** addon (Behavior Pack + Resource Pack) written in TypeScript against `@minecraft/server` 2.x. Placeable "generator" blocks passively produce vanilla resources on **real-world time**, including while the player/world is offline. Published on CurseForge; requires Minecraft Bedrock **1.21.130+**, no experimental features.

Use the global **`bedrock-addon-dev`** skill for API/format details — never guess `format_version`s, component names, or API signatures (they fail silently when wrong).

## Commands

Build tooling is `just-scripts` via `@minecraft/core-build-tasks`. **Requires a `.env` file** at repo root defining `PROJECT_NAME=idlegen` (read by `just.config.ts` via `getOrThrowFromProcess`) — the build throws without it.

- `npm run build` — typecheck (`tsc`) + esbuild bundle → `dist/scripts/main.js`
- `npm run lint` — `coreLint` over `scripts/**/*.ts` (append `-- --fix` to autofix)
- `npm run dev` — watch mode: rebuilds and deploys into the local Minecraft `development_*_packs` on every source/asset change
- `npm run local-deploy` — one-shot build + deploy to the local com.mojang packs
- `npm run mcaddon` — produce a distributable `dist/packages/idlegen.mcaddon`
- `npm run enablemcloopback` / `enablemcpreviewloopback` — one-time Windows loopback exemption so the client can talk to a local server

There is **no unit-test harness** — verification is in-game. Build/deploy, then load a world with both packs and test manually.

## Architecture

### Runtime data flow (the important part)

Everything is a single custom **block component** `idlegen:generator` ([scripts/components/generator.ts](scripts/components/generator.ts)), registered at startup in [scripts/register_components.ts](scripts/register_components.ts). One component class serves *all* generator types; the block's `typeId` is mapped back to a generator definition via `getGeneratorTypeFromBlockId`.

**Generation is lazy and timestamp-based — there is no per-tick production loop.** Each placed generator stores a `lastInteraction` timestamp (`Date.now()`, real-world ms). Produced amount is computed on demand as `floor((now - lastInteraction) / intervalMs)`, clamped to `cap`. This is what makes offline generation work: time simply elapses. `onPlayerInteract` withdraws (left-click = 1, sneak = up to 64), then advances `lastInteraction` by the number of *whole* cycles consumed (never by raw `now`, to avoid losing sub-cycle progress). Any code that changes withdrawal/production must preserve this whole-cycle accounting.

### Persistence — World Dynamic Properties

State lives entirely in **World Dynamic Properties** ([scripts/storage/](scripts/storage/)), serialized as JSON. Keys are namespaced/centralized in [storage_keys.ts](scripts/storage/storage_keys.ts) (`sb:w:...`). Two blobs:

- **Catalog** (`WORLD_KEYS.CATALOG.GENERATORS`): the generator definitions, written from the in-code `GENERATORS` map in [scripts/definitions/generator_definitions.ts](scripts/definitions/generator_definitions.ts) on world load. This is the single source of truth for intervals, caps, output item, entity id, and HUD glyph.
- **Placed state** (`WORLD_KEYS.PLACED.STATE`): a **single** `Record<posKey, PlacedInstance>` map holding *every* placed generator in the world, keyed by `posKey` = `"dimensionId:x,y,z"`. CRUD via [scripts/instances/placed.ts](scripts/instances/placed.ts) (`getPlacedAtPos` / `upsertPlaced` / `removePlacedAtPos`). ⚠️ Because it's one blob, it's re-read and re-serialized on every access and is bound by the per-dynamic-property size limit — relevant when scaling generator counts or adding per-instance data.

`initDatabaseAutoUpdate()` (called on `worldLoad`) currently rewrites the catalog every load. `DB_VERSION` in `storage_keys.ts` exists for schema migrations of the *placed* data — bump it and add migration logic if the `PlacedInstance`/`GeneratorData` shape changes.

### The "invisible block + visual entity" trick

Generators render as an **animated entity**, not the block itself. The block defines a `sb:runtime` state (`[0,1]`) with two permutations: `0` = normal geometry, `1` = `empty_geometry` (invisible). On place, `onPlace` sets `sb:runtime=1` and spawns the definition's `entityId` at the block center, tagged `io:gen:<posKey>`; on break, the tagged entity is located by proximity and removed. The entities are non-collidable, non-pushable, invulnerable (see [behavior_packs/idlegen/entities/](behavior_packs/idlegen/entities/)). Generators whose definition has no `entityId` stay as a plain block.

### HUD

[scripts/ui/generatorDisplay.ts](scripts/ui/generatorDisplay.ts) runs a `system.runInterval` that raycasts the looked-at block for each player and, if it's a generator, writes an **action-bar** line showing a custom-font glyph + name + amount/cap + progress%. Glyphs come from a custom font sheet (`resource_packs/idlegen/font/glyph_E2.png`); each definition's `glyph` field is the `\uE2xx` codepoint into it.

## Conventions & gotchas

- **`format_version` differs per file type** and is load-bearing: blocks `1.21.50`, entity BP `1.16.100`, recipes `1.21.50`; manifest `min_engine_version` `[1,21,130]`, `@minecraft/server` dep `[2,4,0]`. Match the existing file of the same kind when adding new content; don't normalize them.
- **Adding a generator** means touching several parallel files that must stay in sync: an entry in `GENERATORS`, a `blocks/*.block.json`, a resource-pack `entity/*.entity.json` + model/texture, a `recipes/crafting/*.json`, and `.lang` entries. Missing one fails silently in-game.
- **Manifest dependency versions are arrays** (`[2,4,0]`), never strings.
- Localization lives in `resource_packs/idlegen/texts/{en_US,es_ES}.lang`; both languages must be kept in sync.
- Comment/log language in this codebase is mixed English/Spanish — match the surrounding file.
- Source uses `Date.now()` freely; that is correct here (Bedrock script runtime), unrelated to any harness restriction.

## Product context

Design/roadmap documents for future versions live in `CURSEFORGE/` (design docs) alongside the CurseForge store assets. The live release is **v1.0.0** (11 ore generators; an `oak_log` generator also exists in code). Consult those design docs before implementing planned features (Advanced/hopper-compatible generators, catalyst/fuel system, Dragon Egg recovery, more generator types).
