/**
 * IdleGen - Toggles
 *
 * Interruptores de activación de generadores: uno por categoría más un override
 * tri-estado por generador (el individual siempre gana). Estado mundial, editable
 * en juego, aplicado en vivo.
 *
 * SEMÁNTICA DE "DESACTIVADO" (garantía anti-exploit, portada de Java):
 *  - El bloque sigue en el mundo; no se borra ni se pierde nada.
 *  - No produce Y NO ACUMULA por detrás: reactivar nunca regala un buffer lleno.
 *  - Lo ya acumulado se sigue pudiendo retirar (a mano y por automatización).
 *
 * Como el modelo es perezoso (timestamps, no ticks), congelar se hace con un
 * barrido en el momento del cambio: al apagar se consolida lo producido y se
 * sella `frozenSince`; al encender se desplaza `lastInteraction` el tiempo que
 * estuvo apagado. El barrido alcanza también a los generadores en chunks
 * descargados, porque el estado vive en Dynamic Properties, no en el chunk.
 */

import { getWorldData, setWorldData } from "../storage/storage";
import { WORLD_KEYS } from "../storage/storage_keys";
import { GENERATORS, GeneratorCategory } from "../definitions/generator_definitions";
import { updateAllPlaced } from "../instances/placed";
import { settle } from "../instances/production";
import { log } from "../utils/logger";

import type { GeneratorData } from "../components/generator";
import type { PlacedInstance } from "../types/common";

/** Orden de presentación en la UI. */
export const CATEGORIES: GeneratorCategory[] = ["ores", "woods", "stones"];

/** Override por generador. `default` = hereda el estado de su categoría. */
export type ToggleState = "default" | "on" | "off";

export interface ToggleConfig {
  v: number;
  /** Categoría -> activada. Ausente = activada. */
  categories: Partial<Record<GeneratorCategory, boolean>>;
  /** Generador -> override. Solo se guardan los que no son "default". */
  generators: Record<string, ToggleState>;
  /** Generador -> instante (ms) en que quedó desactivado. */
  frozenSince: Record<string, number>;
}

let cache: ToggleConfig | null = null;

function load(): ToggleConfig {
  const stored = getWorldData<Partial<ToggleConfig>>(WORLD_KEYS.CONFIG.TOGGLES);

  return {
    v: 1,
    categories: stored?.categories ?? {},
    generators: stored?.generators ?? {},
    frozenSince: stored?.frozenSince ?? {},
  };
}

/** Config actual (cacheada en memoria; solo este módulo la escribe). */
export function getToggles(): ToggleConfig {
  if (!cache) cache = load();
  return cache;
}

/** El override individual manda sobre su categoría; por defecto todo activado. */
export function isEnabled(key: string, category: GeneratorCategory, cfg: ToggleConfig = getToggles()): boolean {
  const override = cfg.generators[key];
  if (override === "on") return true;
  if (override === "off") return false;

  return cfg.categories[category] ?? true;
}

/**
 * Aplica un conjunto completo de interruptores (un submit del formulario),
 * congelando o descongelando lo que haya cambiado de estado.
 */
export function applyToggles(next: {
  categories: Partial<Record<GeneratorCategory, boolean>>;
  generators: Record<string, ToggleState>;
}): void {
  const current = getToggles();
  const updated: ToggleConfig = {
    v: 1,
    categories: { ...next.categories },
    generators: { ...next.generators },
    frozenSince: { ...current.frozenSince },
  };

  freezeThaw(updated, enabledSet(current), enabledSet(updated), Date.now());

  cache = updated;
  setWorldData(WORLD_KEYS.CONFIG.TOGGLES, updated);
}

/** Conjunto de generadores efectivamente activados con esa config. */
function enabledSet(cfg: ToggleConfig): Set<string> {
  const out = new Set<string>();

  for (const [key, def] of Object.entries(GENERATORS)) {
    if (isEnabled(key, def.category, cfg)) out.add(key);
  }

  return out;
}

/** Barrido único sobre las instancias afectadas por el cambio de estado. */
function freezeThaw(cfg: ToggleConfig, before: Set<string>, after: Set<string>, now: number): void {
  const toFreeze = new Set<string>();
  const toThaw = new Set<string>();

  for (const key of Object.keys(GENERATORS)) {
    if (before.has(key) && !after.has(key)) toFreeze.add(key);
    else if (!before.has(key) && after.has(key)) toThaw.add(key);
  }

  if (toFreeze.size === 0 && toThaw.size === 0) return;

  const frozenSince = cfg.frozenSince;

  const touched = updateAllPlaced((instance) => {
    if (instance.type !== "generator") return false;

    const data = (instance as PlacedInstance<GeneratorData>).data;
    const def = GENERATORS[data.type];
    if (!def) return false;

    // Apagando: consolida lo producido legítimamente y deja de contar.
    if (toFreeze.has(data.type)) {
      settle(data, def, now, true);
      return true;
    }

    // Encendiendo: descuenta el tiempo apagado. El clamp evita mandar al futuro
    // un generador colocado mientras su tipo estaba desactivado.
    if (toThaw.has(data.type)) {
      const since = frozenSince[data.type];
      if (since === undefined) return false;
      data.lastInteraction = Math.min(now, data.lastInteraction + (now - since));
      return true;
    }

    return false;
  });

  for (const key of toFreeze) cfg.frozenSince[key] = now;
  for (const key of toThaw) delete cfg.frozenSince[key];

  log(`[IdleGen] Toggles: ${toFreeze.size} congelados, ${toThaw.size} reactivados, ${touched} instancias ajustadas.`);
}
