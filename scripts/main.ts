import { world, system } from "@minecraft/server";

import { log } from "./utils/logger";

import * as Storage from "./storage/storage";
import { ADDON_VERSION } from "./storage/storage_keys";
import { registerComponents } from "./register_components";

// import { CobblestoneGenerator } from "./generators/cobblestone_generator";
// import { COMPONENT_IDS, PROPERTY_IDS } from "./config/components";
import { GeneratorDisplay } from "./ui/generatorDisplay";

/**
 * Entry Point del addon
 * Responsabilidad: SOLO registro de componentes
 */
system.beforeEvents.startup.subscribe((startupEvent) => {
  log("[IdleGen] Starting addon...");

  // Register Custom Components (API correcta)
  registerComponents(startupEvent);
});

// Ejecutado una vez al cargar el mundo
// Versión de la "base de datos" del addon
world.afterEvents.worldLoad.subscribe(() => {
  log("[IdleGen] Loaded world. Version ghozix_idlegen:", ADDON_VERSION);

  // Inicializar DynamicProperties del addon
  // Storage.initDatabase();
  Storage.initDatabaseAutoUpdate();
  GeneratorDisplay.initialize();
});

/**
 * ScriptEvents
 */
// system.afterEvents.scriptEventReceive.subscribe((event) => {
//   if (event.id !== "ghozix_idlegen:generator_trigger") return;

//   log("[GeneratorCore] Trigger recibido desde entidad:", event.sourceEntity?.typeId);
// });
