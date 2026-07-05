# Idle Ore Generators — Design Docs

Version design & planning documents for **Idle Ore Generators** (Minecraft Bedrock addon).
These are internal design specs for future implementation — not player-facing docs.

## Index

| Doc | Purpose |
|---|---|
| [v1.0.0-baseline.md](v1.0.0-baseline.md) | What shipped in the live release + the architecture as-is + current limitations. The reference point every later version builds on. |
| [roadmap.md](roadmap.md) | The phased release plan (v1.1.0 → v1.3.0): themes, feature-to-version mapping, dependency graph, and risk notes. **Read this first.** |
| [v1.1.0-recovery-and-expansion.md](v1.1.0-recovery-and-expansion.md) | Next release: the storage-sharding foundation, Dragon Egg Recovery, and the first generator Set (all wood types). |
| [v1.2.0-progression.md](v1.2.0-progression.md) | Speed/Capacity upgrades and multiplayer ownership & protection. |
| [v1.3.0-admin-and-polish.md](v1.3.0-admin-and-polish.md) | Admin custom command (`/idleoregen`), sound/particle feedback, and the offline-earnings report. |
| [backlog.md](backlog.md) | Unscheduled ideas: Advanced (hopper-compatible) Generators, and a resource-boost mechanic to replace the dropped Catalyst System. |

## Versioning philosophy

- **Each release ships and is de-risked on its own.** No release depends on a later one.
- **Foundational refactors go first inside the release that needs them** (e.g. storage sharding in v1.1.0), so feature work lands on stable ground.
- **The offline, real-world-time model is sacred.** Every feature is designed so production still makes sense when the world was unloaded for hours or days. Any mechanic that would only work while a chunk ticks is explicitly marked as *online-only* and degrades gracefully.
- **Redstone control is intentionally out of scope** across all versions: Bedrock exposes no reliable signal read/emit API for custom blocks. Documented as a non-goal, not a TODO.

## Conventions used in these docs

- **Data model** blocks describe additive changes to `GeneratorData` / `PlacedInstance` (see [scripts/types/common.ts](../../scripts/types/common.ts), [scripts/components/generator.ts](../../scripts/components/generator.ts)) and require a `DB_VERSION` bump + migration.
- **API approach** blocks name the concrete `@minecraft/server` 2.x surface used, so implementation can start without re-researching feasibility.
- **Tasks** blocks are a rough implementation checklist, not a plan — the actual plan is produced per-version when work starts.
