# Design: Generator Withdrawal Interaction Redesign

> **Status:** Proposal / possible future implementation. NOT yet implemented.
> The related **cycles/buffer fix is already done** (branch `feat/v1.1.0-storage-sharding`, commit `8929422`) and is independent of everything below.
> **Scope:** interaction/UX only — no change to storage sharding, offline generation, or the netherite loot table. Recommended to implement on its own branch (e.g. `feat/withdrawal-interaction`), off `main` or after v1.1.0 merges.

## 1. Context & problem

Generators produce items on real time; the player withdraws them by interacting with the block. Withdrawal lives in the block custom component `scripts/components/generator.ts` → `onPlayerInteract`. Two problems were reported and root-caused in-game:

### Bug A — Buffer not drainable 1-by-1 (FIXED, commit `8929422`)
The old guard `if (cycles <= 0) return;` ignored the accumulated `storedAmount` buffer. After any withdrawal advanced `lastInteraction` past all whole cycles, subsequent clicks saw `cycles === 0` and bailed, so the buffer was inaccessible until a new interval elapsed. Fixed by computing `produced = min(storedAmount + cycles, cap)` first and guarding on `produced <= 0`. **This doc does not re-address Bug A.**

### Bug B — Shift+interact fails when holding an item  (verified Bedrock limitation)
Withdrawing a *stack* is currently gated on `player.isSneaking` inside `onPlayerInteract`:
```ts
const withdrawAmount = player.isSneaking ? Math.min(produced, 64) : Math.min(produced, 1);
```
**Root cause:** in Minecraft Bedrock, *sneak + right-click while holding an item* makes the engine use/place the held item and **suppresses the block's `onPlayerInteract` entirely** — the event never fires. So the "sneak = stack" path is dead whenever the player has something in hand. (This is also what the earlier "if I'm already crouched before looking it doesn't work" report was: an item was in hand.) Non-sneak right-click still fires `onPlayerInteract` reliably, with or without an item in hand, because block interaction wins over item use when *not* sneaking.

### Bug C — 1-by-1 withdrawal scatters single-item stacks  (verified API behavior)
The code gives items with `container.addItem(new ItemStack(def.item, n))`. Per the official docs, `Container.addItem` *"places in the first available slot(s) and can be stacked with existing items of the same type"* — in practice it prefers the first **empty** slot, so withdrawing one item at a time seeds many 1-count stacks instead of topping off the player's existing stack of the same resource.

Sources (verified, not assumed):
- `Container.addItem` semantics — [Microsoft Learn: minecraft/server.Container](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/container).
- `onPlayerInteract` = "player right-clicks the block"; `player.isSneaking` boolean; `world.afterEvents.playerButtonInput` with `InputButton`/`ButtonState` and an `InputEventOptions` filter; `getBlockFromViewDirection({ maxDistance })` — `bedrock-addon-dev` skill (`reference/scripting-core.md`) and confirmed in-repo (the HUD `scripts/ui/generatorDisplay.ts` already raycasts with `maxDistance: 6`).

## 2. Goals / non-goals

**Goals**
- Preserve the two-tier model the maintainer wants: **right-click = 1 item**, **sneak = a stack**.
- Make the "stack" withdrawal work **with an item in hand** (fix Bug B).
- Make withdrawn items **consolidate into existing inventory stacks** instead of scattering (fix Bug C), for both the 1 and stack paths.
- Keep the offline/idle accrual and whole-cycle accounting invariant untouched (`lastInteraction += cycles * intervalMs`, `0` when draining the buffer).
- Do **not** modify `scripts/main.ts` (it carries the maintainer's uncommitted WIP). Wire through the committed `scripts/register_components.ts`.

**Non-goals**
- No change to storage, migration, netherite loot, or generation math.
- No new UI/forms.

## 3. Chosen approach (Option C)

Keep `onPlayerInteract` for the **"1" path** (reliable), and move the **"stack" trigger off the interact event** onto the **Sneak button** + a look-at raycast, which fires regardless of what's in hand. Add a **stacking-aware give** used by both paths.

### 3.1 Behavior matrix (target)
| Situation | Trigger | Result |
|---|---|---|
| Empty hand, not sneaking | right-click block | +1 |
| Item in hand, not sneaking | right-click block | +1 (interact still fires) |
| Empty hand | tap **Sneak** while looking at gen (≤6 blocks) | +1 stack (≤64) |
| Item in hand | tap **Sneak** while looking at gen | +1 stack (≤64) — **the fix** |
| Sneaking + right-click | (both may fire) | at most stack + 1; harmless overshoot |

Note the Sneak trigger is **edge-triggered** (`ButtonState.Pressed`): the player must press Sneak *while looking* at the generator. Merely holding Sneak from before does not re-fire — this is inherent to `playerButtonInput`. The new mental model to document for players: **"click for 1, tap crouch for a stack."**

## 4. Detailed design

### 4.1 Extract a shared withdrawal function (in `generator.ts`)
Move the resolve→compute→give→persist logic out of `onPlayerInteract` into a module-level exported function so both triggers reuse it. Sketch (design, not final code):

```ts
import { /* existing */, Player, Container } from "@minecraft/server";

export function withdrawFromGeneratorBlock(player: Player, block: Block, mode: "one" | "stack"): boolean {
  const generatorType = getGeneratorTypeFromBlockId(block.typeId);
  if (!generatorType) return false;

  const posKey = `${block.dimension.id}:${posToKey(block.location.x, block.location.y, block.location.z)}`;
  const instance = getPlacedAtPos(posKey) as PlacedInstance<GeneratorData> | null;
  if (!instance || instance.type !== "generator") return false;

  const def = getWorldData<GeneratorTypesMap>(WORLD_KEYS.CATALOG.GENERATORS)?.[instance.data.type];
  if (!def) return false;

  const now = Date.now();
  const elapsed = now - instance.data.lastInteraction;
  const intervalMs = def.interval * 1000;
  const cycles = Math.floor(elapsed / intervalMs);
  const produced = Math.min(instance.data.storedAmount + cycles, def.cap); // Bug A fix, already live
  if (produced <= 0) return false;

  const inv = player.getComponent("minecraft:inventory");
  if (!inv?.container) return false;

  const maxStack = new ItemStack(def.item, 1).maxAmount;              // 64 / 16 / 1 per item
  const want = mode === "stack" ? Math.min(produced, maxStack) : 1;
  const collected = giveItemsStacking(inv.container, def.item, want); // Bug C fix

  instance.data.storedAmount = produced - collected;
  instance.data.lastInteraction += cycles * intervalMs;              // invariant preserved (0 when cycles==0)
  upsertPlaced(instance);
  return collected > 0;
}
```

`onPlayerInteract` collapses to:
```ts
onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
  const { player, block } = event;
  if (!player) return;
  withdrawFromGeneratorBlock(player, block, "one");
}
```

### 4.2 Stacking-aware give (fix Bug C) — in `generator.ts`
```ts
function giveItemsStacking(container: Container, itemId: string, amount: number): number {
  if (amount <= 0) return 0;
  let remaining = amount;
  const size = container.size;                 // player inventory = 36
  const maxStack = new ItemStack(itemId, 1).maxAmount;

  // Pass 1: top off existing partial stacks of the SAME item first
  for (let i = 0; i < size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== itemId) continue;
    const space = item.maxAmount - item.amount;
    if (space <= 0) continue;
    const add = Math.min(space, remaining);
    item.amount += add;
    container.setItem(i, item);
    remaining -= add;
  }
  // Pass 2: fill empty slots
  for (let i = 0; i < size && remaining > 0; i++) {
    if (container.getItem(i)) continue;
    const add = Math.min(maxStack, remaining);
    container.setItem(i, new ItemStack(itemId, add));
    remaining -= add;
  }
  return amount - remaining;                    // collected; leftover stays in the generator buffer
}
```
This guarantees consolidation for both the "one" and "stack" paths. Inventory-full → `remaining > 0` → the uncollected amount stays in `storedAmount` (via `produced - collected`).

### 4.3 New module: `scripts/interactions/sneak_withdraw.ts`
```ts
import { world, InputButton, ButtonState } from "@minecraft/server";
import { withdrawFromGeneratorBlock } from "../components/generator";

export function initSneakWithdraw(): void {
  world.afterEvents.playerButtonInput.subscribe(
    (e) => {
      const hit = e.player.getBlockFromViewDirection({ maxDistance: 6 }); // match the HUD reach
      if (!hit?.block) return;
      withdrawFromGeneratorBlock(e.player, hit.block, "stack");
    },
    { buttons: [InputButton.Sneak], state: ButtonState.Pressed }          // edge-triggered, sneak only
  );
}
```

### 4.4 Wiring (avoid `main.ts` WIP)
In `scripts/register_components.ts` (committed, not WIP):
```ts
import { initSneakWithdraw } from "./interactions/sneak_withdraw";
export function registerComponents(ev: StartupEvent) {
  registerBlockComponents(ev);
  registerItemCustomComponents(ev);
  initSneakWithdraw();
}
```
> Subscribing to a `world.afterEvents` handler from within the `system.beforeEvents.startup` phase is expected to work (it only registers a listener). **Fallback if it doesn't fire in-game:** move the subscription to module top-level in `sneak_withdraw.ts` and `import "./interactions/sneak_withdraw";` for side effect (esbuild preserves side-effectful imports), or wire `initSneakWithdraw()` into the `world.afterEvents.worldLoad` handler — but that lives in `main.ts` (WIP), so prefer the first two.

## 5. Edge cases & decisions
- **Edge-triggered sneak:** only a fresh Sneak press while looking triggers a stack; holding Sneak from before does not. Documented as intended.
- **Overlap (sneak-press + click):** at most stack + 1. Harmless; the player wanted a stack anyway. `onPlayerInteract` intentionally gives `+1` unconditionally (predictable "right-click always yields ≥1") rather than gating on `isSneaking` — gating would make "already-sneaking + click" yield nothing.
- **Accidental sneak near a generator:** any Sneak press while looking at a generator within 6 blocks withdraws a stack. Acceptable per the maintainer's chosen model; the 6-block raycast limits incidental far-away triggers.
- **`cap > 64`:** "stack" collects one stack (≤ item maxStack) per press, not the whole (possibly >64) buffer — matches the original `min(produced, 64)` intent. Repeated Sneak taps collect more.
- **Item maxStack ≠ 64:** handled via `new ItemStack(itemId, 1).maxAmount` (16 for some items, 1 for non-stackables — a non-stackable generator output would give 1 per slot; fine).
- **Whole-cycle accounting:** unchanged. `lastInteraction += cycles * intervalMs`; `0` when draining the buffer (`cycles == 0`), so offline accrual is never lost.

## 6. Alternatives considered
- **A — right-click collects ALL available (no sneak).** Simplest, robust, best idle UX; fixes B and C for free. Rejected by maintainer (wants to keep the 1-vs-stack distinction).
- **B — right-click collects up to one stack (no sneak); repeat for more.** Also fixes B and C. Rejected for the same reason.
- **C — this design.** Keeps 1-vs-stack; more code and one new global subscription, but preserves the intended UX. Chosen.

## 7. Implementation task breakdown
1. `generator.ts`: add `Player`, `Container` imports; extract `withdrawFromGeneratorBlock(player, block, mode)`; add `giveItemsStacking`; reduce `onPlayerInteract` to delegate `"one"`. Keep all other component callbacks (`beforeOnPlayerPlace`/`onPlace`/`onPlayerBreak`) untouched.
2. `scripts/interactions/sneak_withdraw.ts`: new module with `initSneakWithdraw()`.
3. `register_components.ts`: import + call `initSneakWithdraw()`.
4. Build (`npm run build`) + lint (`npm run lint`) green.
5. In-game verification (below).
6. Update player-facing docs / `.lang` help text if any describes the withdraw controls.

## 8. Verification plan (no unit-test harness — in-game)
`npm run local-deploy`, then confirm the behavior matrix in §3.1:
- Right-click (empty hand / item in hand, not sneaking) → +1 each; items **merge into your existing stack**, not scattered.
- Tap Sneak while looking at a generator, **with an item in hand** → +1 stack (the Bug B fix).
- Spam right-click → drains the buffer 1-by-1 into one growing stack (Bug A already fixed; confirm Bug C consolidation).
- Inventory full → withdrawal stops; remaining amount stays in the generator (re-open later and it's still there).
- Offline: leave, return later → buffer accrued up to `cap` as before.

## 9. Risks
- `playerButtonInput` subscription timing (see §4.4 fallback).
- Sneak-tap withdrawing a stack could feel too eager for players who sneak often near generators; if reported, add a small look-dwell or a config toggle (future).
- `container.getItem`/`setItem` copy semantics: `getItem` returns a copy; mutating `.amount` then `setItem` writes it back — verified correct usage in the sketch.
