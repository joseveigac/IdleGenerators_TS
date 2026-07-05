import { Vector3 } from "../types/common";

/**
 * IdleOreGen - LevelDB Configuration
 *
 * Configuración centralizada para Dynamic Properties:
 * - Versiones y namespace
 * - Claves de almacenamiento
 */

// ============================================================================
// VERSIONES
// ============================================================================

/** Versión del addon (semántico) */
export const ADDON_VERSION = "1.1.0";

/** Versión del formato de DB - incrementa si cambias estructura de datos */
export const DB_VERSION = 2;

/** Namespace corto para todas las claves de Dynamic Properties */
export const DB_NAMESPACE = "sb";

/** Prefijos para las claves de almacenamiento, keys consistentes*/
export const PREFIX = Object.freeze({
  WORLD: "w",
  PLAYER: "p",
  META: "m",
  DATA: "d",
  INDEX: "i",
  CATALOG: "c",
} as const);

const ns = DB_NAMESPACE;
const px = PREFIX;

// ============================================================================
// WORLD DYNAMIC PROPERTIES
// ============================================================================

export const WORLD_KEYS = Object.freeze({
  // --------------------------------------------------------------------------
  // META / VERSIONING
  // --------------------------------------------------------------------------
  META: {
    SCHEMA_VERSION: `${ns}:${px.WORLD}:${px.META}:schema_version`,
  },

  // --------------------------------------------------------------------------
  // GLOBAL CATALOGS (definitions only, no runtime state)
  // --------------------------------------------------------------------------
  CATALOG: {
    /**
     * Generic placed object definitions.
     * Example content:
     * {
     *   generators: { cobblestone: {...}, iron: {...} },
     *   machines:   { furnace_plus: {...} },
     *   minions:    { cobble_minion: {...} }
     * }
     */
    GENERATORS: `${ns}:${px.WORLD}:${px.CATALOG}:generators`,
  },
  // --------------------------------------------------------------------------
  // PLACED SYSTEM (SOURCE OF TRUTH)
  // --------------------------------------------------------------------------
  PLACED: {
    /**
     * LEGACY single-blob map (posKey -> PlacedInstance). Kept only as the
     * migration source for DB_VERSION 1 -> 2. No longer written after migration.
     */
    STATE: `${ns}:${px.WORLD}:${px.DATA}:placed_state`,

    /**
     * Bucket key prefix. Full key = `${BUCKET_PREFIX}:<dimensionId>:<bx>,<bz>`
     * where bx = floor(x/512), bz = floor(z/512). Each bucket is a small
     * posKey -> PlacedInstance map for one region.
     */
    BUCKET_PREFIX: `${ns}:${px.WORLD}:${px.DATA}:placed`,

    /** Array<string> of non-empty bucket keys, for cheap world-wide iteration. */
    BUCKETS_INDEX: `${ns}:${px.WORLD}:${px.INDEX}:placed_buckets`,
  },
} as const);

// ============================================================================
// PLAYER (ENTITY) DYNAMIC PROPERTIES
// ============================================================================

// export const PLAYER_KEYS = Object.freeze({
//   // --------------------------------------------------------------------------
//   // ACCOUNT / PERSONAL
//   // --------------------------------------------------------------------------
//   ACCOUNT: {
//     COINS: `${ns}:${px.PLAYER}:${px.DATA}:coins`,
//     LAST_LOGIN: `${ns}:${px.PLAYER}:${px.DATA}:last_login`,
//   },
// } as const);

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte coordenadas a string para usar como clave
 */
export function posToKey(x: number, y: number, z: number): string {
  return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

/**
 * Parsea un string de posición a coordenadas
 * @param key - String en formato "x,y,z"
 */
export function keyToPos(key: string): Vector3 | null {
  const parts = key.split(",");
  if (parts.length !== 3) return null;

  const x = parseInt(parts[0]);
  const y = parseInt(parts[1]);
  const z = parseInt(parts[2]);

  if (isNaN(x) || isNaN(y) || isNaN(z)) return null;

  return { x, y, z };
}
