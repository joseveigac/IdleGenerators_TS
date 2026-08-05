/**
 * IdleGen - Toggles
 *
 * Activación por generador: cada uno se enciende o se apaga por separado. Estado
 * mundial, editable en juego, aplicado en vivo. Por defecto todos activados, así
 * que solo se guardan los apagados.
 *
 * El interruptor por pack de los ajustes del addon ([config/pack_settings.ts]) NO
 * es una segunda capa por encima: actúa POR FLANCO al cargar el mundo, apagando o
 * encendiendo sus generadores de golpe sobre esta misma lista. Así hay un solo
 * estado, el menú en juego manda siempre y puede encender un generador aunque su
 * pack esté apagado en el manifest. `packOff` recuerda qué claves apagó el pack,
 * para que reencenderlo devuelva solo esas: lo que se toca a mano deja de ser suyo.
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
import { GENERATORS, GENERATOR_SETS, allSetsOn, generatorKeysOf } from "../definitions/generator_definitions";
import { updateAllPlaced } from "../instances/placed";
import { settle } from "../instances/production";
import { log } from "../utils/logger";

import type { SetStates } from "../definitions/generator_definitions";
import type { GeneratorData } from "../components/generator";
import type { PlacedInstance } from "../types/common";

/** Sube esto si cambia la forma de ToggleConfig: lo anterior se descarta. */
const CONFIG_VERSION = 3;

export interface ToggleConfig {
  v: number;
  /** Claves de los generadores apagados. Ausente de la lista = encendido. */
  off: string[];
  /** Generador -> instante (ms) en que quedó apagado. */
  frozenSince: Record<string, number>;
  /** Último estado conocido de los ajustes del pack, para detectar el flanco. */
  sets: SetStates;
  /** Claves que apagó el interruptor del pack y siguen siendo suyas. */
  packOff: string[];
}

let cache: ToggleConfig | null = null;

/** Espejo de `cache.off` para consultas O(1): isEnabled corre en el volcado y el HUD. */
let offSet = new Set<string>();

/** Solo un `false` explícito apaga un pack; lo que falte queda encendido. */
function normalizeSets(stored: Partial<SetStates> | undefined): SetStates {
  const sets = allSetsOn();
  if (!stored) return sets;

  for (const set of GENERATOR_SETS) {
    if (stored[set] === false) sets[set] = false;
  }

  return sets;
}

function load(): ToggleConfig {
  const stored = getWorldData<Partial<ToggleConfig>>(WORLD_KEYS.CONFIG.TOGGLES);

  // Primera vez, o config de un formato anterior: se empieza limpio.
  if (!stored || stored.v !== CONFIG_VERSION || !Array.isArray(stored.off)) {
    return { v: CONFIG_VERSION, off: [], frozenSince: {}, sets: allSetsOn(), packOff: [] };
  }

  return {
    v: CONFIG_VERSION,
    off: stored.off,
    frozenSince: stored.frozenSince ?? {},
    sets: normalizeSets(stored.sets),
    packOff: stored.packOff ?? [],
  };
}

/** Config actual (cacheada en memoria; solo este módulo la escribe). */
export function getToggles(): ToggleConfig {
  if (!cache) {
    cache = load();
    offSet = new Set(cache.off);
  }
  return cache;
}

export function isEnabled(key: string): boolean {
  getToggles();
  return !offSet.has(key);
}

/** Publica una config nueva, ajustando de paso las instancias que cambian de estado. */
function commit(updated: ToggleConfig, previous: ToggleConfig): void {
  freezeThaw(updated, previous, Date.now());

  cache = updated;
  offSet = new Set(updated.off);
  setWorldData(WORLD_KEYS.CONFIG.TOGGLES, updated);
}

/**
 * Aplica los interruptores de una página del formulario. Los generadores que no
 * aparezcan en `states` conservan su estado.
 */
export function applyToggles(states: Record<string, boolean>): void {
  const current = getToggles();
  const off = new Set(current.off);
  const packOff = new Set(current.packOff);

  for (const [key, enabled] of Object.entries(states)) {
    if (!(key in GENERATORS)) continue;
    if (enabled) off.delete(key);
    else off.add(key);

    // Tocarlo a mano se lo quita al pack: a partir de aquí manda esta elección.
    packOff.delete(key);
  }

  commit({ ...current, off: [...off], packOff: [...packOff], frozenSince: { ...current.frozenSince } }, current);
}

/**
 * Aplica el interruptor por pack de los ajustes del addon. Se llama al cargar el
 * mundo, y solo ahí: es el único momento en que el valor puede haber cambiado,
 * porque `getPackSettings()` devuelve una foto tomada al cargar (ver
 * [config/pack_settings.ts]).
 *
 * Actúa por flanco, no como capa: solo hace algo con los packs cuyo ajuste ha
 * cambiado desde la última carga. Un pack que sigue apagado no vuelve a imponerse,
 * así que lo que se cambie en el menú sobrevive a salir y entrar del mundo.
 *
 * Pasa por el mismo barrido que los interruptores en juego, así que apagar un
 * pack durante una semana y volver a encenderlo no regala una semana de búfer.
 */
export function syncPackSettings(states: SetStates): void {
  const current = getToggles();
  const changed = GENERATOR_SETS.filter((set) => current.sets[set] !== states[set]);

  if (changed.length === 0) return;

  const off = new Set(current.off);
  const packOff = new Set(current.packOff);

  for (const set of changed) {
    for (const key of generatorKeysOf(set)) {
      if (states[set]) {
        // Encendiendo: vuelve solo lo que apagó el propio pack.
        if (packOff.delete(key)) off.delete(key);
      } else if (!off.has(key)) {
        // Apagando: lo que ya estaba apagado sigue siendo del jugador, no del pack.
        off.add(key);
        packOff.add(key);
      }
    }
  }

  commit(
    { ...current, off: [...off], packOff: [...packOff], frozenSince: { ...current.frozenSince }, sets: { ...states } },
    current
  );

  log(`[IdleGen] Pack settings: ${changed.map((set) => `${set}=${states[set] ? "on" : "off"}`).join(", ")}.`);
}

/** Barrido único sobre las instancias cuyo tipo ha cambiado de estado. */
function freezeThaw(next: ToggleConfig, previous: ToggleConfig, now: number): void {
  const toFreeze = new Set<string>();
  const toThaw = new Set<string>();
  const prevOff = new Set(previous.off);
  const nextOff = new Set(next.off);

  for (const key of Object.keys(GENERATORS)) {
    const was = !prevOff.has(key);
    const is = !nextOff.has(key);
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
