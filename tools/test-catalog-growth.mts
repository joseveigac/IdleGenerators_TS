// Test of scripts/config/catalog_growth.ts (pure, no Minecraft imports). Run: node tools/test-catalog-growth.mts
import assert from "node:assert/strict";
import { adoptNewKeys, knownOrLegacy, ADDED_IN_1_5_0 } from "../scripts/config/catalog_growth.ts";

const catalog = {
  oak_log: { category: "woods" },
  poplar_log: { category: "woods" },
  netherrack: { category: "nether" },
  coal: { category: "ores" },
};
const setsWoodsOff = { ores: true, woods: false, stones: true, colors: true, nature: true, nether: true };

// A new wood key in a world whose Woods pack is off starts off and belongs to the pack.
{
  const off = new Set<string>(["oak_log"]);
  const packOff = new Set<string>(["oak_log"]);
  const fresh = adoptNewKeys(catalog, ["oak_log", "coal"], setsWoodsOff, off, packOff);
  assert.deepEqual(fresh.sort(), ["netherrack", "poplar_log"]);
  assert.ok(off.has("poplar_log") && packOff.has("poplar_log"), "poplar follows the Woods pack switch");
  assert.ok(!off.has("netherrack"), "a set that is on leaves its new keys on");
}

// Known keys are never touched, even if their pack is off (the player owns them).
{
  const off = new Set<string>();
  const packOff = new Set<string>();
  const fresh = adoptNewKeys(catalog, Object.keys(catalog), setsWoodsOff, off, packOff);
  assert.deepEqual(fresh, []);
  assert.equal(off.size, 0);
}

// A blob saved before `known` existed knows everything except the v1.5.0 additions.
{
  const all = ["oak_log", "poplar_log", "netherrack", "coal"];
  const known = knownOrLegacy(undefined, all);
  assert.ok(known.includes("oak_log") && known.includes("coal"));
  assert.ok(!known.includes("poplar_log") && !known.includes("netherrack"));
  assert.deepEqual(knownOrLegacy(["coal"], all), ["coal"], "a stored list wins");
  assert.equal(ADDED_IN_1_5_0.length, 13);
}

console.log("catalog_growth: 3/3 pass");
