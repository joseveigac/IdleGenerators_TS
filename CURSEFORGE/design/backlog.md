# Backlog (unscheduled)

Designed or partially-designed ideas that are **not** assigned to a version yet. Pulled here to keep the versioned docs focused. Nothing here is cancelled — it's parked until scheduled.

---

## Resource-boost mechanic (replaces the dropped Catalyst System)

**Status: to be designed.** The original **Catalyst System** (a held consumable granting a timed 2×/30 min speed boost) was **dropped** during design review — a different mechanic will take its place. Nothing is specified yet.

When picking a replacement, keep the load-bearing constraint from the baseline: **base production must stay a pure function of elapsed real time** ([v1.0.0-baseline.md](v1.0.0-baseline.md)). Any boost that has to "burn per tick" breaks offline behavior; a boost that resolves from timestamps (or from a permanent per-instance level, like the v1.2.0 upgrades) does not. Candidate directions to explore later: environmental/adjacency bonuses, a fuel block that sets a real-time boost window, milestone/streak bonuses, set-completion bonuses. Open.

---

## Advanced Generators (hopper-compatible) — deferred

Full design retained from the earlier v1.1.0 draft; deferred out of v1.1.0. Schedule into a future "Automation" release when ready.

**Purpose.** The base generators can't feed automation — that's the whole reason Advanced exists: run **different logic** so their output reaches hoppers/containers. This is the automation tier.

**The hard limit (agreed).** Nothing can push items into a container while the chunk is **unloaded** — Minecraft isn't simulating it. A truly "idle" flush into an external chest is therefore impossible. Realistic model: the buffer keeps **accruing offline on real time** (unchanged), and the accrued output is **synced into the connected inventory when the area loads / the player returns**.

**Connection — Option A (adjacent vanilla container), preferred.** On load/tick, the Advanced Generator flushes its buffer into a chest/barrel/hopper placed **directly below** (fallback: the facing side). No new blocks; a hopper underneath then chains onward via vanilla, so it composes with players' existing storage/sorting builds. If no container is present, it just keeps buffering (same as a base generator).

*Deferred alternatives:* **B — explicit link** (generator → chosen chest across a gap, stores `targetPosKey`); **C — custom sink block** (dedicated hopper/output chest with a visible inventory). Revisit only if A feels limiting in testing. All share the same core: *offline accrual → sync-on-load flush*.

**Sync-on-load mechanics.** A single throttled orchestrator (`system.runInterval`, batched — not one interval per generator) iterates **loaded** advanced instances (per loaded bucket, thanks to sharded storage); for each with buffer > 0 and a valid sink, it moves as much as fits and keeps the remainder buffered. On chunk/world load, the first pass drains the backlog.

**API approach.**
- Sink: `block.below()` / facing neighbor (Option A) or a stored `targetPosKey` (Option B).
- Insert: `neighbor.getComponent("minecraft:inventory")?.container.addItem(new ItemStack(def.item, n))`; the returned remainder = what didn't fit → keep it buffered.
- Scheduling: one orchestrator interval over loaded advanced instances.

**Data model.** `GeneratorType += advanced?: boolean`, or (recommended) a distinct `*_advanced` block per type. Option B adds `GeneratorData += targetPosKey?: string` (migration-safe default).

**Player-facing wording.** Be explicit: auto-output **resumes when the area is loaded** — while you're away the buffer fills and empties into your storage when you return. Never claim delivery "works while the game is closed" (only *generation* does).

**Dependencies.** Benefits from the storage sharding foundation (v1.1.0) for cheap per-bucket iteration of loaded advanced instances.
