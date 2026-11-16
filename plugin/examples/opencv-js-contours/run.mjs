import cvReadyPromise from "@techstark/opencv-js";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const dir = new URL("./", import.meta.url);
const out = new URL("./output/", import.meta.url);
await mkdir(out, { recursive: true });
const rows = 10, cols = 12;
const pixels = new Uint8Array(rows * cols).fill(20);
for (let y = 1; y < 4; y++) for (let x = 1; x < 4; x++) pixels[y * cols + x] = 200;
for (let y = 2; y < 7; y++) for (let x = 7; x < 11; x++) pixels[y * cols + x] = 200;

const pgm = (values) => Buffer.concat([Buffer.from(`P5\n${cols} ${rows}\n255\n`), Buffer.from(values)]);
await writeFile(new URL("./output/input.pgm", dir), pgm(pixels));
const cv = await cvReadyPromise;
const src = cv.matFromArray(rows, cols, cv.CV_8UC1, Array.from(pixels));
const binary = new cv.Mat();
cv.threshold(src, binary, 127, 255, cv.THRESH_BINARY);
await writeFile(new URL("./output/threshold.pgm", dir), pgm(binary.data));
const contours = new cv.MatVector();
const hierarchy = new cv.Mat();
cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
const shapes = [];
for (let i = 0; i < contours.size(); i++) {
  const contour = contours.get(i);
  const rect = cv.boundingRect(contour);
  shapes.push({ x: rect.x, y: rect.y, width: rect.width, height: rect.height, area: cv.contourArea(contour) });
  contour.delete();
}
shapes.sort((a, b) => a.x - b.x);
const coreVersion = cv.getBuildInformation().match(/Version control:\s+(\S+)/)?.[1];
const packageVersion = JSON.parse(await readFile(new URL("./node_modules/@techstark/opencv-js/package.json", import.meta.url), "utf8")).version;
const metrics = {
  package_version: packageVersion,
  opencv_core_version: coreVersion,
  runtime: "Node WASM",
  input: { rows, cols, foreground: Array.from(pixels).filter((v) => v > 127).length },
  threshold: { threshold: 127, max_value: 255, foreground: Array.from(binary.data).filter((v) => v === 255).length, sha256: createHash("sha256").update(binary.data).digest("hex") },
  contours: shapes,
};
await writeFile(new URL("./output/metrics.json", dir), `${JSON.stringify(metrics, null, 2)}\n`);
for (const mat of [src, binary, contours, hierarchy]) mat.delete();
console.log(JSON.stringify(metrics, null, 2));
