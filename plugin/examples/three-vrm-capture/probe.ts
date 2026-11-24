import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { openScenePage } from "@vcr/capture";

// Reads the VRM meta and the posed state at predeclared times, so run.sh can check the library's output as numbers.
type Vector3 = [number, number, number];

interface VrmMetaReading {
  metaVersion: string;
  name: string;
  version: string;
  authors: string[];
  licenseUrl: string;
  allowRedistribution: boolean | null;
}

interface PoseReading {
  seconds: number;
  rightUpperArmAngleRadians: number;
  rightHandWorld: Vector3;
  blinkWeight: number;
  springBoneManagerPresent: boolean;
}

interface VrmScene {
  meta: VrmMetaReading;
  probe: (seconds: number) => PoseReading;
}

const PROBE_SECONDS = [0, 1, 1.5, 2.5] as const;
const here = dirname(fileURLToPath(import.meta.url));

const roundToMicro = (value: number): number => Math.round(value * 1e6) / 1e6;

const roundReading = (reading: PoseReading): PoseReading => ({
  seconds: reading.seconds,
  rightUpperArmAngleRadians: roundToMicro(reading.rightUpperArmAngleRadians),
  rightHandWorld: reading.rightHandWorld.map(roundToMicro) as Vector3,
  blinkWeight: roundToMicro(reading.blinkWeight),
  springBoneManagerPresent: reading.springBoneManagerPresent,
});

const { page, close } = await openScenePage({
  sceneFile: join(here, "scene.html"),
  width: 1280,
  height: 720,
});

try {
  const meta = await page.evaluate(() => (window as unknown as { __scene: VrmScene }).__scene.meta);
  const readings: PoseReading[] = [];
  for (const seconds of PROBE_SECONDS) {
    const reading = await page.evaluate((time) => (window as unknown as { __scene: VrmScene }).__scene.probe(time), seconds);
    readings.push(roundReading(reading));
  }
  const probe = { meta, readings };
  mkdirSync(join(here, "output"), { recursive: true });
  writeFileSync(join(here, "output/probe.json"), `${JSON.stringify(probe, null, 2)}\n`);
  console.log(JSON.stringify({ probed: readings.length, name: meta.name, licenseUrl: meta.licenseUrl }));
} finally {
  await close();
}
