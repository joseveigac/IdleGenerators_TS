// BP/scripts/systems/generatorDisplay.ts
import { world, system, RawMessage } from "@minecraft/server";
import { getGeneratorTypeFromBlockId, GeneratorTypesMap } from "../definitions/generator_definitions";
import { getPlacedAtPos, makePosKeyFromBlock } from "../instances/placed";
import { peek } from "../instances/production";
import { isEnabled } from "../config/toggles";
import { GeneratorData } from "../components/generator";
import { PlacedInstance } from "../types/common";
import { getWorldData } from "../storage/storage";
import { WORLD_KEYS } from "../storage/storage_keys";

export class GeneratorDisplay {
  static initialize(): void {
    system.runInterval(() => {
      for (const player of world.getPlayers()) {
        const blockHit = player.getBlockFromViewDirection({ maxDistance: 6 });
        if (!blockHit) {
          player.onScreenDisplay.setActionBar("");
          continue;
        }

        const genType = getGeneratorTypeFromBlockId(blockHit.block.typeId);
        if (!genType) {
          player.onScreenDisplay.setActionBar("");
          continue;
        }

        const instance = getPlacedAtPos(makePosKeyFromBlock(blockHit.block)) as PlacedInstance<GeneratorData> | null;
        if (!instance || instance.type !== "generator") {
          player.onScreenDisplay.setActionBar("");
          continue;
        }

        const gen = getWorldData<GeneratorTypesMap>(WORLD_KEYS.CATALOG.GENERATORS)?.[genType];
        if (!gen) continue;

        const enabled = isEnabled(genType, gen.category);
        const { amount, progress } = peek(instance.data, gen, Date.now(), enabled);

        const status: RawMessage[] = enabled
          ? [{ text: `§a${progress}%` }]
          : [{ text: "§c" }, { translate: "idlegen.hud.off" }];

        // rawtext para que el nombre salga en el idioma del jugador (claves tile.*.name).
        player.onScreenDisplay.setActionBar({
          rawtext: [
            { text: `${gen.glyph} §e` },
            { translate: `tile.${gen.id}.name` },
            { text: ` §7| §f${amount}§7/§f${gen.cap} §7| ` },
            ...status,
          ],
        });
      }
    }, 5); // 5 ticks = 0.25s (más responsive)
  }
}
