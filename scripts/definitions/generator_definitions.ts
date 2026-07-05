/**
 * IdleGen - Block Definitions
 *
 * Definiciones World Dynamic Properties para bloques del juego.
 * Responsabilidad: Almacenar, organizar y recuperar datos del catálogo de generadores.
 */

import { world } from "@minecraft/server";
import { WORLD_KEYS } from "../storage/storage_keys.js";

/**
 * Guarda los tipos de generadores en World DP
 */
export function generateGeneratorDefinitions(): void {
  world.setDynamicProperty(WORLD_KEYS.CATALOG.GENERATORS, JSON.stringify(GENERATORS));
}

// ============================================================================
// GENERADORES
// ============================================================================
export type GeneratorKey = keyof typeof GENERATORS;
export const GENERATORS: GeneratorTypesMap = {
  oak_log: {
    id: "idlegen:oak_log_generator",
    entityId: "idlegen:oak_log_generator_entity",
    name: "Oak Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:oak_log",
    glyph: "\uE211",
  },
  spruce_log: {
    id: "idlegen:spruce_log_generator",
    entityId: "idlegen:spruce_log_generator_entity",
    name: "Spruce Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:spruce_log",
    glyph: "\uE212",
  },
  birch_log: {
    id: "idlegen:birch_log_generator",
    entityId: "idlegen:birch_log_generator_entity",
    name: "Birch Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:birch_log",
    glyph: "\uE213",
  },
  jungle_log: {
    id: "idlegen:jungle_log_generator",
    entityId: "idlegen:jungle_log_generator_entity",
    name: "Jungle Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:jungle_log",
    glyph: "\uE214",
  },
  acacia_log: {
    id: "idlegen:acacia_log_generator",
    entityId: "idlegen:acacia_log_generator_entity",
    name: "Acacia Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:acacia_log",
    glyph: "\uE215",
  },
  dark_oak_log: {
    id: "idlegen:dark_oak_log_generator",
    entityId: "idlegen:dark_oak_log_generator_entity",
    name: "Dark Oak Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:dark_oak_log",
    glyph: "\uE216",
  },
  mangrove_log: {
    id: "idlegen:mangrove_log_generator",
    entityId: "idlegen:mangrove_log_generator_entity",
    name: "Mangrove Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:mangrove_log",
    glyph: "\uE217",
  },
  cherry_log: {
    id: "idlegen:cherry_log_generator",
    entityId: "idlegen:cherry_log_generator_entity",
    name: "Cherry Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:cherry_log",
    glyph: "\uE218",
  },
  pale_oak_log: {
    id: "idlegen:pale_oak_log_generator",
    entityId: "idlegen:pale_oak_log_generator_entity",
    name: "Pale Oak Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:pale_oak_log",
    glyph: "\uE219",
  },
  cobblestone: {
    id: "idlegen:cobblestone_generator",
    entityId: "idlegen:cobblestone_generator_entity",
    name: "Cobblestone Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:cobblestone",
    glyph: "\uE200",
  },
  coal: {
    id: "idlegen:coal_generator",
    entityId: "idlegen:coal_generator_entity",
    name: "Coal Generator",
    interval: 20,
    cap: 512,
    item: "minecraft:coal",
    glyph: "\uE201",
  },
  copper: {
    id: "idlegen:copper_generator",
    entityId: "idlegen:copper_generator_entity",
    name: "Copper Generator",
    interval: 30,
    cap: 512,
    item: "minecraft:raw_copper",
    glyph: "\uE202",
  },
  iron: {
    id: "idlegen:iron_generator",
    entityId: "idlegen:iron_generator_entity",
    name: "Iron Generator",
    interval: 30,
    cap: 512,
    item: "minecraft:raw_iron",
    glyph: "\uE203",
  },
  gold: {
    id: "idlegen:gold_generator",
    entityId: "idlegen:gold_generator_entity",
    name: "Gold Generator",
    interval: 35,
    cap: 512,
    item: "minecraft:gold_ingot",
    glyph: "\uE204",
  },
  diamond: {
    id: "idlegen:diamond_generator",
    entityId: "idlegen:diamond_generator_entity",
    name: "Diamond Generator",
    interval: 80,
    cap: 256,
    item: "minecraft:diamond",
    glyph: "\uE205",
  },
  emerald: {
    id: "idlegen:emerald_generator",
    entityId: "idlegen:emerald_generator_entity",
    name: "Emerald Generator",
    interval: 60,
    cap: 512,
    item: "emerald",
    glyph: "\uE206",
  },
  lapis: {
    id: "idlegen:lapis_generator",
    entityId: "idlegen:lapis_generator_entity",
    name: "Lapis Lazuli Generator",
    interval: 15,
    cap: 1024,
    item: "minecraft:lapis_lazuli",
    glyph: "\uE207",
  },
  redstone: {
    id: "idlegen:redstone_generator",
    entityId: "idlegen:redstone_generator_entity",
    name: "Redstone Generator",
    interval: 15,
    cap: 1024,
    item: "minecraft:redstone",
    glyph: "\uE208",
  },
  quartz: {
    id: "idlegen:quartz_generator",
    entityId: "idlegen:quartz_generator_entity",
    name: "Quartz Generator",
    interval: 30,
    cap: 512,
    item: "minecraft:quartz",
    glyph: "\uE209",
  },
  netherite: {
    id: "idlegen:netherite_generator",
    entityId: "idlegen:netherite_generator_entity",
    name: "Netherite Generator",
    interval: 100,
    cap: 64,
    item: "minecraft:netherite_ingot",
    glyph: "\uE210",
  },
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene el tipo de generador desde un block ID
 * @param blockId - El typeId del bloque (ej: "idlegen:iron_generator")
 * @returns La key del generador (ej: "iron") o null si no existe
 */
export function getGeneratorTypeFromBlockId(blockId: string): string | null {
  const cleanId = blockId.split("[")[0]; // por si viene con states
  for (const [key, def] of Object.entries(GENERATORS)) {
    if (def.id === cleanId) return key;
  }
  return null;
}

// ============================================================================
// GENERATOR DEFINITIONS
// ============================================================================
export interface GeneratorType {
  id: string;
  entityId?: string;
  name: string;
  interval: number; // Segundos entre producciones
  cap: number;
  item: string;
  glyph: string; // Carácter del glyph_XX.png. Offsets HEX: 00…09,0A,0B
}

export type GeneratorTypesMap = Record<string, GeneratorType>;
