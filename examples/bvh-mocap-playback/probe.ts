import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openScenePage } from "@vcr/capture";

// Reads the loader's skeleton, clip and sampled joints from the page, and checks them against the BVH file parsed here.
// The expected values use this file's own quaternion and vector maths (no three import: the package ships no types).
// Throws on any predeclared check, so run.sh never records a failing probe.

type Triple = [number, number, number];
// Quaternions are [x, y, z, w], the order three's toArray uses.
type Quad = [number, number, number, number];

interface SampledJoint {
  name: string;
  position: Triple;
  quaternion: Quad;
}

interface SceneInfo {
  boneNames: string[];
  clipName: string;
  clipDurationSeconds: number;
  trackNames: string[];
}

interface VcrScene {
  info: () => SceneInfo;
  sample: (seconds: number) => { joints: SampledJoint[] };
}

interface BvhJoint {
  name: string;
  offset: Triple;
  channels: string[];
}

interface BvhFile {
  joints: BvhJoint[];
  frameTimeSeconds: number;
  frames: number[][];
}

interface JointPose {
  name: string;
  position: Triple;
  quaternion: Quad;
}

// === PREDECLARED ===
// Written before the first run. The bone list includes ENDSITE because BVHLoader builds a bone for the End Site node.
const PREDECLARED_BONE_NAMES = ["Hips", "Spine", "Neck", "Head", "ENDSITE"];
const PREDECLARED_JOINT_NAMES = ["Hips", "Spine", "Neck", "Head"];
const PREDECLARED_TRACK_NAMES = PREDECLARED_JOINT_NAMES.flatMap((name) => [`${name}.position`, `${name}.quaternion`]);
const PREDECLARED_CLIP_NAME = "animation";
const PREDECLARED_DURATION_SECONDS = 29 / 30;
const PREDECLARED_SAMPLE_SECONDS = [0, 7 / 30, 7.5 / 30, 15 / 30, 28.5 / 30];
const TOLERANCE = 1e-6;
const ROUNDING_DECIMALS = 1e6;
const IDENTITY_QUATERNION: Quad = [0, 0, 0, 1];

const here = dirname(fileURLToPath(import.meta.url));

// === VECTOR AND QUATERNION MATHS ===

const roundToMicro = (value: number): number => Math.round(value * ROUNDING_DECIMALS) / ROUNDING_DECIMALS;

// Hamilton product as three's Quaternion.multiply defines it: a * b.
const quaternionMultiply = (a: Quad, b: Quad): Quad => {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
};

const quaternionFromAxisAngle = (axisIndex: 0 | 1 | 2, radians: number): Quad => {
  const half = radians / 2;
  const quaternion: Quad = [0, 0, 0, Math.cos(half)];
  quaternion[axisIndex] = Math.sin(half);
  return quaternion;
};

const dot = (a: readonly number[], b: readonly number[]): number => a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);

// Shorter-arc slerp, with a linear fallback when the two quaternions are nearly equal.
const quaternionSlerp = (a: Quad, b: Quad, fraction: number): Quad => {
  let cosine = dot(a, b);
  const target: Quad = cosine < 0 ? [-b[0], -b[1], -b[2], -b[3]] : b;
  cosine = Math.abs(cosine);
  if (cosine > 0.9995) {
    const linear = a.map((value, index) => value + ((target[index] ?? 0) - value) * fraction);
    const length = Math.hypot(...linear);
    return linear.map((value) => value / length) as Quad;
  }
  const theta0 = Math.acos(cosine);
  const theta = theta0 * fraction;
  const sinTheta0 = Math.sin(theta0);
  const weightA = Math.cos(theta) - (cosine * Math.sin(theta)) / sinTheta0;
  const weightB = Math.sin(theta) / sinTheta0;
  return a.map((value, index) => weightA * value + weightB * (target[index] ?? 0)) as Quad;
};

const vectorLerp = (a: Triple, b: Triple, fraction: number): Triple =>
  [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction, a[2] + (b[2] - a[2]) * fraction];

const vectorDistance = (a: Triple, b: Triple): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Max component difference, taking the sign of q into account. Angle via acos is ill-conditioned near identity, and the
// loader stores keyframes as Float32, so an angle of ~1e-8 rotation reads as ~3e-4 rad; component differences do not.
const quaternionMaxComponentDifference = (sampled: Quad, expected: Quad): number => {
  const direct = Math.max(...sampled.map((value, index) => Math.abs(value - (expected[index] ?? 0))));
  const flipped = Math.max(...sampled.map((value, index) => Math.abs(value + (expected[index] ?? 0))));
  return Math.min(direct, flipped);
};

const requireCheck = (description: string, passed: boolean): void => {
  if (!passed) throw new Error(`bvh-mocap-playback: check failed: ${description}`);
};

const sameList = (actual: readonly string[], expected: readonly string[]): boolean =>
  actual.length === expected.length && actual.every((value, index) => value === expected[index]);

const readNumbers = (text: string, description: string): number[] => {
  const values = text.trim().split(/\s+/).map(Number);
  if (values.some((value) => Number.isNaN(value))) throw new Error(`bvh-mocap-playback: ${description} has a non-numeric value: ${text}`);
  return values;
};

const requireLine = (lines: string[], index: number): string => {
  const line = lines[index];
  if (line === undefined) throw new Error(`bvh-mocap-playback: fixture ends before header line ${index}`);
  return line;
};

const requireFrame = (frames: number[][], frameIndex: number): number[] => {
  const row = frames[frameIndex];
  if (!row) throw new Error(`bvh-mocap-playback: fixture has no frame ${frameIndex}`);
  return row;
};

// === BVH READER (independent of BVHLoader) ===

function parseBvh(text: string): BvhFile {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0);
  const motionIndex = lines.indexOf("MOTION");
  if (motionIndex < 0) throw new Error("bvh-mocap-playback: fixture has no MOTION section");

  const joints: BvhJoint[] = [];
  let ignoreNextOffset = false;
  for (const line of lines.slice(0, motionIndex)) {
    if (line === "End Site") {
      ignoreNextOffset = true;
      continue;
    }
    const jointMatch = /^(ROOT|JOINT) (\S+)$/.exec(line);
    if (jointMatch?.[2] !== undefined) {
      joints.push({ name: jointMatch[2], offset: [0, 0, 0], channels: [] });
      continue;
    }
    const current = joints[joints.length - 1];
    if (line.startsWith("OFFSET ")) {
      if (ignoreNextOffset) {
        ignoreNextOffset = false;
        continue;
      }
      if (!current) throw new Error("bvh-mocap-playback: OFFSET before any joint");
      const [x, y, z] = readNumbers(line.slice("OFFSET ".length), "OFFSET");
      current.offset = [x ?? 0, y ?? 0, z ?? 0];
    } else if (line.startsWith("CHANNELS ")) {
      if (!current) throw new Error("bvh-mocap-playback: CHANNELS before any joint");
      current.channels = line.split(/\s+/).slice(2);
    }
  }

  const frameCount = Number(/^Frames:\s*(\d+)$/.exec(requireLine(lines, motionIndex + 1))?.[1]);
  const frameTimeSeconds = Number(/^Frame Time:\s*(\S+)$/.exec(requireLine(lines, motionIndex + 2))?.[1]);
  const channelsPerFrame = joints.reduce((total, joint) => total + joint.channels.length, 0);
  const frames = lines.slice(motionIndex + 3, motionIndex + 3 + frameCount).map((line) => readNumbers(line, "motion row"));
  requireCheck("fixture has the declared frame count", frames.length === frameCount && frameCount > 0);
  requireCheck("every motion row has one value per channel", frames.every((row) => row.length === channelsPerFrame));
  return { joints, frameTimeSeconds, frames };
}

function poseAtFrame(bvh: BvhFile, frameIndex: number): JointPose[] {
  const row = requireFrame(bvh.frames, frameIndex);
  let cursor = 0;
  return bvh.joints.map((joint) => {
    const position: Triple = [...joint.offset];
    let quaternion: Quad = IDENTITY_QUATERNION;
    for (const channel of joint.channels) {
      const value = row[cursor];
      cursor += 1;
      if (value === undefined) throw new Error(`bvh-mocap-playback: frame ${frameIndex} is short of values`);
      const radians = value * (Math.PI / 180);
      switch (channel) {
        case "Xposition":
          position[0] += value;
          break;
        case "Yposition":
          position[1] += value;
          break;
        case "Zposition":
          position[2] += value;
          break;
        case "Xrotation":
          quaternion = quaternionMultiply(quaternion, quaternionFromAxisAngle(0, radians));
          break;
        case "Yrotation":
          quaternion = quaternionMultiply(quaternion, quaternionFromAxisAngle(1, radians));
          break;
        case "Zrotation":
          quaternion = quaternionMultiply(quaternion, quaternionFromAxisAngle(2, radians));
          break;
        default:
          throw new Error(`bvh-mocap-playback: unknown channel ${channel}`);
      }
    }
    return { name: joint.name, position, quaternion };
  });
}

// Keyframe interpolation as the clip defines it: slerp for rotations, lerp for positions, between neighbouring frames.
function expectedPoseAt(bvh: BvhFile, seconds: number): JointPose[] {
  const frameFloat = seconds / bvh.frameTimeSeconds;
  const lowerFrame = Math.floor(frameFloat + 1e-9);
  const lastFrame = bvh.frames.length - 1;
  if (lowerFrame >= lastFrame) return poseAtFrame(bvh, lastFrame);
  const fraction = Math.max(0, frameFloat - lowerFrame);
  const lower = poseAtFrame(bvh, lowerFrame);
  const upper = poseAtFrame(bvh, lowerFrame + 1);
  return lower.map((pose, index) => {
    const next = upper[index];
    if (!next) throw new Error(`bvh-mocap-playback: no upper pose for joint ${pose.name}`);
    return {
      name: pose.name,
      position: vectorLerp(pose.position, next.position, fraction),
      quaternion: quaternionSlerp(pose.quaternion, next.quaternion, fraction),
    };
  });
}

// === PROBE ===

const bvh = parseBvh(readFileSync(join(here, "fixture/chain.bvh"), "utf8"));
const { page, close } = await openScenePage({
  sceneFile: join(here, "scene.html"),
  width: 1280,
  height: 720,
});

try {
  const info = await page.evaluate(() => (window as unknown as { __scene: VcrScene }).__scene.info());
  requireCheck(`skeleton bones are ${PREDECLARED_BONE_NAMES.join(", ")}`, sameList(info.boneNames, PREDECLARED_BONE_NAMES));
  requireCheck(`clip is named ${PREDECLARED_CLIP_NAME}`, info.clipName === PREDECLARED_CLIP_NAME);
  requireCheck(`clip duration is 29/30 s within ${TOLERANCE}`, Math.abs(info.clipDurationSeconds - PREDECLARED_DURATION_SECONDS) < TOLERANCE);
  requireCheck("clip has the predeclared eight tracks, in order", sameList(info.trackNames, PREDECLARED_TRACK_NAMES));

  const samples: Array<{ seconds: number; joints: Array<Record<string, unknown>> }> = [];
  let worstQuaternion = 0;
  let worstPosition = 0;
  for (const seconds of PREDECLARED_SAMPLE_SECONDS) {
    const sampled = await page.evaluate((time) => (window as unknown as { __scene: VcrScene }).__scene.sample(time), seconds);
    const expected = expectedPoseAt(bvh, seconds);
    const joints = PREDECLARED_JOINT_NAMES.map((name) => {
      const reading = sampled.joints.find((joint) => joint.name === name);
      const target = expected.find((pose) => pose.name === name);
      if (!reading || !target) throw new Error(`bvh-mocap-playback: joint ${name} missing from sample or BVH`);
      const difference = quaternionMaxComponentDifference(reading.quaternion, target.quaternion);
      const distance = vectorDistance(reading.position, target.position);
      worstQuaternion = Math.max(worstQuaternion, difference);
      worstPosition = Math.max(worstPosition, distance);
      return {
        name,
        position: reading.position.map(roundToMicro),
        quaternion: reading.quaternion.map(roundToMicro),
        quaternionMaxComponentDifferenceFromBvh: roundToMicro(difference),
        positionDifferenceFromBvhCm: roundToMicro(distance),
      };
    });
    samples.push({ seconds: roundToMicro(seconds), joints });
  }
  requireCheck(`every sampled quaternion component is within ${TOLERANCE} of the BVH value (sign-aligned)`, worstQuaternion < TOLERANCE);
  requireCheck(`every sampled position is within ${TOLERANCE} cm of the BVH value`, worstPosition < TOLERANCE);

  const probe = {
    info: {
      boneNames: info.boneNames,
      clipName: info.clipName,
      clipDurationSeconds: roundToMicro(info.clipDurationSeconds),
      trackNames: info.trackNames,
    },
    samples,
  };
  mkdirSync(join(here, "output"), { recursive: true });
  writeFileSync(join(here, "output/probe.json"), `${JSON.stringify(probe, null, 2)}\n`);
  console.log(JSON.stringify({ probed: samples.length, worstQuaternionComponentDifference: worstQuaternion, worstPositionCm: worstPosition }));
} finally {
  await close();
}
