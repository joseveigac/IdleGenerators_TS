/**
 * IdleGen - Generator Flush
 *
 * Volcado automático: si hay un contenedor justo DEBAJO de un generador, su
 * buffer se vacía dentro. Un hopper debajo encadena luego por vanilla, así que
 * compone con los sistemas de almacenamiento que ya tenga el jugador.
 *
 * Un bloque custom no puede tener inventario en Bedrock, así que un hopper NO
 * puede succionar de él: el movimiento lo hace este script empujando.
 *
 * La generación es offline; la ENTREGA no. Mientras el área está descargada el
 * buffer sigue llenándose y se vuelca cuando vuelve a cargarse.
 */

import { Block, Container, ItemStack, system, world } from "@minecraft/server";

import { GENERATORS, GeneratorType } from "../definitions/generator_definitions";
import { parsePosKey, removePlacedAtPos, updateAllPlaced } from "../instances/placed";
import { settle } from "../instances/production";
import { removeVisualEntity } from "../instances/visual_entity";
import { isEnabled } from "../config/toggles";
import { log } from "../utils/logger";

import type { GeneratorData } from "../components/generator";
import type { PlacedInstance } from "../types/common";

/** Una pasada por segundo: el buffer se vacía casi a la vez que se produce. */
const FLUSH_INTERVAL_TICKS = 20;

/** Techo de items movidos por generador y pasada (acota el trabajo por tick). */
const MAX_ITEMS_PER_PASS = 256;

const HOPPER_ID = "minecraft:hopper";

/** Contenedores de almacenamiento válidos como destino. Fuera hornos y alquimia:
 *  `addItem` usa "el primer hueco libre", que ahí puede ser la ranura de combustible. */
const SINK_IDS = new Set<string>([
  "minecraft:chest",
  "minecraft:trapped_chest",
  "minecraft:barrel",
  HOPPER_ID,
  "minecraft:dropper",
  "minecraft:dispenser",
]);

export class GeneratorFlush {
  static initialize(): void {
    system.runInterval(() => GeneratorFlush.pass(), FLUSH_INTERVAL_TICKS);
  }

  private static pass(): void {
    const now = Date.now();
    const orphans: string[] = [];

    updateAllPlaced((instance) => {
      if (instance.type !== "generator") return false;

      try {
        return GeneratorFlush.flushInstance(instance as PlacedInstance<GeneratorData>, now, orphans);
      } catch {
        return false; // chunk descargado, bloque inválido… se reintenta en la siguiente pasada
      }
    });

    for (const posKey of orphans) {
      removePlacedAtPos(posKey);
      log(`[Flush] Removed orphan instance at ${posKey}`);
    }
  }

  /** Devuelve true si la instancia debe persistirse (se movieron items). */
  private static flushInstance(instance: PlacedInstance<GeneratorData>, now: number, orphans: string[]): boolean {
    const data = instance.data;
    const def = GENERATORS[data.type];
    if (!def) return false;

    const pos = parsePosKey(instance.posKey);
    if (!pos) return false;

    const block = world.getDimension(pos.dim).getBlock({ x: pos.x, y: pos.y, z: pos.z });
    if (!block || !block.isValid) return false; // no cargado: ya se verá

    // El registro es una pista, la verdad es el mundo: si el generador ya no está
    // (pistón, /setblock, editor de mundos…) la instancia es huérfana.
    if (block.typeId !== def.id) {
      removeVisualEntity(block.dimension, block.location, instance.posKey);
      orphans.push(instance.posKey);
      return false;
    }

    const container = sinkBelow(block);
    if (!container) return false;

    // Un generador desactivado no produce, pero su buffer se sigue vaciando.
    const available = settle(data, def, now, isEnabled(data.type));
    if (available <= 0) return false;

    const moved = push(container, def, available);
    if (moved <= 0) return false;

    data.storedAmount = available - moved;
    return true;
  }
}

/** Contenedor válido bajo el generador, o undefined. */
function sinkBelow(block: Block): Container | undefined {
  const below = block.below();
  if (!below) return undefined;
  if (!SINK_IDS.has(below.typeId) && !below.typeId.endsWith("shulker_box")) return undefined;

  // Vanilla: un hopper alimentado con redstone está bloqueado y no acepta items.
  if (below.typeId === HOPPER_ID && (below.getRedstonePower() ?? 0) > 0) return undefined;

  return below.getComponent("minecraft:inventory")?.container;
}

/** `maxAmount` por item: constante en runtime, se consulta una vez y se cachea. */
const MAX_STACK = new Map<string, number>();

function maxStackOf(item: string): number {
  let max = MAX_STACK.get(item);
  if (max === undefined) {
    max = new ItemStack(item, 1).maxAmount;
    MAX_STACK.set(item, max);
  }
  return max;
}

/** Empuja hasta `MAX_ITEMS_PER_PASS`; lo que no cabe se queda en el buffer. */
function push(container: Container, def: GeneratorType, available: number): number {
  const maxStack = maxStackOf(def.item);
  const budget = Math.min(available, MAX_ITEMS_PER_PASS);
  let moved = 0;

  while (moved < budget) {
    const size = Math.min(maxStack, budget - moved);
    const leftover = container.addItem(new ItemStack(def.item, size));
    const placed = size - (leftover?.amount ?? 0);

    moved += placed;
    if (placed < size) break; // contenedor lleno
  }

  return moved;
}
