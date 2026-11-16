import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const m = JSON.parse(await readFile(new URL("./output/metrics.json", import.meta.url), "utf8"));
assert.equal(m.package_version, "5.0.0-release.1");
assert.equal(m.opencv_core_version, "5.0.0");
assert.equal(m.runtime, "Node WASM");
assert.deepEqual(m.input, { rows: 10, cols: 12, foreground: 29 });
assert.equal(m.threshold.threshold, 127);
assert.equal(m.threshold.max_value, 255);
assert.equal(m.threshold.foreground, 29);
assert.deepEqual(m.contours, [
  { x: 1, y: 1, width: 3, height: 3, area: 4 },
  { x: 7, y: 2, width: 4, height: 5, area: 12 },
]);
