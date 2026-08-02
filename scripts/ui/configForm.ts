/**
 * IdleGen - Config Form
 *
 * Un único formulario con todos los interruptores, generado recorriendo el
 * catálogo: cabecera por categoría, un toggle para la categoría y un desplegable
 * tri-estado por generador. Un solo Submit = una sola escritura de config = un
 * solo barrido de congelado.
 *
 * Al generarse desde `GENERATORS`, un generador nuevo aparece aquí sin tocar
 * este fichero. Los nombres reutilizan las claves `tile.*.name` que ya existen.
 */

import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

import { GENERATORS, GeneratorCategory } from "../definitions/generator_definitions";
import { applyToggles, CATEGORIES, getToggles, ToggleState } from "../config/toggles";

/** Orden de los desplegables; el índice es el valor devuelto por el formulario. */
const STATES: ToggleState[] = ["default", "on", "off"];

const STATE_LABELS = STATES.map((state) => ({ translate: `idlegen.config.state.${state}` }));

/** Descripción del control i-ésimo, para leer la respuesta sin llevar índices a mano. */
type Row = { kind: "category"; category: GeneratorCategory } | { kind: "generator"; key: string };

export function openConfigForm(player: Player): void {
  const cfg = getToggles();
  const form = new ModalFormData().title({ translate: "idlegen.config.title" });
  const rows: Row[] = [];

  for (const category of CATEGORIES) {
    form.header({ translate: `idlegen.config.category.${category}` });
    form.toggle(
      { translate: "idlegen.config.enable_category" },
      {
        defaultValue: cfg.categories[category] ?? true,
      }
    );
    rows.push({ kind: "category", category });

    for (const [key, def] of Object.entries(GENERATORS)) {
      if (def.category !== category) continue;

      form.dropdown({ translate: `tile.${def.id}.name` }, STATE_LABELS, {
        defaultValueIndex: Math.max(0, STATES.indexOf(cfg.generators[key] ?? "default")),
      });
      rows.push({ kind: "generator", key });
    }
  }

  form.submitButton({ translate: "idlegen.config.save" });

  form
    .show(player)
    .then((response) => {
      if (response.canceled || !response.formValues) return;

      const categories: Partial<Record<GeneratorCategory, boolean>> = {};
      const generators: Record<string, ToggleState> = {};

      rows.forEach((row, index) => {
        const value = response.formValues?.[index];

        if (row.kind === "category") {
          categories[row.category] = value !== false;
          return;
        }

        // Solo se guardan los overrides reales; "default" hereda la categoría.
        const state = STATES[typeof value === "number" ? value : 0] ?? "default";
        if (state !== "default") generators[row.key] = state;
      });

      applyToggles({ categories, generators });
      player.sendMessage({ translate: "idlegen.config.saved" });
    })
    .catch((error: unknown) => console.error("[IdleGen] config form error:", String(error)));
}
