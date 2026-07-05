import type { Block } from "@minecraft/server";
import { posToKey, WORLD_KEYS } from "../storage/storage_keys";
import { getWorldData, setWorldData, removeWorldData } from "../storage/storage";
import type { PlacedInstance, PlacedType } from "../types/common";

type PlacedMap = Record<string, PlacedInstance>;

/** Region size (blocks) per bucket on each horizontal axis. */
const BUCKET_SIZE = 512;

// posKey = "<dimensionId>:x,y,z"  — dimensionId itself contains a colon
// (e.g. "minecraft:overworld:10,64,-5"), so split on the LAST colon.
function parsePosKey(posKey: string): { dim: string; x: number; y: number; z: number } | null {
  const lastColon = posKey.lastIndexOf(":");
  if (lastColon < 0) return null;
  const dim = posKey.slice(0, lastColon);
  const parts = posKey.slice(lastColon + 1).split(",");
  if (parts.length !== 3) return null;
  const x = parseInt(parts[0], 10);
  const y = parseInt(parts[1], 10);
  const z = parseInt(parts[2], 10);
  if (Number.isNaN(x) || Number.isNaN(y) || Number.isNaN(z)) return null;
  return { dim, x, y, z };
}

function bucketKeyFor(posKey: string): string {
  const p = parsePosKey(posKey);
  if (!p) return `${WORLD_KEYS.PLACED.BUCKET_PREFIX}:unknown`;
  const bx = Math.floor(p.x / BUCKET_SIZE);
  const bz = Math.floor(p.z / BUCKET_SIZE);
  return `${WORLD_KEYS.PLACED.BUCKET_PREFIX}:${p.dim}:${bx},${bz}`;
}

// ---- bucket index (list of non-empty bucket keys) ----
function loadIndex(): string[] {
  return getWorldData<string[]>(WORLD_KEYS.PLACED.BUCKETS_INDEX) ?? [];
}
function addBucketToIndex(bucketKey: string): void {
  const idx = loadIndex();
  if (!idx.includes(bucketKey)) {
    idx.push(bucketKey);
    setWorldData(WORLD_KEYS.PLACED.BUCKETS_INDEX, idx);
  }
}
function removeBucketFromIndex(bucketKey: string): void {
  const idx = loadIndex();
  const i = idx.indexOf(bucketKey);
  if (i >= 0) {
    idx.splice(i, 1);
    setWorldData(WORLD_KEYS.PLACED.BUCKETS_INDEX, idx);
  }
}

// ---- bucket load/save ----
function loadBucket(bucketKey: string): PlacedMap {
  return getWorldData<PlacedMap>(bucketKey) ?? {};
}
function saveBucket(bucketKey: string, map: PlacedMap): void {
  if (Object.keys(map).length === 0) {
    removeWorldData(bucketKey);
    removeBucketFromIndex(bucketKey);
  } else {
    setWorldData(bucketKey, map);
    addBucketToIndex(bucketKey);
  }
}

export function makePosKeyFromBlock(block: Block): string {
  const p = block.location;
  return `${block.dimension.id}:${posToKey(p.x, p.y, p.z)}`;
}

// ============================================================================
// API (signatures unchanged from the single-blob version)
// ============================================================================

export function getPlacedAtPos(posKey: string): PlacedInstance | null {
  const bucket = loadBucket(bucketKeyFor(posKey));
  return bucket[posKey] ?? null;
}

export function upsertPlaced(instance: PlacedInstance): void {
  const bucketKey = bucketKeyFor(instance.posKey);
  const bucket = loadBucket(bucketKey);
  bucket[instance.posKey] = instance;
  saveBucket(bucketKey, bucket);
}

export function removePlacedAtPos(posKey: string): void {
  const bucketKey = bucketKeyFor(posKey);
  const bucket = loadBucket(bucketKey);
  if (!bucket[posKey]) return;
  delete bucket[posKey];
  saveBucket(bucketKey, bucket);
}

/** Iterate every placed instance across all buckets (offline report / admin). */
export function getAllPlaced(): PlacedInstance[] {
  const out: PlacedInstance[] = [];
  for (const bucketKey of loadIndex()) {
    const bucket = loadBucket(bucketKey);
    for (const k of Object.keys(bucket)) out.push(bucket[k]);
  }
  return out;
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

// ============================================================================
// Migrations
// ============================================================================

/** Run whatever placed-data migrations are needed to reach DB_VERSION. */
export function runPlacedMigrations(from: number | undefined): void {
  // 1 (or undefined/legacy) -> 2 : single blob -> region buckets
  if (from === undefined || from < 2) {
    migratePlacedStateToBuckets();
  }
}

function migratePlacedStateToBuckets(): void {
  const legacy = getWorldData<PlacedMap>(WORLD_KEYS.PLACED.STATE);
  if (!legacy) return; // fresh world, or already migrated

  let count = 0;
  for (const posKey of Object.keys(legacy)) {
    upsertPlaced(legacy[posKey]);
    count++;
  }
  removeWorldData(WORLD_KEYS.PLACED.STATE);
  console.log(`[IdleGen] Migrated ${count} placed generators into region buckets.`);
}
