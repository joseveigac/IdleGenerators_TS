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
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:oak_log",
    glyph: "\uE211",
  },
  spruce_log: {
    id: "ghozix_idlegen:spruce_log_generator",
    entityId: "ghozix_idlegen:spruce_log_generator_entity",
    name: "Spruce Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:spruce_log",
    glyph: "\uE212",
  },
  birch_log: {
    id: "ghozix_idlegen:birch_log_generator",
    entityId: "ghozix_idlegen:birch_log_generator_entity",
    name: "Birch Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:birch_log",
    glyph: "\uE213",
  },
  jungle_log: {
    id: "ghozix_idlegen:jungle_log_generator",
    entityId: "ghozix_idlegen:jungle_log_generator_entity",
    name: "Jungle Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:jungle_log",
    glyph: "\uE214",
  },
  acacia_log: {
    id: "ghozix_idlegen:acacia_log_generator",
    entityId: "ghozix_idlegen:acacia_log_generator_entity",
    name: "Acacia Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:acacia_log",
    glyph: "\uE215",
  },
  dark_oak_log: {
    id: "ghozix_idlegen:dark_oak_log_generator",
    entityId: "ghozix_idlegen:dark_oak_log_generator_entity",
    name: "Dark Oak Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:dark_oak_log",
    glyph: "\uE216",
  },
  mangrove_log: {
    id: "ghozix_idlegen:mangrove_log_generator",
    entityId: "ghozix_idlegen:mangrove_log_generator_entity",
    name: "Mangrove Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:mangrove_log",
    glyph: "\uE217",
  },
  cherry_log: {
    id: "ghozix_idlegen:cherry_log_generator",
    entityId: "ghozix_idlegen:cherry_log_generator_entity",
    name: "Cherry Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:cherry_log",
    glyph: "\uE218",
  },
  pale_oak_log: {
    id: "ghozix_idlegen:pale_oak_log_generator",
    entityId: "ghozix_idlegen:pale_oak_log_generator_entity",
    name: "Pale Oak Log Generator",
    category: "woods",
    interval: 5,
    cap: 64,
    item: "minecraft:pale_oak_log",
    glyph: "\uE219",
  },
  cobblestone: {
    id: "ghozix_idlegen:cobblestone_generator",
    entityId: "ghozix_idlegen:cobblestone_generator_entity",
    name: "Cobblestone Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:cobblestone",
    glyph: "\uE200",
  },
  coal: {
    id: "ghozix_idlegen:coal_generator",
    entityId: "ghozix_idlegen:coal_generator_entity",
    name: "Coal Generator",
    category: "ores",
    interval: 20,
    cap: 512,
    item: "minecraft:coal",
    glyph: "\uE201",
  },
  copper: {
    id: "ghozix_idlegen:copper_generator",
    entityId: "ghozix_idlegen:copper_generator_entity",
    name: "Copper Generator",
    category: "ores",
    interval: 30,
    cap: 512,
    item: "minecraft:raw_copper",
    glyph: "\uE202",
  },
  iron: {
    id: "ghozix_idlegen:iron_generator",
    entityId: "ghozix_idlegen:iron_generator_entity",
    name: "Iron Generator",
    category: "ores",
    interval: 30,
    cap: 512,
    item: "minecraft:raw_iron",
    glyph: "\uE203",
  },
  gold: {
    id: "ghozix_idlegen:gold_generator",
    entityId: "ghozix_idlegen:gold_generator_entity",
    name: "Gold Generator",
    category: "ores",
    interval: 35,
    cap: 512,
    item: "minecraft:gold_ingot",
    glyph: "\uE204",
  },
  diamond: {
    id: "ghozix_idlegen:diamond_generator",
    entityId: "ghozix_idlegen:diamond_generator_entity",
    name: "Diamond Generator",
    category: "ores",
    interval: 80,
    cap: 256,
    item: "minecraft:diamond",
    glyph: "\uE205",
  },
  emerald: {
    id: "ghozix_idlegen:emerald_generator",
    entityId: "ghozix_idlegen:emerald_generator_entity",
    name: "Emerald Generator",
    category: "ores",
    interval: 60,
    cap: 512,
    item: "emerald",
    glyph: "\uE206",
  },
  lapis: {
    id: "ghozix_idlegen:lapis_generator",
    entityId: "ghozix_idlegen:lapis_generator_entity",
    name: "Lapis Lazuli Generator",
    category: "ores",
    interval: 15,
    cap: 1024,
    item: "minecraft:lapis_lazuli",
    glyph: "\uE207",
  },
  redstone: {
    id: "ghozix_idlegen:redstone_generator",
    entityId: "ghozix_idlegen:redstone_generator_entity",
    name: "Redstone Generator",
    category: "ores",
    interval: 15,
    cap: 1024,
    item: "minecraft:redstone",
    glyph: "\uE208",
  },
  quartz: {
    id: "ghozix_idlegen:quartz_generator",
    entityId: "ghozix_idlegen:quartz_generator_entity",
    name: "Quartz Generator",
    category: "ores",
    interval: 30,
    cap: 512,
    item: "minecraft:quartz",
    glyph: "\uE209",
  },
  netherite: {
    id: "ghozix_idlegen:netherite_generator",
    entityId: "ghozix_idlegen:netherite_generator_entity",
    name: "Netherite Generator",
    category: "ores",
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
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:stone",
    glyph: "\uE21A",
  },
  granite: {
    id: "ghozix_idlegen:granite_generator",
    entityId: "ghozix_idlegen:granite_generator_entity",
    name: "Granite Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:granite",
    glyph: "\uE21B",
  },
  diorite: {
    id: "ghozix_idlegen:diorite_generator",
    entityId: "ghozix_idlegen:diorite_generator_entity",
    name: "Diorite Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:diorite",
    glyph: "\uE21C",
  },
  andesite: {
    id: "ghozix_idlegen:andesite_generator",
    entityId: "ghozix_idlegen:andesite_generator_entity",
    name: "Andesite Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:andesite",
    glyph: "\uE21D",
  },
  deepslate: {
    id: "ghozix_idlegen:deepslate_generator",
    entityId: "ghozix_idlegen:deepslate_generator_entity",
    name: "Deepslate Generator",
    category: "stones",
    interval: 10,
    cap: 512,
    item: "minecraft:deepslate",
    glyph: "\uE21E",
  },
  tuff: {
    id: "ghozix_idlegen:tuff_generator",
    entityId: "ghozix_idlegen:tuff_generator_entity",
    name: "Tuff Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:tuff",
    glyph: "\uE21F",
  },
  calcite: {
    id: "ghozix_idlegen:calcite_generator",
    entityId: "ghozix_idlegen:calcite_generator_entity",
    name: "Calcite Generator",
    category: "stones",
    interval: 10,
    cap: 512,
    item: "minecraft:calcite",
    glyph: "\uE220",
  },
  dripstone: {
    id: "ghozix_idlegen:dripstone_generator",
    entityId: "ghozix_idlegen:dripstone_generator_entity",
    name: "Dripstone Generator",
    category: "stones",
    interval: 10,
    cap: 512,
    item: "minecraft:pointed_dripstone",
    glyph: "\uE221",
  },
  gravel: {
    id: "ghozix_idlegen:gravel_generator",
    entityId: "ghozix_idlegen:gravel_generator_entity",
    name: "Gravel Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:gravel",
    glyph: "\uE222",
  },
  sand: {
    id: "ghozix_idlegen:sand_generator",
    entityId: "ghozix_idlegen:sand_generator_entity",
    name: "Sand Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:sand",
    glyph: "\uE223",
  },
  red_sand: {
    id: "ghozix_idlegen:red_sand_generator",
    entityId: "ghozix_idlegen:red_sand_generator_entity",
    name: "Red Sand Generator",
    category: "stones",
    interval: 5,
    cap: 512,
    item: "minecraft:red_sand",
    glyph: "\uE224",
  },
  clay: {
    id: "ghozix_idlegen:clay_generator",
    entityId: "ghozix_idlegen:clay_generator_entity",
    name: "Clay Generator",
    category: "stones",
    interval: 5,
    cap: 1024,
    item: "minecraft:clay_ball",
    glyph: "\uE225",
  },
  // \u2500\u2500 Colors (v1.3.0) \u2500\u2500
  white_dye: {
    id: "ghozix_idlegen:white_dye_generator",
    entityId: "ghozix_idlegen:white_dye_generator_entity",
    name: "White Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:white_dye",
    glyph: "\uE226",
  },
  light_gray_dye: {
    id: "ghozix_idlegen:light_gray_dye_generator",
    entityId: "ghozix_idlegen:light_gray_dye_generator_entity",
    name: "Light Gray Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:light_gray_dye",
    glyph: "\uE227",
  },
  gray_dye: {
    id: "ghozix_idlegen:gray_dye_generator",
    entityId: "ghozix_idlegen:gray_dye_generator_entity",
    name: "Gray Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:gray_dye",
    glyph: "\uE228",
  },
  black_dye: {
    id: "ghozix_idlegen:black_dye_generator",
    entityId: "ghozix_idlegen:black_dye_generator_entity",
    name: "Black Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:black_dye",
    glyph: "\uE229",
  },
  brown_dye: {
    id: "ghozix_idlegen:brown_dye_generator",
    entityId: "ghozix_idlegen:brown_dye_generator_entity",
    name: "Brown Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:brown_dye",
    glyph: "\uE22A",
  },
  red_dye: {
    id: "ghozix_idlegen:red_dye_generator",
    entityId: "ghozix_idlegen:red_dye_generator_entity",
    name: "Red Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:red_dye",
    glyph: "\uE22B",
  },
  orange_dye: {
    id: "ghozix_idlegen:orange_dye_generator",
    entityId: "ghozix_idlegen:orange_dye_generator_entity",
    name: "Orange Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:orange_dye",
    glyph: "\uE22C",
  },
  yellow_dye: {
    id: "ghozix_idlegen:yellow_dye_generator",
    entityId: "ghozix_idlegen:yellow_dye_generator_entity",
    name: "Yellow Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:yellow_dye",
    glyph: "\uE22D",
  },
  lime_dye: {
    id: "ghozix_idlegen:lime_dye_generator",
    entityId: "ghozix_idlegen:lime_dye_generator_entity",
    name: "Lime Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:lime_dye",
    glyph: "\uE22E",
  },
  green_dye: {
    id: "ghozix_idlegen:green_dye_generator",
    entityId: "ghozix_idlegen:green_dye_generator_entity",
    name: "Green Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:green_dye",
    glyph: "\uE22F",
  },
  cyan_dye: {
    id: "ghozix_idlegen:cyan_dye_generator",
    entityId: "ghozix_idlegen:cyan_dye_generator_entity",
    name: "Cyan Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:cyan_dye",
    glyph: "\uE230",
  },
  light_blue_dye: {
    id: "ghozix_idlegen:light_blue_dye_generator",
    entityId: "ghozix_idlegen:light_blue_dye_generator_entity",
    name: "Light Blue Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:light_blue_dye",
    glyph: "\uE231",
  },
  blue_dye: {
    id: "ghozix_idlegen:blue_dye_generator",
    entityId: "ghozix_idlegen:blue_dye_generator_entity",
    name: "Blue Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:blue_dye",
    glyph: "\uE232",
  },
  purple_dye: {
    id: "ghozix_idlegen:purple_dye_generator",
    entityId: "ghozix_idlegen:purple_dye_generator_entity",
    name: "Purple Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:purple_dye",
    glyph: "\uE233",
  },
  magenta_dye: {
    id: "ghozix_idlegen:magenta_dye_generator",
    entityId: "ghozix_idlegen:magenta_dye_generator_entity",
    name: "Magenta Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:magenta_dye",
    glyph: "\uE234",
  },
  pink_dye: {
    id: "ghozix_idlegen:pink_dye_generator",
    entityId: "ghozix_idlegen:pink_dye_generator_entity",
    name: "Pink Dye Generator",
    category: "colors",
    interval: 5,
    cap: 1024,
    item: "minecraft:pink_dye",
    glyph: "\uE235",
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
/** Pack al que pertenece un generador. Solo agrupa: cada generador se activa por separado. */
export type GeneratorCategory = "ores" | "woods" | "stones" | "colors";

/** Orden de los packs en la configuración. */
export const GENERATOR_SETS: GeneratorCategory[] = ["ores", "woods", "stones", "colors"];

/** Claves de los generadores de un pack, en el orden del catálogo. */
export function generatorKeysOf(set: GeneratorCategory): string[] {
  return Object.keys(GENERATORS).filter((key) => GENERATORS[key].category === set);
}

/** Estado encendido/apagado por pack. */
export type SetStates = Record<GeneratorCategory, boolean>;

/** Todos los packs encendidos: el estado por defecto del addon. */
export function allSetsOn(): SetStates {
  const states = {} as SetStates;
  for (const set of GENERATOR_SETS) states[set] = true;
  return states;
}

export interface GeneratorType {
  id: string;
  entityId?: string;
  name: string;
  category: GeneratorCategory;
  interval: number; // Segundos entre producciones
  cap: number;
  item: string;
  glyph: string; // Carácter del glyph_XX.png. Offsets HEX: 00…09,0A,0B
}

export type GeneratorTypesMap = Record<string, GeneratorType>;
