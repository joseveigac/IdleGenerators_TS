/**
 * IdleGen - Config Form
 *
 * Índice con un botón por pack (icono + activos en color) y una página por pack:
 * una acción rápida para el pack entero, un interruptor por generador con su
 * producción en el tooltip, y un solo Guardar. Guardar o cerrar una página
 * devuelve al índice; salir del todo es cerrar el índice.
 *
 * Los iconos son `textures/ui/set_<pack>.png`: renders del cardgen del repo Java
 * (publishing/media/cardgen/card.py, `generator_render`), un generador
 * representativo por pack.
 *
 * Las páginas se generan recorriendo el catálogo, así que un generador nuevo
 * aparece aquí sin tocar este fichero, y los nombres reutilizan las claves
 * `tile.*.name` que ya existen.
 *
 * ⚠️ La respuesta de un ModalForm es POSICIONAL y los elementos no interactivos
 * (label/divider) pueden ocupar hueco con `undefined`. Por eso la lectura va por
 * tipos: el único number es la acción rápida y los booleanos son los
 * interruptores en el orden del catálogo: el emparejamiento no puede descuadrarse.
 */

import { Player, system } from "@minecraft/server";
import { ActionFormData, FormCancelationReason, ModalFormData } from "@minecraft/server-ui";

import { GENERATORS, GENERATOR_SETS, GeneratorCategory, generatorKeysOf } from "../definitions/generator_definitions";
import { applyToggles, isEnabled } from "../config/toggles";

/** Opciones de la acción rápida, en el orden del desplegable. */
const BULK_OPTIONS = ["keep", "all_on", "all_off"] as const;

/** Activos de un pack, en color según estado: verde todos, rojo ninguno, amarillo a medias. */
function activeBadge(keys: string[]): string {
  const enabled = keys.filter(isEnabled).length;
  const color = enabled === keys.length ? "§a" : enabled === 0 ? "§c" : "§e";
  return `${color}§l${enabled}`;
}

/** Índice: elegir pack. */
export function openConfigForm(player: Player): void {
  const form = new ActionFormData()
    .title({ translate: "idlegen.config.title" })
    .body({ translate: "idlegen.config.pick_set" });

  for (const set of GENERATOR_SETS) {
    form.button(
      {
        rawtext: [
          { text: "§l" },
          { translate: `idlegen.config.set.${set}` },
          { text: `§r\n${activeBadge(generatorKeysOf(set))}` },
        ],
      },
      `textures/ui/set_${set}`
    );
  }

  form
    .show(player)
    .then((response) => {
      if (response.canceled || response.selection === undefined) return;

      const set = GENERATOR_SETS[response.selection];
      if (set) openSetPage(player, set);
    })
    .catch((error: unknown) => console.error("[IdleGen] config index error:", String(error)));
}

/** Página de un pack: acción rápida + un interruptor por generador. */
function openSetPage(player: Player, set: GeneratorCategory): void {
  const keys = generatorKeysOf(set);
  const enabled = keys.filter(isEnabled).length;

  const form = new ModalFormData()
    .title({ rawtext: [{ text: "§lIdle Generators§r — " }, { translate: `idlegen.config.set.${set}` }] })
    .label({ rawtext: [{ text: "§7" }, { translate: "idlegen.config.hint" }] })
    .dropdown(
      { translate: "idlegen.config.bulk" },
      BULK_OPTIONS.map((option) => ({ translate: `idlegen.config.bulk.${option}` })),
      {
        defaultValueIndex: 0,
        tooltip: { translate: "idlegen.config.active", with: [String(enabled), String(keys.length)] },
      }
    )
    .divider();

  for (const key of keys) {
    const def = GENERATORS[key];
    form.toggle(
      { translate: `tile.${def.id}.name` },
      {
        defaultValue: isEnabled(key),
        tooltip: { translate: "idlegen.config.tooltip", with: [String(def.interval), String(def.cap)] },
      }
    );
  }

  form.submitButton({ translate: "idlegen.config.save" });

  form
    .show(player)
    .then((response) => {
      if (response.canceled || !response.formValues) {
        // Esc/X en una página es "atrás", no "salir": se vuelve al índice.
        if (response.cancelationReason === FormCancelationReason.UserClosed) {
          system.run(() => openConfigForm(player));
        }
        return;
      }

      const bulkIndex = response.formValues.find((value): value is number => typeof value === "number") ?? 0;
      const mode = BULK_OPTIONS[bulkIndex] ?? "keep";
      const answers = response.formValues.filter((value): value is boolean => typeof value === "boolean");
      if (mode === "keep" && answers.length !== keys.length) {
        console.error(`[IdleGen] config page mismatch: ${answers.length} values for ${keys.length} generators`);
        return;
      }

      const states: Record<string, boolean> = {};
      keys.forEach((key, index) => (states[key] = mode === "keep" ? answers[index] : mode === "all_on"));

      applyToggles(states);
      player.sendMessage({ translate: "idlegen.config.saved" });

      system.run(() => openConfigForm(player));
    })
    .catch((error: unknown) => console.error("[IdleGen] config page error:", String(error)));
}
