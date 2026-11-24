import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { openScenePage } from "@vcr/capture";

// Reads the joint angles the library reports back and the right wrist's world position at predeclared times,
// so run.sh can check the library's output as numbers.
type Vector3 = [number, number, number];

interface FigureMeta {
  figureHeightUnits: number;
}

interface PoseReading {
  seconds: number;
  torsoBendDegrees: number;
  rightArmRaiseDegrees: number;
  leftKneeBendDegrees: number;
  rightWristWorld: Vector3;
}

interface MannequinScene {
  meta: FigureMeta;
  probe: (seconds: number) => PoseReading;
}

const PROBE_SECONDS = [0, 1, 1.5, 2.5] as const;
const here = dirname(fileURLToPath(import.meta.url));

const roundToMicro = (value: number): number => Math.round(value * 1e6) / 1e6;

const roundReading = (reading: PoseReading): PoseReading => ({
  seconds: reading.seconds,
  torsoBendDegrees: roundToMicro(reading.torsoBendDegrees),
  rightArmRaiseDegrees: roundToMicro(reading.rightArmRaiseDegrees),
  leftKneeBendDegrees: roundToMicro(reading.leftKneeBendDegrees),
  rightWristWorld: reading.rightWristWorld.map(roundToMicro) as Vector3,
});

const { page, close } = await openScenePage({
  sceneFile: join(here, "scene.html"),
  width: 1280,
  height: 720,
});

try {
  const meta = await page.evaluate(() => (window as unknown as { __scene: MannequinScene }).__scene.meta);
  const readings: PoseReading[] = [];
  for (const seconds of PROBE_SECONDS) {
    const reading = await page.evaluate((time) => (window as unknown as { __scene: MannequinScene }).__scene.probe(time), seconds);
    readings.push(roundReading(reading));
  }
  const probe = { meta, readings };
  mkdirSync(join(here, "output"), { recursive: true });
  writeFileSync(join(here, "output/probe.json"), `${JSON.stringify(probe, null, 2)}\n`);
  console.log(JSON.stringify({ probed: readings.length, figureHeightUnits: meta.figureHeightUnits }));
} finally {
  await close();
}
