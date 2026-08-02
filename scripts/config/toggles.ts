/**
 * IdleGen - Toggles
 *
 * Activación por generador: cada uno se enciende o se apaga por separado. Estado
 * mundial, editable en juego, aplicado en vivo. Por defecto todos activados, así
 * que solo se guardan los apagados.
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
import { GENERATORS } from "../definitions/generator_definitions";
import { updateAllPlaced } from "../instances/placed";
import { settle } from "../instances/production";
import { log } from "../utils/logger";

import type { GeneratorData } from "../components/generator";
import type { PlacedInstance } from "../types/common";

/** Sube esto si cambia la forma de ToggleConfig: lo anterior se descarta. */
const CONFIG_VERSION = 2;

export interface ToggleConfig {
  v: number;
  /** Claves de los generadores apagados. Ausente de la lista = encendido. */
  off: string[];
  /** Generador -> instante (ms) en que quedó apagado. */
  frozenSince: Record<string, number>;
}

let cache: ToggleConfig | null = null;

function load(): ToggleConfig {
  const stored = getWorldData<Partial<ToggleConfig>>(WORLD_KEYS.CONFIG.TOGGLES);

  // Primera vez, o config de un formato anterior: se empieza limpio.
  if (!stored || stored.v !== CONFIG_VERSION || !Array.isArray(stored.off)) {
    return { v: CONFIG_VERSION, off: [], frozenSince: {} };
  }

  return { v: CONFIG_VERSION, off: stored.off, frozenSince: stored.frozenSince ?? {} };
}

/** Config actual (cacheada en memoria; solo este módulo la escribe). */
export function getToggles(): ToggleConfig {
  if (!cache) cache = load();
  return cache;
}

export function isEnabled(key: string, cfg: ToggleConfig = getToggles()): boolean {
  return !cfg.off.includes(key);
}

/**
 * Aplica los interruptores de una página del formulario. Los generadores que no
 * aparezcan en `states` conservan su estado.
 */
export function applyToggles(states: Record<string, boolean>): void {
  const current = getToggles();
  const off = new Set(current.off);

  for (const [key, enabled] of Object.entries(states)) {
    if (!(key in GENERATORS)) continue;
    if (enabled) off.delete(key);
    else off.add(key);
  }

  const updated: ToggleConfig = {
    v: CONFIG_VERSION,
    off: [...off],
    frozenSince: { ...current.frozenSince },
  };

  freezeThaw(updated, current, Date.now());

  cache = updated;
  setWorldData(WORLD_KEYS.CONFIG.TOGGLES, updated);
}

/** Barrido único sobre las instancias cuyo tipo ha cambiado de estado. */
function freezeThaw(next: ToggleConfig, previous: ToggleConfig, now: number): void {
  const toFreeze = new Set<string>();
  const toThaw = new Set<string>();

  for (const key of Object.keys(GENERATORS)) {
    const was = isEnabled(key, previous);
    const is = isEnabled(key, next);
    if (was && !is) toFreeze.add(key);
    else if (!was && is) toThaw.add(key);
  }

  if (toFreeze.size === 0 && toThaw.size === 0) return;

  const frozenSince = next.frozenSince;

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

  for (const key of toFreeze) next.frozenSince[key] = now;
  for (const key of toThaw) delete next.frozenSince[key];

  log(`[IdleGen] Toggles: ${toFreeze.size} apagados, ${toThaw.size} encendidos, ${touched} instancias ajustadas.`);
}
