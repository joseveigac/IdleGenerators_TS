// Builds the "Idle Generators: Recipe Overrides" template behavior pack: a copy of every generator
// recipe with the SAME identifiers. Placed above Idle Generators in the world's pack list, its
// recipes replace ours. Fixed UUIDs so users can update the template in place.
import { cpSync, mkdirSync, rmSync, writeFileSync, readdirSync, copyFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "behavior_packs", "ghozix_idlegen", "recipes", "crafting");
const out = join(root, "dist", "recipe-template", "idlegen_recipe_overrides");
rmSync(join(root, "dist", "recipe-template"), { recursive: true, force: true });
mkdirSync(join(out, "recipes"), { recursive: true });
cpSync(src, join(out, "recipes"), { recursive: true });
copyFileSync(join(root, "templates", "recipe-overrides", "README.md"), join(out, "README.md"));
copyFileSync(join(root, "behavior_packs", "ghozix_idlegen", "pack_icon.png"), join(out, "pack_icon.png"));
const manifest = {
  format_version: 2,
  header: {
    name: "Idle Generators: Recipe Overrides",
    description: "Edit these recipes, then place this pack ABOVE Idle Generators.",
    uuid: "3f6c2a8e-5b1d-4c7e-9a42-7d1e0b6f8c31",
    version: [1, 5, 0],
    min_engine_version: [1, 26, 50],
  },
  modules: [{ type: "data", uuid: "8b2e4d17-0c9a-4f3b-a6e5-2c7d91f04b58", version: [1, 5, 0] }],
  metadata: { authors: ["Ghozix"], product_type: "addon" },
};
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
mkdirSync(join(root, "dist", "packages"), { recursive: true });
const pack = join(root, "dist", "packages", "idlegen_recipe_overrides.mcpack");
rmSync(pack, { force: true });
execFileSync("powershell", ["-NoProfile", "-Command",
  `Compress-Archive -Path '${out}\\*' -DestinationPath '${pack}.zip' -Force; Move-Item -Force '${pack}.zip' '${pack}'`]);
console.log(`template: ${readdirSync(join(out, "recipes")).length} recipes -> ${pack}`);
