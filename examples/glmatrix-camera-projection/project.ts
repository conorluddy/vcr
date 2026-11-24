// Builds a perspective x lookAt view-projection with gl-matrix, projects five points to NDC and
// checks them against a closed-form reference written here without gl-matrix. Writes output/projection.json.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mat4, vec4 } from "gl-matrix";

type Vector3 = [number, number, number];
type Vector4 = [number, number, number, number];

// === PUBLIC API ===

const TOLERANCE_NDC = 1e-6;

const CAMERA = {
  eye: [2, 1.5, 6] as Vector3,
  target: [0.5, 0.25, 0] as Vector3,
  up: [0, 1, 0] as Vector3,
  fovyRadians: (60 * Math.PI) / 180,
  aspect: 16 / 9,
  near: 0.1,
  far: 100,
};

const POINTS: Array<{ name: string; position: Vector3 }> = [
  { name: "lookAt-target", position: [0.5, 0.25, 0] },
  { name: "origin", position: [0, 0, 0] },
  { name: "right-of-origin", position: [1, 0, 0] },
  { name: "back-upper-left", position: [-1, 1, -1] },
  { name: "front-low-right", position: [2, -1, 1] },
];

function main(): void {
  const viewProjection = buildGlMatrixViewProjection();
  const points = POINTS.map((point) => projectWithGlMatrix(point, viewProjection));
  const maxAbsErrorNdc = Math.max(...points.map((point) => point.maxAbsErrorNdc));
  for (const point of points) {
    if (point.clip[3] <= 0) {
      throw new Error(`${point.name}: clip w is ${point.clip[3]}, expected > 0 (point behind the camera)`);
    }
    if (point.maxAbsErrorNdc > TOLERANCE_NDC) {
      throw new Error(
        `${point.name}: gl-matrix NDC ${JSON.stringify(point.ndc)} differs from analytic ${JSON.stringify(point.analyticNdc)} by ${point.maxAbsErrorNdc}, tolerance ${TOLERANCE_NDC}`,
      );
    }
  }
  const lookAtTarget = points[0];
  if (!lookAtTarget) throw new Error("no points projected");
  if (Math.abs(lookAtTarget.ndc[0]) > TOLERANCE_NDC || Math.abs(lookAtTarget.ndc[1]) > TOLERANCE_NDC) {
    throw new Error(`lookAt target should project to NDC (0, 0), got ${JSON.stringify(lookAtTarget.ndc)}`);
  }
  const result = {
    versions: { glMatrix: readGlMatrixVersion(), node: process.version },
    camera: CAMERA,
    toleranceNdc: TOLERANCE_NDC,
    viewProjection: Array.from(viewProjection),
    points,
    maxAbsErrorNdc,
    withinTolerance: true,
  };
  mkdirSync("output", { recursive: true });
  writeFileSync("output/projection.json", `${JSON.stringify(result, null, 2)}\n`);
  console.log(`projection: max NDC error ${maxAbsErrorNdc} over ${points.length} points`);
}

// === GL-MATRIX PATH ===

function buildGlMatrixViewProjection(): mat4 {
  const projection = mat4.perspective(mat4.create(), CAMERA.fovyRadians, CAMERA.aspect, CAMERA.near, CAMERA.far);
  const view = mat4.lookAt(mat4.create(), CAMERA.eye, CAMERA.target, CAMERA.up);
  return mat4.multiply(mat4.create(), projection, view);
}

function projectWithGlMatrix(
  point: { name: string; position: Vector3 },
  viewProjection: mat4,
): {
  name: string;
  position: Vector3;
  clip: Vector4;
  ndc: Vector3;
  analyticNdc: Vector3;
  maxAbsErrorNdc: number;
} {
  const clipVector = vec4.transformMat4(vec4.create(), vec4.fromValues(...point.position, 1), viewProjection);
  const [clipX, clipY, clipZ, clipW] = clipVector as unknown as Vector4;
  const clip: Vector4 = [clipX, clipY, clipZ, clipW];
  const ndc: Vector3 = [clipX / clipW, clipY / clipW, clipZ / clipW];
  const analyticNdc = analyticNdcForPoint(point.position);
  const maxAbsErrorNdc = Math.max(
    Math.abs(ndc[0] - analyticNdc[0]),
    Math.abs(ndc[1] - analyticNdc[1]),
    Math.abs(ndc[2] - analyticNdc[2]),
  );
  return { name: point.name, position: point.position, clip, ndc, analyticNdc, maxAbsErrorNdc };
}

// === ANALYTIC REFERENCE (no gl-matrix) ===

function analyticNdcForPoint(position: Vector3): Vector3 {
  const forward = normalise(subtract(CAMERA.target, CAMERA.eye));
  const right = normalise(cross(forward, CAMERA.up));
  const trueUp = cross(right, forward);
  const offset = subtract(position, CAMERA.eye);
  const viewX = dot(offset, right);
  const viewY = dot(offset, trueUp);
  const depth = dot(offset, forward);
  const focal = 1 / Math.tan(CAMERA.fovyRadians / 2);
  const depthScale = (CAMERA.far + CAMERA.near) / (CAMERA.near - CAMERA.far);
  const depthOffset = (2 * CAMERA.far * CAMERA.near) / (CAMERA.near - CAMERA.far);
  return [
    ((focal / CAMERA.aspect) * viewX) / depth,
    (focal * viewY) / depth,
    -depthScale + depthOffset / depth,
  ];
}

function subtract(a: Vector3, b: Vector3): Vector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vector3, b: Vector3): Vector3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function normalise(a: Vector3): Vector3 {
  const length = Math.sqrt(dot(a, a));
  return [a[0] / length, a[1] / length, a[2] / length];
}

function readGlMatrixVersion(): string {
  const packageJson = JSON.parse(readFileSync("node_modules/gl-matrix/package.json", "utf8")) as { version: string };
  return packageJson.version;
}

main();
