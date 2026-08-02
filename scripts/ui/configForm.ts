/**
 * IdleGen - Config Form
 *
 * Índice con un botón por pack de generadores; cada página es un formulario con
 * un interruptor por generador y un solo Guardar. Al guardar se vuelve al índice.
 *
 * Las páginas se generan recorriendo el catálogo, así que un generador nuevo
 * aparece aquí sin tocar este fichero, y los nombres reutilizan las claves
 * `tile.*.name` que ya existen.
 *
 * ⚠️ La respuesta de un ModalForm es POSICIONAL y los elementos no interactivos
 * (header/divider/label) pueden ocupar hueco con `undefined`. Por eso la página
 * solo lleva interruptores y la lectura filtra por booleanos: el emparejamiento
 * con los generadores no puede descuadrarse.
 */

import { Player, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

import { GENERATORS, GENERATOR_SETS, GeneratorCategory, generatorKeysOf } from "../definitions/generator_definitions";
import { applyToggles, getToggles, isEnabled } from "../config/toggles";

/** Índice: elegir pack. */
export function openConfigForm(player: Player): void {
  const form = new ActionFormData()
    .title({ translate: "idlegen.config.title" })
    .body({ translate: "idlegen.config.pick_set" });

  for (const set of GENERATOR_SETS) {
    form.button({ translate: `idlegen.config.set.${set}` });
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

/** Página de un pack: un interruptor por generador. */
function openSetPage(player: Player, set: GeneratorCategory): void {
  const cfg = getToggles();
  const keys = generatorKeysOf(set);

  const form = new ModalFormData().title({ translate: `idlegen.config.set.${set}` });

  for (const key of keys) {
    form.toggle({ translate: `tile.${GENERATORS[key].id}.name` }, { defaultValue: isEnabled(key, cfg) });
  }

  form.submitButton({ translate: "idlegen.config.save" });

  form
    .show(player)
    .then((response) => {
      if (response.canceled || !response.formValues) return; // Esc = salir sin guardar

      const answers = response.formValues.filter((value) => typeof value === "boolean") as boolean[];
      if (answers.length !== keys.length) {
        console.error(`[IdleGen] config page mismatch: ${answers.length} values for ${keys.length} generators`);
        return;
      }

      const states: Record<string, boolean> = {};
      keys.forEach((key, index) => (states[key] = answers[index]));

      applyToggles(states);
      player.sendMessage({ translate: "idlegen.config.saved" });

      system.run(() => openConfigForm(player));
    })
    .catch((error: unknown) => console.error("[IdleGen] config page error:", String(error)));
}
