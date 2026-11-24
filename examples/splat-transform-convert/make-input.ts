// Writes output/input.ply: 100 synthetic Gaussians on a 5 x 5 x 4 lattice in the standard 3DGS binary
// PLY layout. Every value is closed-form (no randomness), so the input is the same bytes on every run.
import { mkdirSync, writeFileSync } from "node:fs";

// === PUBLIC API ===

const LATTICE_COUNT = { x: 5, y: 5, z: 4 };
const KEPT_LATTICE_X_LIMIT = 3;
const OPACITY_KEPT = 0.9;
const OPACITY_REMOVED = 0.2;
const SCALE_LINEAR = 0.1;
const SH_C0 = 0.28209479177387814;

const PROPERTY_NAMES = [
  "x", "y", "z", "nx", "ny", "nz",
  "f_dc_0", "f_dc_1", "f_dc_2",
  "opacity",
  "scale_0", "scale_1", "scale_2",
  "rot_0", "rot_1", "rot_2", "rot_3",
];

function main(): void {
  const rows = buildLatticeRows();
  mkdirSync("output", { recursive: true });
  writeFileSync("output/input.ply", encodeBinaryPly(rows));
  console.log(`input: ${rows.length} splats, ${PROPERTY_NAMES.length} properties`);
}

// === LATTICE ===

function buildLatticeRows(): number[][] {
  const rows: number[][] = [];
  for (let k = 0; k < LATTICE_COUNT.z; k++) {
    for (let j = 0; j < LATTICE_COUNT.y; j++) {
      for (let i = 0; i < LATTICE_COUNT.x; i++) {
        rows.push(buildSplatRow(i, j, k));
      }
    }
  }
  return rows;
}

function buildSplatRow(i: number, j: number, k: number): number[] {
  const colour = [i / (LATTICE_COUNT.x - 1), j / (LATTICE_COUNT.y - 1), k / (LATTICE_COUNT.z - 1)];
  const linearOpacity = i < KEPT_LATTICE_X_LIMIT ? OPACITY_KEPT : OPACITY_REMOVED;
  const opacityLogit = Math.log(linearOpacity / (1 - linearOpacity));
  const logScale = Math.log(SCALE_LINEAR);
  const normals = [0, 0, 0];
  const identityRotationWFirst = [1, 0, 0, 0];
  const sphericalHarmonicsDc = colour.map(colourToDcCoefficient);
  return [i, j, k, ...normals, ...sphericalHarmonicsDc, opacityLogit, logScale, logScale, logScale, ...identityRotationWFirst];
}

// === PLY ENCODING ===

function encodeBinaryPly(rows: number[][]): Buffer {
  const header = [
    "ply",
    "format binary_little_endian 1.0",
    "comment VCR synthetic fixture, examples/splat-transform-convert/make-input.ts",
    `element vertex ${rows.length}`,
    ...PROPERTY_NAMES.map((name) => `property float ${name}`),
    "end_header",
    "",
  ].join("\n");
  const body = Buffer.alloc(rows.length * PROPERTY_NAMES.length * 4);
  rows.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      body.writeFloatLE(value, (rowIndex * PROPERTY_NAMES.length + columnIndex) * 4);
    });
  });
  return Buffer.concat([Buffer.from(header, "ascii"), body]);
}

function colourToDcCoefficient(channel: number): number {
  return (channel - 0.5) / SH_C0;
}

main();
