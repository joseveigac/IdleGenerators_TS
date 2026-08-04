/**
 * IdleGen - Visual Entity
 *
 * La entidad animada que se ve en lugar del bloque invisible del generador.
 * Convención compartida: se etiqueta `io:gen:<posKey>` para poder localizarla
 * después. La usan la colocación, la rotura y la limpieza de huérfanos del
 * volcado automático.
 */

import type { Dimension, Vector3 } from "@minecraft/server";

/** Tag que enlaza la entidad visual con su posición. */
export function visualTag(posKey: string): string {
  return `io:gen:${posKey}`;
}

/** Elimina la entidad visual asociada a una posición, si sigue ahí. */
export function removeVisualEntity(dimension: Dimension, location: Vector3, posKey: string) {
  const tag = visualTag(posKey);
  const center = {
    x: Math.floor(location.x) + 0.5,
    y: Math.floor(location.y),
    z: Math.floor(location.z) + 0.5,
  };

  for (const e of dimension.getEntities({ location: center, maxDistance: 1.2 })) {
    if (e.hasTag(tag)) e.remove();
  }
}
