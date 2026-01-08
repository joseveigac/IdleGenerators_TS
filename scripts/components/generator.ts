import {
  BlockComponentPlayerPlaceBeforeEvent,
  BlockComponentOnPlaceEvent,
  BlockComponentPlayerInteractEvent,
  BlockComponentPlayerBreakEvent,
  BlockCustomComponent,
  ItemStack,
  Block,
} from "@minecraft/server";

import { log } from "../utils/logger";

import { posToKey, WORLD_KEYS } from "../storage/storage_keys";
import { getWorldData } from "../storage/storage";

import { getPlacedAtPos, upsertPlaced, removePlacedAtPos, createPlaced } from "../instances/placed";

import type { PlacedInstance } from "../types/common";
import { getGeneratorTypeFromBlockId, GeneratorTypesMap } from "../definitions/generator_definitions";

// ---- Generator runtime data ----
export interface GeneratorData {
  type: string;
  storedAmount: number;
  lastInteraction: number;
  visualEntityId?: string; // Almacena el entity spawneado
}

export class Generator implements BlockCustomComponent {
  constructor() {
    this.beforeOnPlayerPlace = this.beforeOnPlayerPlace.bind(this);
    this.onPlace = this.onPlace.bind(this);
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
    this.onPlayerBreak = this.onPlayerBreak.bind(this);
  }

  beforeOnPlayerPlace(event: BlockComponentPlayerPlaceBeforeEvent) {
    const { player, block } = event;
    if (!player) return;

    // ⚠️ Importante: el bloque final NO es event.block, es block + face offset
    const face = (event as any).face ?? (event as any).blockFace;
    const off = faceToOffset(face);

    const placeX = block.location.x + off.x;
    const placeY = block.location.y + off.y;
    const placeZ = block.location.z + off.z;

    const posKey = `${block.dimension.id}:${posToKey(placeX, placeY, placeZ)}`;

    // Lookup directo por posición real
    if (getPlacedAtPos(posKey)) return;

    const placingId = event.permutationToPlace.type.id;
    const generatorType = getGeneratorTypeFromBlockId(placingId);
    if (!generatorType) return;

    const instance = createPlaced<GeneratorData>(
      "generator",
      posKey,
      {
        type: generatorType,
        storedAmount: 0,
        lastInteraction: Date.now(),
        visualEntityId: undefined,
      },
      player.id
    );

    upsertPlaced(instance);
    log(`[Generator] Created instance ${placingId} at ${posKey}`);
  }

  onPlace(event: BlockComponentOnPlaceEvent) {
    const { block } = event;
    if (!block) return;

    const generatorType = getGeneratorTypeFromBlockId(block.typeId);
    if (!generatorType) return;

    const defs = getWorldData<GeneratorTypesMap>(WORLD_KEYS.CATALOG.GENERATORS);
    const def = defs?.[generatorType];
    if (!def) return;

    const posKey = `${block.dimension.id}:${posToKey(block.location.x, block.location.y, block.location.z)}`;

    // Si NO hay entityId -> NO hacer nada, el bloque ya es visible
    if (!def.entityId) {
      return; // <-- REMOVE trySetRuntimeVisible(block);
    }

    // Si hay entityId -> intentar hacer invisible + spawnear entity
    if (!trySetRuntimeInvisible(block)) {
      log("[Generator] runtime state not applied (state missing?)");
      return;
    }

    const tag = `io:gen:${posKey}`;
    removeExistingVisuals(block, tag);

    const ent = block.dimension.spawnEntity(def.entityId, {
      x: block.location.x + 0.5,
      y: block.location.y,
      z: block.location.z + 0.5,
    });
    ent.addTag(tag);

    const instance = getPlacedAtPos(posKey) as PlacedInstance<GeneratorData> | null;
    if (instance && instance.type === "generator") {
      instance.data.visualEntityId = tag;
      upsertPlaced(instance);
    }

    log(`[Generator] Spawned visual entity for ${block.typeId}`);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
    const { player, block } = event;
    if (!player) return;

    const posKey = `${block.dimension.id}:${posToKey(block.location.x, block.location.y, block.location.z)}`;

    const instance = getPlacedAtPos(posKey) as PlacedInstance<GeneratorData> | null;
    if (!instance || instance.type !== "generator") {
      // player.sendMessage("§cGenerator not found");
      return;
    }

    const defs = getWorldData<GeneratorTypesMap>(WORLD_KEYS.CATALOG.GENERATORS);
    if (!defs) return;

    const def = defs[instance.data.type];
    if (!def) return;

    const now = Date.now();
    const elapsed = now - instance.data.lastInteraction;
    const intervalMs = def.interval * 1000;
    const cycles = Math.floor(elapsed / intervalMs);

    if (cycles <= 0) {
      // player.sendMessage("§eGenerator is empty");
      return;
    }

    const produced = Math.min(instance.data.storedAmount + cycles, def.cap);

    // Determine withdrawal amount based on click type
    const withdrawAmount = player.isSneaking
      ? Math.min(produced, 64) // Shift-click: 1 stack (max 64)
      : Math.min(produced, 1); // Left-click: 1 item

    const inv = player.getComponent("minecraft:inventory");
    if (!inv?.container) return;

    const stack = new ItemStack(def.item, withdrawAmount);
    const remainder = inv.container.addItem(stack);
    const collected = withdrawAmount - (remainder?.amount ?? 0);

    instance.data.storedAmount = produced - collected;
    instance.data.lastInteraction += cycles * intervalMs;

    upsertPlaced(instance);

    if (collected > 0) {
      //player.sendMessage(`§a+${collected} ${def.name}`);
    }
    if (remainder && remainder.amount > 0) {
      //player.sendMessage(`§7(${remainder.amount} couldn't fit)`);
    }

    // Calcular tiempo transcurrido en formato legible
    const elapsedSeconds = (elapsed / 1000).toFixed(1);
    const nextItemIn = ((intervalMs - (elapsed % intervalMs)) / 1000).toFixed(1);

    log(
      `[Generator] ` +
        `Collected: ${collected}/${withdrawAmount} | ` +
        `Buffer: ${instance.data.storedAmount} | ` +
        `Elapsed: ${elapsedSeconds}s | ` +
        `Next in: ${nextItemIn}s`
    );
  }

  onPlayerBreak(event: BlockComponentPlayerBreakEvent) {
    const { block } = event;
    if (!block) return;

    const posKey = `${block.dimension.id}:${posToKey(block.location.x, block.location.y, block.location.z)}`;
    const tag = `io:gen:${posKey}`;

    const ents = block.dimension.getEntities({
      location: { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 },
      maxDistance: 0.9,
    });

    for (const e of ents) {
      if (e.hasTag(tag)) {
        e.remove();
        break;
      }
    }

    removePlacedAtPos(posKey);
    log(`[Generator] Removed instance at ${posKey}`);
  }
}

// =================================================================
// HELPERS
// ==================================================================

function trySetRuntimeInvisible(block: Block) {
  try {
    const perm = (block.permutation as any).withState("sb:runtime", 1);
    block.setPermutation(perm);
    return true;
  } catch {
    return false;
  }
}

function removeExistingVisuals(block: Block, tag: string) {
  const ents = block.dimension.getEntities({
    location: { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 },
    maxDistance: 1.2,
  });

  for (const e of ents) {
    if (e.hasTag(tag)) e.remove();
  }
}

function faceToOffset(face: number | undefined) {
  // Valores típicos: 0..5 (DOWN, UP, NORTH, SOUTH, WEST, EAST)
  switch (face) {
    case 0:
      return { x: 0, y: -1, z: 0 };
    case 1:
      return { x: 0, y: 1, z: 0 };
    case 2:
      return { x: 0, y: 0, z: -1 };
    case 3:
      return { x: 0, y: 0, z: 1 };
    case 4:
      return { x: -1, y: 0, z: 0 };
    case 5:
      return { x: 1, y: 0, z: 0 };
    default:
      return { x: 0, y: 0, z: 0 }; // fallback si la API no expone face
  }
}
