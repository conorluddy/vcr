// Builds a 3x3x3 voxel cube with one corner voxel carved out by a boolean subtract, renders it with an
// oblique camera to SVG, and checks the face and polygon counts against analytic values written here.
// Writes output/scene.svg and output/scene.json. Exits non-zero when a predeclared check fails.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Heerich, type Face } from "heerich";

// === PUBLIC API ===

const EXPECTED_RAW_EXPOSED_FACES = 54;
const EXPECTED_PROJECTED_FACES = 27;
const EXPECTED_DISTINCT_FACE_NAMES = 3;
const EXPECTED_FACES_PER_NAME = 9;

type FaceNameCounts = Record<string, number>;

type SceneReport = {
  versions: { heerich: string; node: string };
  scene: { tile: number; camera: string; box: string; carved: string };
  counts: { rawExposedFaces: number; projectedFaces: number; svgPolygons: number; svgPathElements: number };
  projectedFaceNameCounts: FaceNameCounts;
  svg: { bytes: number; sha256: string };
};

function main(): void {
  const scene = buildCarvedCube();
  const rawFaces = scene.getFaces({ raw: true });
  const projectedFaces = scene.getFaces();
  const svg = scene.toSVG({ padding: 20 });

  const report = buildReport(rawFaces, projectedFaces, svg);
  assertReport(report);

  mkdirSync("output", { recursive: true });
  writeFileSync("output/scene.svg", svg);
  writeFileSync("output/scene.json", `${JSON.stringify(report, null, 2)}\n`);
}

// === BUILD ===

function buildCarvedCube(): Heerich {
  const scene = new Heerich({
    tile: 40,
    camera: { type: "oblique", angle: 45, distance: 15 },
  });
  scene.addGeometry({
    type: "box",
    position: [0, 0, 0],
    size: 3,
    style: {
      default: { fill: "#e8d4b8", stroke: "#333", strokeWidth: 0.5 },
      top: { fill: "#c94c3a", stroke: "#333", strokeWidth: 0.5 },
    },
  });
  scene.removeGeometry({ type: "box", position: [2, 2, 2], size: 1 });
  return scene;
}

// === CHECKS ===

function buildReport(rawFaces: Face[], projectedFaces: Face[], svg: string): SceneReport {
  return {
    versions: { heerich: readHeerichVersion(), node: process.version },
    scene: {
      tile: 40,
      camera: "oblique, angle 45, distance 15",
      box: "3x3x3 at [0,0,0], union",
      carved: "1x1x1 at [2,2,2], subtract",
    },
    counts: {
      rawExposedFaces: rawFaces.length,
      projectedFaces: projectedFaces.length,
      svgPolygons: countOccurrences(svg, "<polygon "),
      svgPathElements: countOccurrences(svg, "<path "),
    },
    projectedFaceNameCounts: countByFaceName(projectedFaces),
    svg: { bytes: Buffer.byteLength(svg, "utf8"), sha256: createHash("sha256").update(svg).digest("hex") },
  };
}

function assertReport(report: SceneReport): void {
  const failures: string[] = [];
  if (report.counts.rawExposedFaces !== EXPECTED_RAW_EXPOSED_FACES) {
    failures.push(`raw exposed faces ${report.counts.rawExposedFaces}, expected ${EXPECTED_RAW_EXPOSED_FACES}`);
  }
  if (report.counts.projectedFaces !== EXPECTED_PROJECTED_FACES) {
    failures.push(`projected faces ${report.counts.projectedFaces}, expected ${EXPECTED_PROJECTED_FACES}`);
  }
  if (report.counts.svgPolygons !== EXPECTED_PROJECTED_FACES) {
    failures.push(`svg polygons ${report.counts.svgPolygons}, expected ${EXPECTED_PROJECTED_FACES}`);
  }
  if (report.counts.svgPathElements !== 0) {
    failures.push(`svg path elements ${report.counts.svgPathElements}, expected 0`);
  }
  const names = Object.keys(report.projectedFaceNameCounts);
  if (names.length !== EXPECTED_DISTINCT_FACE_NAMES) {
    failures.push(`distinct visible face names ${names.length}, expected ${EXPECTED_DISTINCT_FACE_NAMES} (${names.join(", ")})`);
  }
  for (const name of names) {
    const count = report.projectedFaceNameCounts[name] ?? 0;
    if (count !== EXPECTED_FACES_PER_NAME) {
      failures.push(`visible face name ${name} has ${count} faces, expected ${EXPECTED_FACES_PER_NAME}`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`heerich-voxel-svg: predeclared checks failed:\n- ${failures.join("\n- ")}`);
  }
}

// === HELPERS ===

function countByFaceName(faces: Face[]): FaceNameCounts {
  const counts: FaceNameCounts = {};
  for (const face of faces) {
    counts[face.type] = (counts[face.type] ?? 0) + 1;
  }
  return counts;
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

function readHeerichVersion(): string {
  const packageJson = JSON.parse(readFileSync("node_modules/heerich/package.json", "utf8")) as { version: string };
  return packageJson.version;
}

main();
