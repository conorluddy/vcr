// Reads textBounds() at every frame time, checks the count-up predeclared checks, writes output/values.json and probe.json.
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync, readFileSync } from "node:fs";
import { chromium } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const frameCount = 90;
const fps = 30;
const startValue = 0;
const targetValue = 1250;
type Box = { x: number; y: number; width: number; height: number; label: string };
type SceneWindow = { __scene: { seek(t: number): void; textBounds(): Box[] } };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(join(here, "scene.html")).href);
await page.waitForFunction(() => (window as unknown as Partial<SceneWindow>).__scene);
const boxes: Box[] = [];
for (let frame = 0; frame < frameCount; frame += 1) {
  boxes.push(await page.evaluate((t) => {
    const scene = (window as unknown as SceneWindow).__scene;
    scene.seek(t);
    return scene.textBounds()[0];
  }, frame / fps));
}
await browser.close();

const values = boxes.map((box) => Number(box.label));
const finalBox = boxes[frameCount - 1];
const sameDigits = boxes.filter((box) => box.label.length === finalBox.label.length);
const hashes: string[] = JSON.parse(readFileSync(join(here, "output/report.json"), "utf8")).hashes;
const summary = {
  monotonic_non_decreasing: values.every((value, index) => index === 0 || value >= values[index - 1]),
  never_exceeds_target: values.every((value) => value <= targetValue),
  first_value_is_start: values[0] === startValue,
  target_from_2s_exactly: values.slice(2 * fps).every((value) => value === targetValue),
  last_two_hashes_identical: hashes[frameCount - 1] === hashes[frameCount - 2],
  same_digit_frames: sameDigits.length,
  same_digit_left_and_width_identical: sameDigits.every((box) => box.x === finalBox.x && box.width === finalBox.width),
  distinct_values: new Set(values).size,
  values_at_0_15_30_45_60_89: [0, 15, 30, 45, 60, 89].map((frame) => values[frame]),
};
writeFileSync(join(here, "output/values.json"), `${JSON.stringify(values)}\n`);
writeFileSync(join(here, "output/probe.json"), `${JSON.stringify(summary, null, 2)}\n`);
for (const [key, value] of Object.entries(summary)) {
  if (value === false) throw new Error(`check failed: ${key}`);
}
console.log(JSON.stringify(summary));
