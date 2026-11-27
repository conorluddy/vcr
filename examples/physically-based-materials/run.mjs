// Reads the pinned subset of api.physicallybased.info/v2/materials and checks values against physical constants.
import { readFileSync } from "node:fs";

const pinned = JSON.parse(readFileSync(new URL("./data/materials-subset.json", import.meta.url), "utf8"));
const byName = Object.fromEntries(pinned.data.map((material) => [material.name, material]));
const failures = [];
const check = (id, ok, detail) => { if (!ok) failures.push(`${id}: ${detail}`); return ok; };
const linear = (name) => byName[name].color.find((entry) => entry.colorSpace === "srgb-linear").color;
const finite = (values) => values.every(Number.isFinite);
const round = (n) => Number(n.toFixed(4));

check("header", pinned.header.license === "CC0 1.0 Universal" && pinned.header.schemaVersion === 2.2, JSON.stringify(pinned.header));

const dielectrics = { Water: [1.33, 1.34], Ice: [1.30, 1.32], Diamond: [2.41, 2.43] };
const iors = {};
for (const [name, [low, high]] of Object.entries(dielectrics)) {
  const ior = byName[name].ior;
  iors[name] = ior;
  check(`ior ${name}`, Number.isFinite(ior) && ior >= low && ior <= high, `${ior} outside [${low}, ${high}]`);
  check(`metalness ${name}`, byName[name].metalness === 0, `metalness ${byName[name].metalness}`);
}

const colours = {};
for (const name of ["Gold", "Copper", "Silver", "Aluminum", "Iron"]) {
  const rgb = linear(name);
  colours[name] = rgb;
  check(`colour parses ${name}`, rgb.length === 3 && finite(rgb), JSON.stringify(rgb));
  check(`metalness ${name}`, byName[name].metalness === 1, `metalness ${byName[name].metalness}`);
}
const [goldR, goldG, goldB] = colours.Gold;
check("gold is yellow", goldR > goldG && goldG > goldB && goldR / goldB > 2.5, `gold ${colours.Gold}`);
const [copperR, copperG, copperB] = colours.Copper;
check("copper is red-orange", copperR > copperG && copperG > copperB, `copper ${colours.Copper}`);
for (const name of ["Silver", "Aluminum"]) {
  const rgb = colours[name];
  check(`${name} is near-neutral`, Math.min(...rgb) > 0.85 && Math.max(...rgb) - Math.min(...rgb) < 0.1, `${name} ${rgb}`);
}

const goldSpaces = byName.Gold.color.map((entry) => entry.colorSpace);
check("gold has srgb-linear and acescg", goldSpaces.includes("srgb-linear") && goldSpaces.includes("acescg"), goldSpaces.join());

const result = {
  header: pinned.header,
  iors,
  linearSrgb: Object.fromEntries(Object.entries(colours).map(([name, rgb]) => [name, rgb.map(round)])),
  goldRedToBlue: round(goldR / goldB),
  goldChannelAboveOne: goldR > 1,
  failures,
};
console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 1 : 0);
