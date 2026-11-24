// Runs the splat-transform CLI twice on output/input.ply (translate, uniform scale, keep linear opacity
// above 0.5), writing PLY, compressed PLY and SOG. Reads each output back and checks the predeclared
// count and transformed bounds. PLY is read by a minimal parser here; the others by `--stats json`.
// Writes output/summary.json (deterministic fields, diffed by run.sh) and output/rerun.json (rerun report).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Vector3 = [number, number, number];
type Bounds = { min: Vector3; max: Vector3 };
type SplatReadBack = { count: number; bounds: Bounds };
type PlyReadBack = SplatReadBack & { linearOpacityMin: number; linearOpacityMax: number };
type FormatSpec = {
  key: "ply" | "compressedPly" | "sog";
  file: string;
  globalArgs: string[];
  toleranceWorldUnits: number;
  readBackWith: "own-ply-parser" | "cli-stats";
  isRerunGated: boolean;
};
type StatsJson = {
  numGaussians: number;
  stats: Array<{ columns: string[]; data: { min: number[]; max: number[] } }>;
};

// === PUBLIC API ===

const SPLAT_TRANSFORM_BIN = "node_modules/.bin/splat-transform";
const INPUT_PATH = "output/input.ply";
const TRANSFORM_ARGS = ["-t", "10,-2,0.5", "-s", "2", "-V", "opacity,gt,0.5"];
const INPUT_PREDICTION: SplatReadBack = { count: 100, bounds: { min: [0, 0, 0], max: [4, 4, 3] } };
const OUTPUT_PREDICTION: SplatReadBack = { count: 60, bounds: { min: [20, -4, 1], max: [24, 4, 7] } };
const KEPT_LINEAR_OPACITY = 0.9;
const OPACITY_TOLERANCE = 1e-4;
const PLY_TOLERANCE_WORLD_UNITS = 1e-4;
const QUANTISED_TOLERANCE_WORLD_UNITS = 0.01;
const FORMATS: FormatSpec[] = [
  { key: "ply", file: "out.ply", globalArgs: [], toleranceWorldUnits: PLY_TOLERANCE_WORLD_UNITS, readBackWith: "own-ply-parser", isRerunGated: true },
  { key: "compressedPly", file: "out.compressed.ply", globalArgs: [], toleranceWorldUnits: QUANTISED_TOLERANCE_WORLD_UNITS, readBackWith: "cli-stats", isRerunGated: true },
  { key: "sog", file: "out.sog", globalArgs: ["--gpu", "cpu"], toleranceWorldUnits: QUANTISED_TOLERANCE_WORLD_UNITS, readBackWith: "cli-stats", isRerunGated: false },
];

function main(): void {
  mkdirSync("output", { recursive: true });
  const inputReadBack = readPlyBack(readFileSync(INPUT_PATH));
  assertReadBack("input", inputReadBack, INPUT_PREDICTION, PLY_TOLERANCE_WORLD_UNITS);

  const summaryFormats: Record<string, object> = {};
  const rerunReport: Record<string, object> = {};
  for (const format of FORMATS) {
    const runs = ["output/run-1", "output/run-2"].map((runDirectory) => convertRun(runDirectory, format));
    const [firstRun, secondRun] = runs;
    if (!firstRun || !secondRun) throw new Error(`${format.key}: expected two conversion runs`);
    const rerunByteIdentical = firstRun.bytes.equals(secondRun.bytes);
    if (format.isRerunGated && !rerunByteIdentical) {
      throw new Error(`${format.key}: run-1 and run-2 differ; this format must be byte-identical across reruns`);
    }
    const readBacks = runs.map((run) => readBackFormat(run.path, format));
    readBacks.forEach((readBack, runIndex) => {
      const label = `${format.key} run-${runIndex + 1}`;
      assertReadBack(label, readBack, OUTPUT_PREDICTION, format.toleranceWorldUnits);
      if (isPlyReadBack(readBack)) assertKeptLinearOpacity(label, readBack);
    });
    const firstReadBack = readBacks[0];
    if (!firstReadBack) throw new Error(`${format.key}: no read-back result`);
    const maxAbsErrorWorldUnits = Math.max(...readBacks.map((readBack) => maxBoundsError(readBack.bounds, OUTPUT_PREDICTION.bounds)));
    const deterministicFields = { file: format.file, count: firstReadBack.count, bounds: firstReadBack.bounds, maxAbsErrorWorldUnits };
    const opacityFields = isPlyReadBack(firstReadBack)
      ? { linearOpacityMin: firstReadBack.linearOpacityMin, linearOpacityMax: firstReadBack.linearOpacityMax }
      : {};
    summaryFormats[format.key] = format.isRerunGated
      ? { ...deterministicFields, ...opacityFields, sha256: sha256Of(firstRun.bytes), rerunByteIdentical }
      : deterministicFields;
    rerunReport[format.key] = {
      sha256Run1: sha256Of(firstRun.bytes),
      sha256Run2: sha256Of(secondRun.bytes),
      rerunByteIdentical,
      gated: format.isRerunGated,
    };
  }

  const summary = {
    versions: { splatTransform: readPackageVersion(), node: process.version },
    input: { count: inputReadBack.count, bounds: inputReadBack.bounds, sha256: sha256Of(readFileSync(INPUT_PATH)) },
    transform: { args: TRANSFORM_ARGS },
    predicted: OUTPUT_PREDICTION,
    formats: summaryFormats,
  };
  writeFileSync("output/summary.json", `${JSON.stringify(summary, null, 2)}\n`);
  writeFileSync("output/rerun.json", `${JSON.stringify(rerunReport, null, 2)}\n`);
  console.log(`convert: ${FORMATS.map((format) => format.key).join(", ")} written twice, read back and checked`);
}

// === CONVERSION ===

function convertRun(runDirectory: string, format: FormatSpec): { path: string; bytes: Buffer } {
  mkdirSync(runDirectory, { recursive: true });
  const outputPath = join(runDirectory, format.file);
  execFileSync(SPLAT_TRANSFORM_BIN, [...format.globalArgs, INPUT_PATH, ...TRANSFORM_ARGS, outputPath], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  return { path: outputPath, bytes: readFileSync(outputPath) };
}

function readBackFormat(filePath: string, format: FormatSpec): SplatReadBack | PlyReadBack {
  if (format.readBackWith === "own-ply-parser") return readPlyBack(readFileSync(filePath));
  return readBackWithCli(filePath);
}

// === READ-BACK ===

function readBackWithCli(filePath: string): SplatReadBack {
  const stdout = execFileSync(SPLAT_TRANSFORM_BIN, [filePath, "--stats", "json", "null"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const parsed = JSON.parse(stdout) as StatsJson;
  const finest = parsed.stats[0];
  if (!finest) throw new Error(`${filePath}: --stats json has no LOD entries; the CLI output shape changed`);
  const columnIndexOf = (name: string): number => {
    const index = finest.columns.indexOf(name);
    if (index < 0) throw new Error(`${filePath}: --stats json has no column "${name}"`);
    return index;
  };
  const axisIndices = ["x", "y", "z"].map(columnIndexOf);
  const min = axisIndices.map((index) => finest.data.min[index] ?? Number.NaN) as Vector3;
  const max = axisIndices.map((index) => finest.data.max[index] ?? Number.NaN) as Vector3;
  return { count: parsed.numGaussians, bounds: { min, max } };
}

// Minimal reader for binary_little_endian PLY with only float properties. Reports the linear opacity
// range (sigmoid of the stored logit) so the filter's effect can be checked on the output.
function readPlyBack(bytes: Buffer): PlyReadBack {
  const headerEnd = bytes.indexOf("end_header\n");
  if (headerEnd < 0) throw new Error("PLY has no end_header line");
  const headerLines = bytes.subarray(0, headerEnd).toString("ascii").split("\n");
  if (!headerLines.includes("format binary_little_endian 1.0")) throw new Error("PLY is not binary_little_endian 1.0");
  const countLine = headerLines.find((line) => line.startsWith("element vertex "));
  const count = Number(countLine?.split(" ")[2]);
  const propertyLines = headerLines.filter((line) => line.startsWith("property "));
  if (propertyLines.some((line) => !line.startsWith("property float "))) throw new Error("PLY has a non-float property; this reader handles float only");
  const names = propertyLines.map((line) => line.split(" ")[2] ?? "");
  const stride = names.length * 4;
  const bodyStart = headerEnd + "end_header\n".length;
  if (bodyStart + count * stride !== bytes.length) throw new Error(`PLY body is ${bytes.length - bodyStart} bytes, expected ${count * stride}`);
  const columnOf = (name: string): number => {
    const index = names.indexOf(name);
    if (index < 0) throw new Error(`PLY has no property "${name}"`);
    return index;
  };
  const positionColumns = [columnOf("x"), columnOf("y"), columnOf("z")];
  const opacityColumn = columnOf("opacity");
  const min: number[] = [Infinity, Infinity, Infinity];
  const max: number[] = [-Infinity, -Infinity, -Infinity];
  let linearOpacityMin = Infinity;
  let linearOpacityMax = -Infinity;
  for (let row = 0; row < count; row++) {
    const valueAt = (column: number): number => bytes.readFloatLE(bodyStart + row * stride + column * 4);
    positionColumns.forEach((column, axis) => {
      const value = valueAt(column);
      min[axis] = Math.min(min[axis] ?? Infinity, value);
      max[axis] = Math.max(max[axis] ?? -Infinity, value);
    });
    const linearOpacity = 1 / (1 + Math.exp(-valueAt(opacityColumn)));
    linearOpacityMin = Math.min(linearOpacityMin, linearOpacity);
    linearOpacityMax = Math.max(linearOpacityMax, linearOpacity);
  }
  return {
    count,
    bounds: { min: min as Vector3, max: max as Vector3 },
    linearOpacityMin,
    linearOpacityMax,
  };
}

// === ASSERTIONS ===

function assertReadBack(label: string, readBack: SplatReadBack, predicted: SplatReadBack, toleranceWorldUnits: number): void {
  if (readBack.count !== predicted.count) {
    throw new Error(`${label}: count ${readBack.count}, predicted ${predicted.count}`);
  }
  const error = maxBoundsError(readBack.bounds, predicted.bounds);
  if (!(error <= toleranceWorldUnits)) {
    throw new Error(`${label}: bounds ${JSON.stringify(readBack.bounds)} differ from predicted ${JSON.stringify(predicted.bounds)} by ${error}, tolerance ${toleranceWorldUnits}`);
  }
}

function assertKeptLinearOpacity(label: string, readBack: PlyReadBack): void {
  const opacityError = Math.max(
    Math.abs(readBack.linearOpacityMin - KEPT_LINEAR_OPACITY),
    Math.abs(readBack.linearOpacityMax - KEPT_LINEAR_OPACITY),
  );
  if (!(opacityError <= OPACITY_TOLERANCE)) {
    throw new Error(`${label}: linear opacity ${readBack.linearOpacityMin}..${readBack.linearOpacityMax} is not all ${KEPT_LINEAR_OPACITY}; the filter did not keep only opacity above 0.5`);
  }
}

function isPlyReadBack(readBack: SplatReadBack | PlyReadBack): readBack is PlyReadBack {
  return "linearOpacityMin" in readBack;
}

// === HELPERS ===

function maxBoundsError(actual: Bounds, expected: Bounds): number {
  const differences = [
    ...actual.min.map((value, axis) => Math.abs(value - (expected.min[axis] ?? Number.NaN))),
    ...actual.max.map((value, axis) => Math.abs(value - (expected.max[axis] ?? Number.NaN))),
  ];
  return Math.max(...differences);
}

function sha256Of(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readPackageVersion(): string {
  const packageJson = JSON.parse(readFileSync("node_modules/@playcanvas/splat-transform/package.json", "utf8")) as { version: string };
  return packageJson.version;
}

main();
