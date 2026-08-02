import { CommandPermissionLevel, CustomCommandStatus, Player, PlayerPermissionLevel, system } from "@minecraft/server";
import type { StartupEvent } from "@minecraft/server";

import { Generator } from "./components/generator";
import { openConfigForm } from "./ui/configForm";

// ============================================================================
// REGISTER COMPONENTS
// Register all custom components used in the addon
// ============================================================================
export function registerComponents(ev: StartupEvent) {
  registerBlockComponents(ev);
  registerItemCustomComponents(ev);
  registerCommands(ev);
}
/*
 * Register Block Components
 */
function registerBlockComponents(ev: StartupEvent) {
  ev.blockComponentRegistry.registerCustomComponent("ghozix_idlegen:generator", new Generator());
}
/*
 * Register Item Components
 */
function registerItemCustomComponents(_ev: StartupEvent) {
  // Bedrock API: si en tu versión existe itemComponentRegistry, irá aquí.
  // ev.itemComponentRegistry.registerCustomComponent("ghozix_idlegen:my_item", new MyItemComponent());
}
/*
 * Register Custom Commands
 * `cheatsRequired: false` es obligatorio: cualquier comando que exija trucos
 * desactivaría los logros del mundo. El permiso se comprueba en el handler.
 */
function registerCommands(ev: StartupEvent) {
  ev.customCommandRegistry.registerCommand(
    {
      name: "idleoregen:config",
      description: "Open the Idle Generators settings menu",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const source = origin.sourceEntity;
      if (!source || source.typeId !== "minecraft:player") {
        return { status: CustomCommandStatus.Failure, message: "Only players can use this command." };
      }

      const player = source as Player;
      if (player.playerPermissionLevel !== PlayerPermissionLevel.Operator) {
        player.sendMessage({ translate: "idlegen.config.no_permission" });
        return { status: CustomCommandStatus.Failure };
      }

      // Los formularios necesitan contexto de escritura.
      system.run(() => openConfigForm(player));
      return { status: CustomCommandStatus.Success };
    }
  );
}
