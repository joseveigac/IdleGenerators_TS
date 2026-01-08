import type { StartupEvent } from "@minecraft/server";
import { Generator } from "./components/generator";

// ============================================================================
// REGISTER COMPONENTS
// Register all custom components used in the addon
// ============================================================================
export function registerComponents(ev: StartupEvent) {
  registerBlockComponents(ev);
  registerItemCustomComponents(ev);
}
/*
 * Register Block Components
 */
function registerBlockComponents(ev: StartupEvent) {
  ev.blockComponentRegistry.registerCustomComponent("idleoregen:generator", new Generator());
}
/*
 * Register Item Components
 */
function registerItemCustomComponents(_ev: StartupEvent) {
  // Bedrock API: si en tu versión existe itemComponentRegistry, irá aquí.
  // ev.itemComponentRegistry.registerCustomComponent("idleoregen:my_item", new MyItemComponent());
}
