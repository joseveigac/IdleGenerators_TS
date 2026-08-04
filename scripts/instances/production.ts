/**
 * IdleGen - Production
 *
 * Única autoridad sobre la contabilidad de producción de un generador.
 * La producción es perezosa: no hay bucle de producción por tick, el tiempo real
 * transcurrido se convierte en items al consultarlo.
 *
 * INVARIANTE: `lastInteraction` solo avanza por ciclos COMPLETOS consumidos,
 * nunca a `now` — así no se pierde el progreso sub-ciclo. Todo camino que toque
 * el buffer (retirada a mano, volcado automático, congelado) pasa por aquí.
 */

import type { GeneratorData } from "../components/generator";
import type { GeneratorType } from "../definitions/generator_definitions";

interface ProductionSnapshot {
  /** Items retirables ahora mismo (buffer + ciclos pendientes, limitado por `cap`). */
  amount: number;
  /** Progreso hacia el siguiente item, 0-100. Siempre 0 si está desactivado. */
  progress: number;
}

/** Ciclos completos producidos desde la última interacción. 0 si está desactivado. */
function pendingCycles(data: GeneratorData, def: GeneratorType, now: number, enabled: boolean): number {
  if (!enabled) return 0;
  const intervalMs = def.interval * 1000;
  return Math.max(0, Math.floor((now - data.lastInteraction) / intervalMs));
}

/** Lectura sin efectos secundarios (HUD, informes). */
export function peek(data: GeneratorData, def: GeneratorType, now: number, enabled: boolean): ProductionSnapshot {
  const intervalMs = def.interval * 1000;
  const amount = Math.min(data.storedAmount + pendingCycles(data, def, now, enabled), def.cap);
  const progress = enabled
    ? Math.floor(((Math.max(0, now - data.lastInteraction) % intervalMs) / intervalMs) * 100)
    : 0;

  return { amount, progress };
}

/**
 * Consolida los ciclos pendientes en el buffer y devuelve cuánto hay disponible.
 * Muta `data`. Un generador desactivado no acumula nada y conserva su timestamp:
 * el tiempo congelado se descuenta al reactivarlo (ver config/toggles.ts).
 *
 * Es idempotente respecto al timestamp: si el llamante no persiste el resultado,
 * el siguiente cálculo llega al mismo valor.
 */
export function settle(data: GeneratorData, def: GeneratorType, now: number, enabled: boolean): number {
  const cycles = pendingCycles(data, def, now, enabled);
  if (cycles > 0) {
    data.lastInteraction += cycles * def.interval * 1000;
    data.storedAmount = Math.min(data.storedAmount + cycles, def.cap);
  }

  return data.storedAmount;
}
