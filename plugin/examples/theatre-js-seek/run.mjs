import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import theatre from "@theatre/core";

const { getProject } = theatre;

const state = JSON.parse(readFileSync("state.json", "utf8"));
const project = getProject("Fixture Project", { state });
await project.ready;
const sheet = project.sheet("Motion");
const marker = sheet.object("Marker", { x: 0 });
const seekTimes = [2, 1, 0, 1.5, 0.5, 1];
const values = [];
for (const time of seekTimes) {
  sheet.sequence.position = time;
  values.push({ time, x: Number(marker.value.x) });
}
const at = (time) => values.find((entry) => entry.time === time)?.x;
if (Math.abs(at(0) - 0) > 0.001) throw new Error(`x(0)=${at(0)}, expected 0`);
if (Math.abs(at(2) - 10) > 0.001) throw new Error(`x(2)=${at(2)}, expected 10`);
if (Math.abs(at(1) - 5) > 0.001) throw new Error(`x(1)=${at(1)}, expected 5`);
if (!(0 < at(0.5) && at(0.5) < 5 && 5 < at(1.5) && at(1.5) < 10)) {
  throw new Error(`intermediate values are not monotonic: ${JSON.stringify(values)}`);
}
const metrics = {
  theatre_core_version: "0.7.2",
  seek_order: seekTimes,
  values,
  midpoint_return: at(1),
};
const expectedFile = "expected/metrics.json";
const serialized = `${JSON.stringify(metrics, null, 2)}\n`;
if (process.argv[2] === "--record") {
  mkdirSync("expected", { recursive: true });
  writeFileSync(expectedFile, serialized);
} else if (readFileSync(expectedFile, "utf8") !== serialized) {
  throw new Error(`${expectedFile} differs; observed:\n${serialized}`);
}
console.log(`OK Theatre.js 0.7.2: keyed x(0)=${at(0)}, x(2)=${at(2)}; interpolated x(1)=${at(1)}; shuffled seeks match`);
