import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { openScenePage, settleFrame } from "../../packages/capture/src/capture-frames.ts";

async function main() {
const exampleRoot = resolve("examples/lottie-web-seek");
const outputRoot = join(exampleRoot, "output");
const framesRoot = join(outputRoot, "frames");
mkdirSync(framesRoot, { recursive: true });
const lottieVersion = JSON.parse(readFileSync(join(exampleRoot, "node_modules/lottie-web/package.json"), "utf8")).version as string;
if (lottieVersion !== "5.13.0") throw new Error(`Expected Lottie Web 5.13.0, got ${lottieVersion}`);

const runtimeRoot = join(process.env["VCR_HOME"] ?? join(homedir(), ".vcr"), "runtime", "node_modules");
const playwrightVersion = JSON.parse(readFileSync(join(runtimeRoot, "playwright/package.json"), "utf8")).version as string;
const scene = await openScenePage({
  sceneFile: join(exampleRoot, "scene.html"),
  serveRoot: exampleRoot,
  width: 128,
  height: 128,
  captureMode: "screenshot",
  playwrightRuntimeDirectory: runtimeRoot,
});

try {
  const browserVersion = await scene.page.evaluate(() => navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ?? "unknown");
  const expectedLeft = new Map([[0, 8], [15, 24], [30, 40]]);
  const sequential = new Map<number, { geometry: Record<string, unknown>; screenshotSha256: string }>();

  async function capture(frame: number, directory: string) {
    await scene.page.evaluate((frameNumber) => {
      (window as unknown as { __scene: { seek: (t: number) => void } }).__scene.seek(frameNumber / 30);
    }, frame);
    await settleFrame(scene.page);
    const geometry = await scene.page.evaluate(() => {
      const path = document.querySelector("svg path");
      if (!path) throw new Error("Lottie SVG path not found");
      const local = path.getBBox();
      const matrix = path.getScreenCTM();
      if (!matrix) throw new Error("SVG path has no screen transform");
      const corners = [
        new DOMPoint(local.x, local.y).matrixTransform(matrix),
        new DOMPoint(local.x + local.width, local.y).matrixTransform(matrix),
        new DOMPoint(local.x, local.y + local.height).matrixTransform(matrix),
        new DOMPoint(local.x + local.width, local.y + local.height).matrixTransform(matrix),
      ];
      const xs = corners.map((point) => point.x);
      const ys = corners.map((point) => point.y);
      return {
        left: Math.round(Math.min(...xs) * 100) / 100,
        top: Math.round(Math.min(...ys) * 100) / 100,
        width: Math.round((Math.max(...xs) - Math.min(...xs)) * 100) / 100,
        height: Math.round((Math.max(...ys) - Math.min(...ys)) * 100) / 100,
        d: path.getAttribute("d"),
        fill: getComputedStyle(path).fill,
      };
    });
    const screenshot = await scene.page.screenshot({ type: "png" });
    const screenshotSha256 = createHash("sha256").update(screenshot).digest("hex");
    writeFileSync(join(directory, `frame-${String(frame).padStart(2, "0")}.png`), screenshot);
    const left = expectedLeft.get(frame);
    if (geometry.left !== left || geometry.top !== 24 || geometry.width !== 16 || geometry.height !== 16 || geometry.fill !== "rgb(255, 0, 0)") {
      throw new Error(`Unexpected geometry at frame ${frame}: ${JSON.stringify(geometry)}`);
    }
    return { geometry, screenshotSha256 };
  }

  for (const frame of [0, 15, 30]) sequential.set(frame, await capture(frame, framesRoot));
  const shuffledRoot = join(outputRoot, "shuffled");
  mkdirSync(shuffledRoot, { recursive: true });
  for (const frame of [30, 0, 15]) {
    const current = await capture(frame, shuffledRoot);
    const first = sequential.get(frame)!;
    if (JSON.stringify(current) !== JSON.stringify(first)) throw new Error(`Frame ${frame} differs in shuffled order`);
  }

  const metrics = {
    lottie_web_version: lottieVersion,
    node_version: process.version,
    playwright_version: playwrightVersion,
    chromium_version: browserVersion,
    dimensions: [128, 128],
    sequential_and_shuffled_equal: true,
    frames: Object.fromEntries([...sequential.entries()].map(([frame, result]) => [frame, result])),
  };
  writeFileSync(join(outputRoot, "metrics.json"), `${JSON.stringify(metrics, null, 2)}\n`);
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await scene.close();
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
