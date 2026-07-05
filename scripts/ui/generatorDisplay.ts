// BP/scripts/systems/generatorDisplay.ts
import { world, system } from "@minecraft/server";
import { getGeneratorTypeFromBlockId, GeneratorTypesMap } from "../definitions/generator_definitions";
import { getPlacedAtPos, makePosKeyFromBlock } from "../instances/placed";
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

        const elapsed = Date.now() - instance.data.lastInteraction;
        const intervalMs = gen.interval * 1000;
        const amount = Math.min(instance.data.storedAmount + Math.floor(elapsed / intervalMs), gen.cap);
        const progress = Math.floor(((elapsed % intervalMs) / intervalMs) * 100);

        player.onScreenDisplay.setActionBar(
          `${gen.glyph} §e${gen.name} §7| §f${amount}§7/§f${gen.cap} §7| §a${progress}%`
        );
      }
    }, 5); // 5 ticks = 0.25s (más responsive)
  }
}
