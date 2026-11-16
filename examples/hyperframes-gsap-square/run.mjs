import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "output");
const expectedPath = path.join(here, "expected/result.json");
const mode = process.argv[2] ?? "";
if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
const require = createRequire(import.meta.url);
const { PNG } = require("pngjs");
const pkg = JSON.parse(fs.readFileSync(path.join(here, "node_modules/hyperframes/package.json"), "utf8"));
const gsapPkg = JSON.parse(fs.readFileSync(path.join(here, "node_modules/gsap/package.json"), "utf8"));
const pngPkg = JSON.parse(fs.readFileSync(path.join(here, "node_modules/pngjs/package.json"), "utf8"));
if (pkg.version !== "0.9.33" || gsapPkg.version !== "3.15.1" || pngPkg.version !== "7.0.0") {
  throw new Error(`Unexpected versions: hyperframes ${pkg.version}, gsap ${gsapPkg.version}, pngjs ${pngPkg.version}`);
}
fs.mkdirSync(out, { recursive: true });

const env = {
  ...process.env,
  HYPERFRAMES_NO_UPDATE_CHECK: "1",
  HYPERFRAMES_NO_TELEMETRY: "1",
  HYPERFRAMES_SKIP_SKILLS: "1",
  DO_NOT_TRACK: "1",
};
const cli = path.join(here, "node_modules/.bin/hyperframes");
function call(args, timeout = 180000) {
  const result = spawnSync(cli, args, { cwd: here, env, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`hyperframes ${args.join(" ")} failed (${result.status}):\n${result.stdout}\n${result.stderr}`);
  return `${result.stdout}${result.stderr}`;
}

const cliVersion = call(["--version"]).trim();
if (cliVersion !== "0.9.33") throw new Error(`Unexpected HyperFrames CLI version ${cliVersion}`);
const browserPath = call(["browser", "path"]).trim().split(/\r?\n/).at(-1);
if (!fs.existsSync(browserPath)) throw new Error(`HyperFrames browser path does not exist: ${browserPath}`);
const browserVersion = spawnSync(browserPath, ["--version"], { encoding: "utf8", timeout: 15000 });
const browserVersionText = `${browserVersion.stdout}${browserVersion.stderr}`.trim().split(/\r?\n/).at(-1);

function runOne(index) {
  const runDir = path.join(out, `run${index}`);
  fs.rmSync(runDir, { recursive: true, force: true });
  fs.mkdirSync(runDir, { recursive: true });
  const frameDir = path.join(runDir, "frames");
  const log = call(["render", "--format", "png-sequence", "--fps", "12", "--workers", "1", "--output", frameDir, "--json"]);
  fs.writeFileSync(path.join(runDir, "render.log"), log);
  const files = fs.readdirSync(frameDir).filter((name) => name.toLowerCase().endsWith(".png")).sort();
  if (files.length !== 12) throw new Error(`Expected 12 PNG frames, got ${files.length}: ${files.join(", ")}`);
  const frames = [];
  const pixelBytes = [];
  for (const file of files) {
    const decoded = PNG.sync.read(fs.readFileSync(path.join(frameDir, file)));
    if (decoded.width !== 192 || decoded.height !== 108) throw new Error(`${file} is ${decoded.width}x${decoded.height}, expected 192x108`);
    const redPoints = [];
    for (let y = 0; y < decoded.height; y++) {
      for (let x = 0; x < decoded.width; x++) {
        const offset = (y * decoded.width + x) * 4;
        const [red, green, blue, alpha] = decoded.data.subarray(offset, offset + 4);
        if (alpha > 240 && red > 200 && green < 80 && blue < 80) redPoints.push([x, y]);
      }
    }
    if (redPoints.length < 500 || redPoints.length > 650) throw new Error(`${file} red area unexpected: ${redPoints.length} pixels`);
    const xs = redPoints.map(([x]) => x);
    const ys = redPoints.map(([, y]) => y);
    const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs) + 1, Math.max(...ys) + 1];
    if (bbox[2] - bbox[0] !== 24 || bbox[3] - bbox[1] !== 24) throw new Error(`${file} square bounds are ${bbox}`);
    const centroidX = redPoints.reduce((sum, [x]) => sum + x, 0) / redPoints.length;
    const rawPixels = Buffer.from(decoded.data);
    pixelBytes.push(rawPixels);
    frames.push({
      file,
      width: decoded.width,
      height: decoded.height,
      red_pixels: redPoints.length,
      bbox,
      centroid_x: Math.round(centroidX * 1000) / 1000,
      pixel_sha256: crypto.createHash("sha256").update(rawPixels).digest("hex"),
    });
  }
  const centroids = frames.map((frame) => frame.centroid_x);
  if (centroids.some((value, index) => index > 0 && value <= centroids[index - 1])) {
    throw new Error(`square centroid did not move strictly rightward: ${centroids}`);
  }
  const shift = centroids.at(-1) - centroids[0];
  if (shift < 100 || shift > 120) throw new Error(`expected 100-120 px shift, got ${shift}`);
  return {
    frame_count: files.length,
    dimensions: [192, 108],
    fps: 12,
    duration_seconds: files.length / 12,
    centroids_x: centroids,
    centroid_shift_pixels: shift,
    frames,
  };
}

const first = runOne(1);
const second = runOne(2);
if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error("two HyperFrames CLI renders have different metrics");
const metrics = {
  hyperframes: pkg.version,
  gsap: gsapPkg.version,
  pngjs: pngPkg.version,
  node: process.version,
  npm_user_agent: process.env.npm_config_user_agent ?? "node CLI; npm 11.9.0 installer",
  browser: browserVersionText,
  browser_path: browserPath,
  ffmpeg: spawnSync("ffmpeg", ["-version"], { encoding: "utf8" }).stdout.split(/\r?\n/)[0],
  host: `${os.type()} ${os.release()} ${os.arch()}`,
  hostname: os.hostname(),
  render_route: "local HyperFrames CLI / Chrome / PNG sequence",
  runs: 2,
  repeat_metrics_match: true,
  first,
  second,
};
const rendered = JSON.stringify(metrics, null, 2) + "\n";
if (mode === "--record") {
  fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
  fs.writeFileSync(expectedPath, rendered);
  console.log(`RECORDED ${expectedPath}`);
} else {
  if (!fs.existsSync(expectedPath) || fs.readFileSync(expectedPath, "utf8") !== rendered) throw new Error(`metrics differ from ${expectedPath}:\n${rendered}`);
  console.log("OK: HyperFrames frame count, geometry, timing and repeat metrics match expected/result.json");
}
console.log(rendered);
