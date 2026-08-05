/**
 * IdleGen - Pack Settings
 *
 * Interruptor por pack de generadores, editable desde la pantalla de Ajustes
 * del propio addon en la lista de Paquetes de comportamiento del mundo. Es el
 * único punto de configuración accesible ANTES de entrar al mundo.
 *
 * NO es una capa por encima de los interruptores por generador: al cargar el mundo
 * apaga o enciende los suyos de golpe, y solo si su valor ha cambiado desde la carga
 * anterior (el flanco vive en [config/toggles.ts]). Reencender un pack devuelve solo
 * lo que él apagó, así que nunca pisa lo elegido a mano, y el menú en juego manda
 * siempre: puede encender un generador cuyo pack esté apagado aquí.
 *
 * Requiere @minecraft/server 2.8.0 (motor 1.26.30), donde `getPackSettings()`
 * es estable y no exige experimentos. Mientras nadie toque los ajustes devuelve
 * los `default` declarados en el manifest.
 *
 * LO QUE DEVUELVE ES UNA FOTO TOMADA AL CARGAR EL MUNDO. Medido en BDS 1.26.36:
 * con el mundo cargado se reescribió `world_behavior_pack_settings.json` (donde
 * el juego guarda estos ajustes, dentro de la carpeta del mundo) y la API siguió
 * devolviendo los valores viejos indefinidamente; al reiniciar aparecieron los
 * nuevos. Por eso se lee una sola vez, en `worldLoad`: sondear no sirve de nada,
 * porque el valor no puede cambiar dentro de una misma sesión. Cambiar un ajuste
 * desde el menú de pausa exige recargar el mundo para que surta efecto, y así se
 * le dice al jugador en el texto de la propia pantalla de ajustes. El evento que
 * avisaría en caliente (`world.afterEvents.packSettingChange`) solo existe en
 * beta, y habilitar las Beta APIs apagaría los logros.
 *
 * Se publica una sola edición, la de 1.26.30+. La comprobación de
 * `readPackSettings()` no es defensiva porque sí: es lo que permitiría sacar una
 * edición para motores antiguos si alguien la pide, sin tocar el código — allí la
 * API no existe, se leen todos los packs como encendidos y el addon se comporta
 * como antes. Lo único que habría que cambiar es el manifest.
 */

import { world } from "@minecraft/server";

import { GENERATOR_SETS, allSetsOn } from "../definitions/generator_definitions";

import type { SetStates } from "../definitions/generator_definitions";

/** Los nombres declarados en `settings` del manifest van con este prefijo. */
const SETTING_PREFIX = "ghozix_idlegen:";

/**
 * Estado actual de los ajustes del pack. Solo un `false` explícito apaga: un
 * ajuste que falte (manifest antiguo, clave renombrada) deja el pack encendido.
 */
export function readPackSettings(): SetStates {
  // En un motor anterior a 1.26.30 la API no existe: no hay ajustes que leer y
  // el addon se comporta como siempre, con todos los packs encendidos.
  if (typeof world.getPackSettings !== "function") return allSetsOn();

  const raw = world.getPackSettings();
  const states = {} as SetStates;

  for (const set of GENERATOR_SETS) {
    states[set] = raw[`${SETTING_PREFIX}${set}`] !== false;
  }

  return states;
}
