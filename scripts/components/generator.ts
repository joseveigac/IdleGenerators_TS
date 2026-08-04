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

import { posToKey } from "../storage/storage_keys";

import { getPlacedAtPos, upsertPlaced, removePlacedAtPos, createPlaced } from "../instances/placed";
import { settle } from "../instances/production";
import { removeVisualEntity, visualTag } from "../instances/visual_entity";
import { isEnabled } from "../config/toggles";

import type { PlacedInstance } from "../types/common";
import { GENERATORS, getGeneratorTypeFromBlockId } from "../definitions/generator_definitions";

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

    const def = GENERATORS[generatorType];
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

    const tag = visualTag(posKey);
    removeVisualEntity(block.dimension, block.location, posKey);

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

    const def = GENERATORS[instance.data.type];
    if (!def) return;

    // Un generador desactivado no produce, pero su buffer se sigue pudiendo retirar.
    const enabled = isEnabled(instance.data.type);
    const available = settle(instance.data, def, Date.now(), enabled);
    if (available <= 0) return;

    // Click normal: 1 item. Agachado: hasta un stack.
    const requested = player.isSneaking ? Math.min(available, 64) : 1;

    const inv = player.getComponent("minecraft:inventory");
    if (!inv?.container) return;

    const remainder = inv.container.addItem(new ItemStack(def.item, requested));
    const collected = requested - (remainder?.amount ?? 0);

    instance.data.storedAmount = available - collected;
    upsertPlaced(instance);

    log(`[Generator] Collected: ${collected}/${requested} | Buffer: ${instance.data.storedAmount}`);
  }

  onPlayerBreak(event: BlockComponentPlayerBreakEvent) {
    const { block } = event;
    if (!block) return;

    const posKey = `${block.dimension.id}:${posToKey(block.location.x, block.location.y, block.location.z)}`;

    removeVisualEntity(block.dimension, block.location, posKey);
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
