import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Color from "colorjs.io";

const exampleDirectory = path.dirname(fileURLToPath(import.meta.url));
const ROUND_TRIP_TOLERANCE = 1e-6;
const GAMUT_RANGE_TOLERANCE = 1e-9;
const GAMUT_LIGHTNESS_TOLERANCE = 0.02;
const DELTA_E_TOLERANCE = 1e-4;

const installedVersion = JSON.parse(
  fs.readFileSync(path.join(exampleDirectory, "node_modules/colorjs.io/package.json"), "utf8"),
).version;
assert.equal(installedVersion, "0.7.1", `unexpected colorjs.io version ${installedVersion}`);

const nodeMajor = Number(process.versions.node.split(".")[0]);
assert.ok(nodeMajor >= 22, `Node ${process.versions.node} is older than the planned major 22`);

const ROUND_TRIP_HEX = [
  "#000000", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff",
  "#808080", "#1e90ff", "#ff8c00", "#2f4f4f", "#7b3fa0", "#abcdef", "#123456", "#f5deb3",
];

function hexToSrgbChannels(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255);
}

const roundTripRows = ROUND_TRIP_HEX.map((hex) => {
  const original = hexToSrgbChannels(hex);
  const viaOklch = new Color("srgb", original).to("oklch");
  const back = viaOklch.to("srgb").coords;
  const maxAbsoluteError = Math.max(...original.map((channel, index) => Math.abs(back[index] - channel)));
  assert.ok(
    back.every(Number.isFinite) && Number.isFinite(maxAbsoluteError),
    `round trip for ${hex} produced non-finite values ${JSON.stringify(back)}`,
  );
  assert.ok(maxAbsoluteError < ROUND_TRIP_TOLERANCE, `round trip for ${hex} off by ${maxAbsoluteError}`);
  // Achromatic colours carry a missing hue (CSS "none", serialised as null), which is kept as null.
  const oklchForRecord = viaOklch.coords.map((coord) => (coord === null ? null : Number(coord.toPrecision(12))));
  return { hex, oklch: oklchForRecord, max_abs_error: maxAbsoluteError };
});

const OUT_OF_GAMUT_OKLCH = [
  [0.70, 0.40, 150],
  [0.60, 0.35, 30],
  [0.90, 0.30, 110],
  [0.50, 0.30, 280],
];

const gamutRows = OUT_OF_GAMUT_OKLCH.map((coords) => {
  const source = new Color("oklch", coords);
  assert.equal(source.inGamut("srgb"), false, `oklch(${coords.join(" ")}) should be outside sRGB before mapping`);
  const mapped = source.toGamut({ space: "srgb", method: "css" });
  const mappedSrgb = mapped.to("srgb").coords;
  for (const channel of mappedSrgb) {
    assert.ok(
      channel >= -GAMUT_RANGE_TOLERANCE && channel <= 1 + GAMUT_RANGE_TOLERANCE,
      `mapped channel ${channel} outside [0,1] for oklch(${coords.join(" ")})`,
    );
  }
  assert.equal(mapped.inGamut("srgb"), true, `mapped oklch(${coords.join(" ")}) is not in sRGB`);
  const lightnessShift = Math.abs(mapped.to("oklch").coords[0] - coords[0]);
  assert.ok(lightnessShift <= GAMUT_LIGHTNESS_TOLERANCE, `lightness moved ${lightnessShift} for oklch(${coords.join(" ")})`);
  return {
    source_oklch: coords,
    mapped_srgb: mappedSrgb.map((channel) => Number(channel.toPrecision(12))),
    lightness_shift: lightnessShift,
  };
});

// Sharma, Wu and Dalal (2005), supplementary CIE technical report pairs.
// Values as transcribed in delta-e@0.0.8 tests/main.js; see README sourcing note.
const SHARMA_PAIRS = [
  { number: 1, lab1: [50.0, 2.6772, -79.7751], lab2: [50.0, 0.0, -82.7485], published: 2.0425 },
  { number: 2, lab1: [50.0, 3.1571, -77.2803], lab2: [50.0, 0.0, -82.7485], published: 2.8615 },
  { number: 7, lab1: [50.0, 0.0, 0.0], lab2: [50.0, -1.0, 2.0], published: 2.3669 },
  { number: 9, lab1: [50.0, 2.49, -0.001], lab2: [50.0, -2.49, 0.0009], published: 7.1792 },
  { number: 17, lab1: [50.0, 2.5, 0.0], lab2: [73.0, 25.0, -18.0], published: 27.1492 },
  { number: 25, lab1: [60.2574, -34.0099, 36.2677], lab2: [60.4626, -34.1751, 39.4387], published: 1.2644 },
  { number: 26, lab1: [63.0109, -31.0961, -5.8663], lab2: [62.8187, -29.7946, -4.0864], published: 1.263 },
  { number: 28, lab1: [35.0831, -44.1164, 3.7933], lab2: [35.0232, -40.0716, 1.5901], published: 1.8645 },
];

const deltaERows = SHARMA_PAIRS.map((pair) => {
  const computed = Color.deltaE(new Color("lab", pair.lab1), new Color("lab", pair.lab2), { method: "2000" });
  const absoluteDifference = Math.abs(computed - pair.published);
  assert.ok(
    absoluteDifference < DELTA_E_TOLERANCE,
    `Sharma pair #${pair.number}: computed ${computed} vs published ${pair.published}`,
  );
  return {
    pair: pair.number,
    computed: Number(computed.toPrecision(12)),
    published: pair.published,
    absolute_difference: absoluteDifference,
  };
});

const result = {
  colorjs_version: installedVersion,
  node_version: process.versions.node,
  tolerances: {
    round_trip: ROUND_TRIP_TOLERANCE,
    gamut_range: GAMUT_RANGE_TOLERANCE,
    gamut_lightness: GAMUT_LIGHTNESS_TOLERANCE,
    delta_e_2000: DELTA_E_TOLERANCE,
  },
  round_trip: roundTripRows,
  gamut_mapping: gamutRows,
  delta_e_2000: deltaERows,
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
