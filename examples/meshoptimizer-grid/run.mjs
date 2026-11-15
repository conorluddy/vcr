import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { MeshoptSimplifier } from "meshoptimizer";

const output = new URL("./output/", import.meta.url);
await mkdir(output, { recursive: true });
await MeshoptSimplifier.ready;

const side = 5;
const positions = [];
const indices = [];
for (let y = 0; y < side; y++) {
  for (let x = 0; x < side; x++) positions.push(x / (side - 1), y / (side - 1), 0);
}
for (let y = 0; y < side - 1; y++) {
  for (let x = 0; x < side - 1; x++) {
    const a = y * side + x;
    const b = a + 1;
    const c = a + side;
    const d = c + 1;
    indices.push(a, b, c, b, d, c);
  }
}

const source = new Uint32Array(indices);
const vertices = new Float32Array(positions);
const [simplified, error] = MeshoptSimplifier.simplify(source, vertices, 3, 48, 1);
const [repeat, repeatError] = MeshoptSimplifier.simplify(source, vertices, 3, 48, 1);
const bytes = Buffer.from(simplified.buffer, simplified.byteOffset, simplified.byteLength);
const repeatedBytes = Buffer.from(repeat.buffer, repeat.byteOffset, repeat.byteLength);
const sourceTriangles = source.length / 3;
const outputTriangles = simplified.length / 3;
const metrics = {
  package: "meshoptimizer",
  source_vertices: vertices.length / 3,
  source_triangles: sourceTriangles,
  requested_indices: 48,
  output_indices: simplified.length,
  output_triangles: outputTriangles,
  reported_error: error,
  indices_in_range: [...simplified].every((index) => index < vertices.length / 3),
  repeated_indices_identical: bytes.equals(repeatedBytes),
  repeated_error_identical: error === repeatError,
  output_sha256: createHash("sha256").update(bytes).digest("hex"),
};
if (process.argv.includes("--record")) {
  await writeFile(new URL("./expected/metrics.json", import.meta.url), `${JSON.stringify(metrics, null, 2)}\n`);
} else {
  const expected = JSON.parse(await readFile(new URL("./expected/metrics.json", import.meta.url), "utf8"));
  if (JSON.stringify(metrics) !== JSON.stringify(expected)) throw new Error(`Metrics differ:\n${JSON.stringify(metrics, null, 2)}`);
}
if (outputTriangles >= sourceTriangles || simplified.length % 3 !== 0 || !metrics.indices_in_range || !metrics.repeated_indices_identical || !metrics.repeated_error_identical || !Number.isFinite(error)) throw new Error(`Simplification checks failed: ${JSON.stringify(metrics)}`);
console.log(`OK: ${sourceTriangles} to ${outputTriangles} triangles; error ${error}; sha256 ${metrics.output_sha256}`);
