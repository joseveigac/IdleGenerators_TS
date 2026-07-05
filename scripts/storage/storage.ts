import { world } from "@minecraft/server";
import { log } from "../utils/logger";
import { DB_VERSION, WORLD_KEYS } from "./storage_keys";

import { generateGeneratorDefinitions, GeneratorType, GeneratorTypesMap } from "../definitions/generator_definitions";
import { runPlacedMigrations } from "../instances/placed";

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export function initDatabase(): void {
  const currentVersion = world.getDynamicProperty(WORLD_KEYS.META.SCHEMA_VERSION);

  if (currentVersion === DB_VERSION) {
    log("[Storage] Ya existente. Versión:", currentVersion);
    return;
  }

  const isFirstTime = currentVersion === undefined;
  log(
    isFirstTime
      ? "[IdleOreGen] First initialization - setting up database..."
      : `[IdleOreGen] Updating from ${currentVersion} to ${DB_VERSION}`
  );

  // Migraciones de datos "placed" antes de sellar la versión (evita huérfanos).
  if (currentVersion === undefined || (currentVersion as number) < DB_VERSION) {
    runPlacedMigrations(currentVersion as number | undefined);
  }

  world.setDynamicProperty(WORLD_KEYS.META.SCHEMA_VERSION, DB_VERSION);
  generateGeneratorDefinitions();

  log("[IdleOreGen] Definitions loaded successfully");
}

export function initDatabaseAutoUpdate(): void {
  const stored = world.getDynamicProperty(WORLD_KEYS.META.SCHEMA_VERSION) as number | undefined;

  // El catálogo se regenera siempre desde código.
  generateGeneratorDefinitions();

  // Migraciones de datos "placed" (solo cuando sube la versión).
  if (stored === undefined || stored < DB_VERSION) {
    runPlacedMigrations(stored);
    world.setDynamicProperty(WORLD_KEYS.META.SCHEMA_VERSION, DB_VERSION);
    log(`[IdleOreGen] Storage migrado a versión ${DB_VERSION} (desde ${stored ?? "nuevo"}).`);
  }

  log("[IdleOreGen] Storage Auto-Update ejecutado.");
  log("[IdleOreGen] Storage Definiciones iniciadas correctamente");
}

// ============================================================================
// WORLD DYNAMIC PROPERTIES
// ============================================================================

export function getWorldData<T = any>(key: string): T | null {
  const value = world.getDynamicProperty(key);
  if (value === undefined) return null;

  try {
    return JSON.parse(value as string) as T;
  } catch (error) {
    console.error(`[IdleOre] Error parsing ${key}:`, error);
    return null;
  }
}

export function setWorldData(key: string, data: any): void {
  try {
    world.setDynamicProperty(key, JSON.stringify(data));
  } catch (error) {
    console.error(`[IdleOre] Error saving ${key}:`, error);
  }
}

export function removeWorldData(key: string): void {
  world.setDynamicProperty(key, undefined);
}

// ============================================================================
// PLAYER DYNAMIC PROPERTIES
// ============================================================================

// export function getPlayerData<T = any>(player: Player, key: string): T | null {
//   const value = player.getDynamicProperty(key);
//   if (value === undefined) return null;

//   try {
//     return JSON.parse(value as string) as T;
//   } catch (error) {
//     console.error(`[DB] Error parseando player data ${key}:`, error);
//     return null;
//   }
// }

// export function setPlayerData(player: Player, key: string, data: any): void {
//   try {
//     player.setDynamicProperty(key, JSON.stringify(data));
//   } catch (error) {
//     console.error(`[DB] Error guardando player data ${key}:`, error);
//   }
// }

// export function clearPlayerData(player: Player, key: string): void {
//   player.setDynamicProperty(key, undefined);
// }

// ============================================================================
// HELPERS - CATALOGUE (WORLD DEFINITIONS)
// ============================================================================

function getGeneratorTypeMap(): GeneratorTypesMap {
  return getWorldData<GeneratorTypesMap>(WORLD_KEYS.CATALOG.GENERATORS) || {};
}
export function getGeneratorType(typeId: string): GeneratorType | null {
  const types = getGeneratorTypeMap();
  return types[typeId] || null;
}

// ============================================================================
// HELPERS - CONFIGURACIÓN DE ISLA (WORLD DEFINITIONS)
// ============================================================================

// function getIslandConfig(): IslandConfig | null {
//   return getWorldData<IslandConfig>(WORLD_KEYS.ISLAND.CONFIG);
// }

// export function getIslandSizeByLevel(level: number): IslandSize | null {
//   const config = getIslandConfig();
//   if (!config) return null;
//   return config.sizesByLevel[level] ?? null;
// }

// export function getIslandCostsByLevel(level: number): IslandCostItem[] | null {
//   const config = getIslandConfig();
//   if (!config) return null;
//   return config.costsByLevel[level] ?? null;
// }
