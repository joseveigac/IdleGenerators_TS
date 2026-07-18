# Idle Generators (Bedrock)

**Place a generator and let it work — even while the world is closed.**

Idle Generators is a Minecraft Bedrock add-on (Behavior Pack + Resource Pack) that adds 32 craftable block-generators producing resources passively over real time. Close the world, go offline, come back later — each generator tracks how much real time has passed and fills its internal buffer, and an action-bar HUD shows the buffer whenever you look at one.

**[Download on CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/idle-ore-generators)**

## Features

- **32 generators** — 11 mineral types, 9 wood types and 12 stone & construction types.
- **Offline production** — real-world timestamps; items accumulate while the game is closed.
- **Action-bar HUD** — per-generator icon, buffer readout (stored / cap) and cycle progress while looking at a generator.
- **Simple withdrawal** — left-click a generator to withdraw one item, sneak + left-click for a full stack; break the block to move it.
- **Animated visuals** — each generator renders a rotating core matching its resource.
- **Vibrant Visuals compatible** — the resource pack declares the `pbr` capability, so third-party VV/PBR packs keep working alongside the add-on.
- **No experimental toggles** required.

## Generators

| Generator | Interval | Buffer cap |
|---|---|---|
| Cobblestone | 5 s | 512 |
| Lapis | 15 s | 1024 |
| Redstone | 15 s | 1024 |
| Coal | 20 s | 512 |
| Copper | 30 s | 512 |
| Iron | 30 s | 512 |
| Quartz | 30 s | 512 |
| Gold | 35 s | 512 |
| Emerald | 60 s | 512 |
| Diamond | 80 s | 256 |
| Netherite | 100 s | 64 |
| Oak / Spruce / Birch / Jungle / Acacia / Dark Oak / Mangrove / Cherry / Pale Oak Log | 5 s | 64 |
| Stone / Granite / Diorite / Andesite / Tuff / Gravel / Sand / Red Sand | 5 s | 512 |
| Deepslate / Calcite | 10 s | 512 |
| Dripstone (pointed dripstone) | 10 s | 512 |
| Clay (clay balls) | 5 s | 1024 |

## Requirements

- Minecraft Bedrock Edition **1.21.130+**
- Both packs enabled on the world (Behavior + Resource) — importing the `.mcaddon` sets them up together.

## Development

TypeScript against `@minecraft/server` 2.x, built with `just-scripts`:

```sh
npm install
echo PROJECT_NAME=ghozix_idlegen > .env
npm run build         # typecheck + bundle
npm run local-deploy  # deploy into the local development packs
npm run mcaddon       # build the distributable .mcaddon
```

## Also available for Minecraft Java

The Java Edition version (NeoForge / Fabric) is on [CurseForge](https://www.curseforge.com/minecraft/mc-mods/idle-generators).

---

All Rights Reserved © ghozix. Rehosting the `.mcaddon` or the source is not permitted — see [LICENSE](LICENSE).
