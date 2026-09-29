# Idle Generators: Recipe Overrides

## English

Change the crafting recipe of any generator for your world or server. You need a PC (or any device where you can unzip files and edit text).

1. **Download** `idlegen_recipe_overrides.mcpack` from the Idle Generators page (Additional Files).
2. **Unzip it.** Rename `.mcpack` to `.zip` and extract it into a folder.
3. **Find the recipe.** Open `recipes/crafting/`. There is one file per generator, for example `iron_generator.json`.
4. **Edit it** with any text editor (Notepad works):
   - `pattern` is the 3×3 crafting grid, one line per row. Each letter is a slot and a space is an empty slot.
   - `key` says which item each letter is. Change the item id, for example `"minecraft:iron_block"` to `"minecraft:iron_ingot"`.
   - Do not change `identifier` or `result`.
5. **Delete the files you do not want to change.** Those generators keep their normal recipe.
6. **Zip it again.** Select everything inside the folder (`manifest.json` must be at the top level, not inside a subfolder), compress it to `.zip` and rename it to `.mcpack`.
7. **Import it** by double-clicking the `.mcpack`.
8. **Turn it on in your world:** Edit World → Behavior Packs → activate **Idle Generators: Recipe Overrides** and move it **above** Idle Generators.

Example: `"key": { "G": { "item": "minecraft:glass" } }` means every `G` in the pattern is a glass block. Item ids are listed on the Minecraft Wiki ("Bedrock Edition data values").

**Editing again later?** Minecraft ignores a pack it already has with the same version. Delete the old one first (Settings → Storage → Behavior Packs), then import the new one.

Works on Realms (upload it as another behavior pack). Our updates never touch this pack, so your recipes survive them.

## Español

Cambia la receta de cualquier generador en tu mundo o servidor. Necesitas un PC (o cualquier dispositivo donde puedas descomprimir archivos y editar texto).

1. **Descarga** `idlegen_recipe_overrides.mcpack` desde la página de Idle Generators (Additional Files).
2. **Descomprímelo.** Cambia la extensión `.mcpack` por `.zip` y extráelo en una carpeta.
3. **Busca la receta.** Abre `recipes/crafting/`. Hay un archivo por generador, por ejemplo `iron_generator.json`.
4. **Edítalo** con cualquier editor de texto (el Bloc de notas sirve):
   - `pattern` es la cuadrícula de 3×3 de la mesa de crafteo, una línea por fila. Cada letra es una casilla y un espacio es una casilla vacía.
   - `key` dice qué objeto es cada letra. Cambia el id del objeto, por ejemplo `"minecraft:iron_block"` por `"minecraft:iron_ingot"`.
   - No cambies `identifier` ni `result`.
5. **Borra los archivos que no quieras cambiar.** Esos generadores mantienen su receta normal.
6. **Vuelve a comprimirlo.** Selecciona todo lo que hay dentro de la carpeta (`manifest.json` tiene que quedar en la raíz, no dentro de otra carpeta), comprímelo en `.zip` y cámbiale la extensión a `.mcpack`.
7. **Impórtalo** con doble clic en el `.mcpack`.
8. **Actívalo en tu mundo:** Editar mundo → Paquetes de comportamiento → activa **Idle Generators: Recipe Overrides** y súbelo **por encima** de Idle Generators.

Ejemplo: `"key": { "G": { "item": "minecraft:glass" } }` significa que cada `G` del patrón es un bloque de cristal. Los ids de los objetos están en la Minecraft Wiki ("Bedrock Edition data values").

**¿Vas a editarlo otra vez más adelante?** Minecraft ignora un pack que ya tiene con la misma versión. Borra primero el antiguo (Ajustes → Almacenamiento → Paquetes de comportamiento) y después importa el nuevo.

Funciona en Realms (súbelo como otro paquete de comportamiento). Nuestras actualizaciones nunca tocan este pack, así que tus recetas se conservan.
