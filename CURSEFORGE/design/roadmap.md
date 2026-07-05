# Roadmap

Phased release plan. Each version is independently shippable. Read [v1.0.0-baseline.md](v1.0.0-baseline.md) first for the invariants every phase must respect.

## At a glance

| Version | Theme | Headline features |
|---|---|---|
| **v1.1.0** | Recovery & Expansion | Storage sharding (foundation), Dragon Egg Recovery, More Generator Types (first Set: all wood) |
| **v1.2.0** | Progression | Speed/Capacity Upgrades, Multiplayer Ownership & Protection |
| **v1.3.0** | Admin & Polish | `/idleoregen` admin command, sound/particle feedback, offline-earnings report |

Of the store page's **Planned Features** (minus Redstone Control, a permanent non-goal): **Dragon Egg Recovery** and **More Generator Types** land in **v1.1.0**; **Advanced (hopper-compatible) Generators** are parked in the [backlog](backlog.md). The **Catalyst System** was **dropped** — a different resource-boost mechanic will replace it later (also in the backlog). The remaining phases are additive quality-of-life and operator features.

## Why this order

Ordered by *risk retired per release* and *dependency*, not by marketing appeal:

1. **v1.1.0 leads with a refactor, not a feature.** More generator types multiply the placed-state blob, and v1.2.0 will add per-instance fields (upgrades, ownership). Sharding the storage first means everything after it lands on ground that scales. Then the features ship cheapest-first (Dragon Egg → More Types).
2. **v1.2.0 builds on v1.1.0's foundation.** Upgrades and ownership add per-instance fields on top of sharded storage and introduce the item-in-hand interaction pattern (held item → apply; empty+sneak → toggle). Ownership touches every interaction path, so it comes after that surface is defined.
3. **v1.3.0 is operator + polish.** The admin command and telemetry-style features (offline report) are most valuable once there's a lot to configure and a lot being produced.

## Feature → version map

```
Planned Features (store)          Version
─────────────────────────────────────────
Dragon Egg Recovery           →   v1.1.0
More Generator Types          →   v1.1.0
Advanced Generators (hopper)  →   BACKLOG (unscheduled)
Catalyst System               →   DROPPED (replacement TBD, backlog)
Redstone Control              →   OUT (non-goal, API-limited)

Added by design review            Version
─────────────────────────────────────────
Storage sharding (foundation) →   v1.1.0
Speed/Capacity Upgrades       →   v1.2.0
Ownership & Protection        →   v1.2.0
Admin command /idleoregen     →   v1.3.0
Sounds / particles feedback   →   v1.3.0
Offline-earnings report       →   v1.3.0
Management GUI (server form)  →   DEFERRED (optional; see note)
```

## Dependency graph

```
                 ┌─────────────────────────────┐
                 │ v1.1.0 Storage sharding      │  (foundation)
                 └───────────────┬──────────────┘
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
          Dragon Egg Recovery             More Types (wood Set)
          (loot table, no script)         (data-only, additive)
                 │
                 ▼
   ── v1.2.0 ──────────────────────────────────────────────────────────
   Speed/Capacity Upgrades  (adds per-instance fields; item-in-hand apply)
   Ownership & Protection   (uses ownerId; wraps every interaction path)
          │
          ▼
   ── v1.3.0 ──────────────────────────────────────────────────────────
   /idleoregen admin command   Sounds/particles   Offline report

   ── backlog (unscheduled) ───────────────────────────────────────────
   Advanced Generators (hopper auto-output)   Resource-boost mechanic (TBD)
```

## Cross-cutting invariants (apply to every phase)

- **Offline-first.** Base production is a pure function of elapsed real time. Online-only behaviors (auto-output to containers) are additive conveniences and must degrade to "buffer keeps filling" when unloaded.
- **Additive persistence.** Every new per-instance field is optional with a sensible default; every schema change bumps `DB_VERSION` and ships a forward migration. Never break a v1.0.0 world.
- **Data-driven generators.** New generator types are `GENERATORS` entries + parallel content files; no new component branches unless behavior genuinely differs.
- **No mandatory GUI.** Player-facing interactions use **held-item + sneak semantics** (decided convention): held item → apply that action; empty hand + sneak → toggle; otherwise → withdraw. A server-form management GUI is kept as an *optional future enhancement*, not a dependency of any feature.

## Deferred / explicitly out of scope

- **Redstone Control** — no reliable Bedrock API for custom-block signal I/O. Permanent non-goal; keep it off the store's "planned" list going forward.
- **Advanced Generators (hopper-compatible)** — designed, but **not scheduled**. Parked in [backlog.md](backlog.md); delivered via script auto-output on load (native hopper suction is impossible), so it's an online-only convenience over the offline buffer.
- **Catalyst System** — **dropped.** A different resource-boost mechanic will replace it; see [backlog.md](backlog.md). Any replacement must preserve the offline-first invariant.
- **Management GUI (server form)** — nice-to-have, intentionally not required. If added later it becomes an *alternate* front-end over the same per-instance data; it changes no mechanics. Revisit only if held-item interactions prove insufficient in playtesting.
