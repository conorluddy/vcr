import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import Meyda from "meyda";

const require = createRequire(import.meta.url);

const version = JSON.parse(fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "node_modules/meyda/package.json"), "utf8")).version;
assert.equal(version, "5.6.3", `unexpected Meyda version ${version}`);

const size = 512;
Meyda.bufferSize = size;
const signal = new Float32Array(size).fill(1);
const actual = Meyda.extract("rms", signal);
let windowSquareSum = 0;
for (let i = 0; i < size; i++) {
  const windowSample = Math.fround(0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1)));
  windowSquareSum += windowSample * windowSample;
}
const expected = Math.sqrt(windowSquareSum / size);
assert.ok(Math.abs(actual - expected) < 1e-7, `RMS ${actual} differs from independent Hann-window calculation ${expected}`);

const result = {
  meyda_version: version,
  feature: "rms",
  signal: { samples: size, constant_value: 1, type: "Float32Array" },
  window: "hanning (Meyda default)",
  expected_rms: expected,
  actual_rms: actual,
  absolute_error: Math.abs(actual - expected),
  input_sha256: crypto.createHash("sha256").update(Buffer.from(signal.buffer)).digest("hex"),
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
