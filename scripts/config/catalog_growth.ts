/**
 * IdleGen - Catalog growth
 *
 * Una actualización puede añadir generadores a un pack que el jugador ya tenía
 * apagado en los ajustes del addon. El interruptor del pack actúa por flanco
 * ([config/toggles.ts]), así que sin esto las claves nuevas nacerían encendidas
 * aunque su pack siga apagado. Aquí se adoptan: una clave nueva sigue el estado
 * guardado de su pack y, si nace apagada, queda como propiedad del pack (packOff),
 * de modo que reencender el pack también la enciende.
 *
 * Puro (sin imports de Minecraft) para poder probarlo con node.
 */

/** Claves añadidas en v1.5.0: un blob guardado antes de `known` es anterior y no las conoce. */
export const ADDED_IN_1_5_0: readonly string[] = [
  "poplar_log",
  "crimson_stem",
  "warped_stem",
  "netherrack",
  "blackstone",
  "basalt",
  "soul_sand",
  "soul_soil",
  "magma",
  "nether_wart",
  "glowstone",
  "wither_rose",
  "nether_star",
];

/** Claves que el mundo ya conoce; sin lista guardada, todo menos lo añadido en v1.5.0. */
export function knownOrLegacy(stored: string[] | undefined, allKeys: string[]): string[] {
  if (Array.isArray(stored)) return stored;
  return allKeys.filter((key) => !ADDED_IN_1_5_0.includes(key));
}

/**
 * Apaga (en `off` y `packOff`) las claves nuevas cuyo pack está apagado en `sets`.
 * Devuelve las claves nuevas, estén apagadas o no.
 */
export function adoptNewKeys(
  catalog: Record<string, { category: string }>,
  known: readonly string[],
  sets: Record<string, boolean>,
  off: Set<string>,
  packOff: Set<string>
): string[] {
  const knownSet = new Set(known);
  const fresh = Object.keys(catalog).filter((key) => !knownSet.has(key));

  for (const key of fresh) {
    if (sets[catalog[key].category] === false && !off.has(key)) {
      off.add(key);
      packOff.add(key);
    }
  }

  return fresh;
}
