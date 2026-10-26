// Spike: can a headless browser evaluate a paused GSAP timeline at arbitrary frames and
// capture alpha PNGs deterministically? Writes frames to output/ and a JSON report.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium, type CDPSession, type Page } from "playwright";

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const gsapPath = require.resolve("gsap/dist/gsap.min.js");
const FPS = 30;
type CaptureMode = "screenshot" | "settle" | "beginframe";
const CAPTURE_MODE = (process.env["VCR_CAPTURE"] ?? "beginframe") as CaptureMode;

interface RunReport {
  label: string;
  width: number;
  height: number;
  frames: number;
  wall_ms: number;
  frames_per_second: number;
  js_heap_mb: number | null;
}

const log = (event: string, fields: Record<string, unknown> = {}): void => {
  process.stderr.write(`${JSON.stringify({ time: new Date().toISOString(), event, ...fields })}\n`);
};

async function openScene(page: Page, width: number, height: number): Promise<number> {
  await page.setViewportSize({ width, height });
  log("scene.viewport", { width, height });
  await page.goto(pathToFileURL(join(here, "scene.html")).href);
  log("scene.loaded");
  await page.addScriptTag({ path: gsapPath });
  log("scene.gsap");
  const duration = await page.evaluate(() => (window as unknown as { buildTimeline: () => number }).buildTimeline());
  log("scene.timeline", { duration });
  return duration;
}

async function captureFrame(page: Page, frame: number): Promise<Buffer> {
  // Block body on purpose: seek() returns the timeline, and Playwright would try to serialise that cyclic graph.
  await page.evaluate((seconds) => {
    (window as unknown as { __timeline: { seek: (t: number, suppress: boolean) => unknown } }).__timeline.seek(seconds, false);
  }, frame / FPS);
  return page.screenshot({ omitBackground: true, type: "png"});
}

async function timedRun(page: Page, cdp: CDPSession, label: string, width: number, height: number, frames: number[], outputDirectory?: string): Promise<{ report: RunReport; hashes: string[] }> {
  await openScene(page, width, height);
  const hashes: string[] = [];
  const startedAt = performance.now();
  for (const frame of frames) {
    const png = await captureFrame(page, cdp, frame);
    hashes[frame] = createHash("sha256").update(png).digest("hex");
    if (outputDirectory) writeFileSync(join(outputDirectory, `frame-${String(frame).padStart(4, "0")}.png`), png);
    if (frame % 30 === 0) log("capture.progress", { label, frame });
  }
  const wallMs = Math.round(performance.now() - startedAt);
  const heap = await page.evaluate(() => (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null);
  return {
    report: { label, width, height, frames: frames.length, wall_ms: wallMs, frames_per_second: Number((frames.length / (wallMs / 1000)).toFixed(2)), js_heap_mb: heap === null ? null : Number((heap / 1_048_576).toFixed(1)) },
    hashes,
  };
}

const outputDirectory = join(here, "output/frames");
mkdirSync(outputDirectory, { recursive: true });
log("browser.launching");
// Chromium promotes layers and picks raster scales from recent animation history, so the same
// frame can rasterise differently depending on which frames came before it. These flags keep
// compositing and rasterisation on one path regardless of order.
const DETERMINISTIC_CHROMIUM_ARGS = [
  "--deterministic-mode",
  "--enable-begin-frame-control",
  "--run-all-compositor-stages-before-draw",
  "--disable-new-content-rendering-timeout",
  "--disable-threaded-animation",
  "--disable-threaded-scrolling",
  "--disable-checker-imaging",
  "--disable-image-animation-resync",
  "--disable-lcd-text",
  "--force-device-scale-factor=1",
  "--font-render-hinting=none",
];
const browser = await chromium.launch({ args: CAPTURE_MODE === "beginframe" ? DETERMINISTIC_CHROMIUM_ARGS : [] });
log("browser.launched", { version: browser.version() });
const page = await browser.newPage();
const cdp = await page.context().newCDPSession(page);
// Transparent default background so beginFrame screenshots carry alpha like omitBackground does.
await cdp.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
const duration = await openScene(page, 1920, 1080);
const totalFrames = Math.round(duration * FPS);
const sequential = Array.from({ length: totalFrames }, (_, index) => index);
const shuffled = [...sequential].sort(() => 0.5 - Math.random());

const hd = await timedRun(page, cdp, "1080p sequential", 1920, 1080, sequential, outputDirectory);
const shuffledDirectory = join(here, "output/frames-shuffled");
mkdirSync(shuffledDirectory, { recursive: true });
const hdShuffled = await timedRun(page, cdp, "1080p shuffled", 1920, 1080, shuffled, shuffledDirectory);
const uhd = await timedRun(page, cdp, "4K sequential (30 frames)", 3840, 2160, sequential.slice(0, 30));
await browser.close();

const mismatches = sequential.filter((frame) => hd.hashes[frame] !== hdShuffled.hashes[frame]);
const report = {
  capture_mode: CAPTURE_MODE,
  fps: FPS,
  timeline_duration_s: duration,
  runs: [hd.report, hdShuffled.report, uhd.report],
  shuffled_matches_sequential: mismatches.length === 0,
  mismatched_frames: mismatches,
};
writeFileSync(join(here, "output/report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
