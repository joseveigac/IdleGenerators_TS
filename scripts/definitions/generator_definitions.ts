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
    id: "ghozix_idlegen:oak_log_generator",
    entityId: "ghozix_idlegen:oak_log_generator_entity",
    name: "Oak Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:oak_log",
    glyph: "\uE211",
  },
  spruce_log: {
    id: "ghozix_idlegen:spruce_log_generator",
    entityId: "ghozix_idlegen:spruce_log_generator_entity",
    name: "Spruce Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:spruce_log",
    glyph: "\uE212",
  },
  birch_log: {
    id: "ghozix_idlegen:birch_log_generator",
    entityId: "ghozix_idlegen:birch_log_generator_entity",
    name: "Birch Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:birch_log",
    glyph: "\uE213",
  },
  jungle_log: {
    id: "ghozix_idlegen:jungle_log_generator",
    entityId: "ghozix_idlegen:jungle_log_generator_entity",
    name: "Jungle Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:jungle_log",
    glyph: "\uE214",
  },
  acacia_log: {
    id: "ghozix_idlegen:acacia_log_generator",
    entityId: "ghozix_idlegen:acacia_log_generator_entity",
    name: "Acacia Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:acacia_log",
    glyph: "\uE215",
  },
  dark_oak_log: {
    id: "ghozix_idlegen:dark_oak_log_generator",
    entityId: "ghozix_idlegen:dark_oak_log_generator_entity",
    name: "Dark Oak Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:dark_oak_log",
    glyph: "\uE216",
  },
  mangrove_log: {
    id: "ghozix_idlegen:mangrove_log_generator",
    entityId: "ghozix_idlegen:mangrove_log_generator_entity",
    name: "Mangrove Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:mangrove_log",
    glyph: "\uE217",
  },
  cherry_log: {
    id: "ghozix_idlegen:cherry_log_generator",
    entityId: "ghozix_idlegen:cherry_log_generator_entity",
    name: "Cherry Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:cherry_log",
    glyph: "\uE218",
  },
  pale_oak_log: {
    id: "ghozix_idlegen:pale_oak_log_generator",
    entityId: "ghozix_idlegen:pale_oak_log_generator_entity",
    name: "Pale Oak Log Generator",
    interval: 5,
    cap: 64,
    item: "minecraft:pale_oak_log",
    glyph: "\uE219",
  },
  cobblestone: {
    id: "ghozix_idlegen:cobblestone_generator",
    entityId: "ghozix_idlegen:cobblestone_generator_entity",
    name: "Cobblestone Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:cobblestone",
    glyph: "\uE200",
  },
  coal: {
    id: "ghozix_idlegen:coal_generator",
    entityId: "ghozix_idlegen:coal_generator_entity",
    name: "Coal Generator",
    interval: 20,
    cap: 512,
    item: "minecraft:coal",
    glyph: "\uE201",
  },
  copper: {
    id: "ghozix_idlegen:copper_generator",
    entityId: "ghozix_idlegen:copper_generator_entity",
    name: "Copper Generator",
    interval: 30,
    cap: 512,
    item: "minecraft:raw_copper",
    glyph: "\uE202",
  },
  iron: {
    id: "ghozix_idlegen:iron_generator",
    entityId: "ghozix_idlegen:iron_generator_entity",
    name: "Iron Generator",
    interval: 30,
    cap: 512,
    item: "minecraft:raw_iron",
    glyph: "\uE203",
  },
  gold: {
    id: "ghozix_idlegen:gold_generator",
    entityId: "ghozix_idlegen:gold_generator_entity",
    name: "Gold Generator",
    interval: 35,
    cap: 512,
    item: "minecraft:gold_ingot",
    glyph: "\uE204",
  },
  diamond: {
    id: "ghozix_idlegen:diamond_generator",
    entityId: "ghozix_idlegen:diamond_generator_entity",
    name: "Diamond Generator",
    interval: 80,
    cap: 256,
    item: "minecraft:diamond",
    glyph: "\uE205",
  },
  emerald: {
    id: "ghozix_idlegen:emerald_generator",
    entityId: "ghozix_idlegen:emerald_generator_entity",
    name: "Emerald Generator",
    interval: 60,
    cap: 512,
    item: "emerald",
    glyph: "\uE206",
  },
  lapis: {
    id: "ghozix_idlegen:lapis_generator",
    entityId: "ghozix_idlegen:lapis_generator_entity",
    name: "Lapis Lazuli Generator",
    interval: 15,
    cap: 1024,
    item: "minecraft:lapis_lazuli",
    glyph: "\uE207",
  },
  redstone: {
    id: "ghozix_idlegen:redstone_generator",
    entityId: "ghozix_idlegen:redstone_generator_entity",
    name: "Redstone Generator",
    interval: 15,
    cap: 1024,
    item: "minecraft:redstone",
    glyph: "\uE208",
  },
  quartz: {
    id: "ghozix_idlegen:quartz_generator",
    entityId: "ghozix_idlegen:quartz_generator_entity",
    name: "Quartz Generator",
    interval: 30,
    cap: 512,
    item: "minecraft:quartz",
    glyph: "\uE209",
  },
  netherite: {
    id: "ghozix_idlegen:netherite_generator",
    entityId: "ghozix_idlegen:netherite_generator_entity",
    name: "Netherite Generator",
    interval: 100,
    cap: 64,
    item: "minecraft:netherite_ingot",
    glyph: "\uE210",
  },
  // \u2500\u2500 Stone & Construction (v1.2.0) \u2500\u2500
  stone: {
    id: "ghozix_idlegen:stone_generator",
    entityId: "ghozix_idlegen:stone_generator_entity",
    name: "Stone Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:stone",
    glyph: "\uE21A",
  },
  granite: {
    id: "ghozix_idlegen:granite_generator",
    entityId: "ghozix_idlegen:granite_generator_entity",
    name: "Granite Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:granite",
    glyph: "\uE21B",
  },
  diorite: {
    id: "ghozix_idlegen:diorite_generator",
    entityId: "ghozix_idlegen:diorite_generator_entity",
    name: "Diorite Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:diorite",
    glyph: "\uE21C",
  },
  andesite: {
    id: "ghozix_idlegen:andesite_generator",
    entityId: "ghozix_idlegen:andesite_generator_entity",
    name: "Andesite Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:andesite",
    glyph: "\uE21D",
  },
  deepslate: {
    id: "ghozix_idlegen:deepslate_generator",
    entityId: "ghozix_idlegen:deepslate_generator_entity",
    name: "Deepslate Generator",
    interval: 10,
    cap: 512,
    item: "minecraft:deepslate",
    glyph: "\uE21E",
  },
  tuff: {
    id: "ghozix_idlegen:tuff_generator",
    entityId: "ghozix_idlegen:tuff_generator_entity",
    name: "Tuff Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:tuff",
    glyph: "\uE21F",
  },
  calcite: {
    id: "ghozix_idlegen:calcite_generator",
    entityId: "ghozix_idlegen:calcite_generator_entity",
    name: "Calcite Generator",
    interval: 10,
    cap: 512,
    item: "minecraft:calcite",
    glyph: "\uE220",
  },
  dripstone: {
    id: "ghozix_idlegen:dripstone_generator",
    entityId: "ghozix_idlegen:dripstone_generator_entity",
    name: "Dripstone Generator",
    interval: 10,
    cap: 512,
    item: "minecraft:pointed_dripstone",
    glyph: "\uE221",
  },
  gravel: {
    id: "ghozix_idlegen:gravel_generator",
    entityId: "ghozix_idlegen:gravel_generator_entity",
    name: "Gravel Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:gravel",
    glyph: "\uE222",
  },
  sand: {
    id: "ghozix_idlegen:sand_generator",
    entityId: "ghozix_idlegen:sand_generator_entity",
    name: "Sand Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:sand",
    glyph: "\uE223",
  },
  red_sand: {
    id: "ghozix_idlegen:red_sand_generator",
    entityId: "ghozix_idlegen:red_sand_generator_entity",
    name: "Red Sand Generator",
    interval: 5,
    cap: 512,
    item: "minecraft:red_sand",
    glyph: "\uE224",
  },
  clay: {
    id: "ghozix_idlegen:clay_generator",
    entityId: "ghozix_idlegen:clay_generator_entity",
    name: "Clay Generator",
    interval: 5,
    cap: 1024,
    item: "minecraft:clay_ball",
    glyph: "\uE225",
  },
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene el tipo de generador desde un block ID
 * @param blockId - El typeId del bloque (ej: "ghozix_idlegen:iron_generator")
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
