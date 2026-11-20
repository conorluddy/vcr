// Capture the SVG paper collage, then read in-page checks (image decode, final rotations) with a small Playwright pass.
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { captureFrames } from "@vcr/capture";

const here = dirname(fileURLToPath(import.meta.url));
const sceneFile = join(here, "scene.html");
const report = await captureFrames({
  sceneFile,
  width: 1280,
  height: 720,
  fps: 30,
  outputDirectory: join(here, "output/frames"),
  verifyDeterminism: true,
});
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
if (new Set(report.hashes).size < 2) throw new Error("Animated fixture produced identical frames");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(sceneFile).href);
await page.waitForFunction(() => (window as any).__scene);
const inPage = await page.evaluate(() => {
  const w = window as any;
  w.__scene.seek(3);
  const rotations = [...document.querySelectorAll("#pieces > g")].map((g) => {
    const m = new DOMMatrix(getComputedStyle(g).transform);
    return Math.round(Math.atan2(m.b, m.a) * (180 / Math.PI) * 100) / 100;
  });
  return { images: w.__imageCheck, rotations };
});
await browser.close();
writeFileSync(join(here, "output/inpage.json"), `${JSON.stringify(inPage, null, 2)}\n`);
console.log(JSON.stringify({ frames: report.frames, fps: report.frames_per_second, deterministic: report.shuffled_matches_sequential, inPage }));
