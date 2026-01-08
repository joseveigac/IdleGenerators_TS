import type { Block } from "@minecraft/server";
import { posToKey, WORLD_KEYS } from "../storage/storage_keys";
import { getWorldData, setWorldData } from "../storage/storage";
import type { PlacedInstance, PlacedType } from "../types/common";

type PlacedMap = Record<string, PlacedInstance>;

function loadPlacedMap(): PlacedMap {
  return getWorldData<PlacedMap>(WORLD_KEYS.PLACED.STATE) ?? {};
}

function savePlacedMap(map: PlacedMap): void {
  setWorldData(WORLD_KEYS.PLACED.STATE, map);
}

export function makePosKeyFromBlock(block: Block): string {
  const p = block.location;
  return `${block.dimension.id}:${posToKey(p.x, p.y, p.z)}`;
}

// ============================================================================
// API
// ============================================================================

export function getPlacedAtPos(posKey: string): PlacedInstance | null {
  const map = loadPlacedMap();
  return map[posKey] ?? null;
}

export function upsertPlaced(instance: PlacedInstance): void {
  const map = loadPlacedMap();
  map[instance.posKey] = instance;
  savePlacedMap(map);
}

export function removePlacedAtPos(posKey: string): void {
  const map = loadPlacedMap();
  if (!map[posKey]) return;
  delete map[posKey];
  savePlacedMap(map);
}

// ============================================================================
// Factory
// ============================================================================

export function createPlaced<T>(type: PlacedType, posKey: string, data: T, ownerId?: string): PlacedInstance<T> {
  return {
    id: `inst_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`,
    type,
    posKey,
    placedAt: Date.now(),
    ownerId,
    data,
  };
}
