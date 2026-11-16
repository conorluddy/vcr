import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "output");
const expectedPath = path.join(here, "expected/result.json");
const packageJson = JSON.parse(fs.readFileSync(path.join(here, "node_modules/canvas-record/package.json"), "utf8"));
const viteVersion = JSON.parse(fs.readFileSync(path.join(here, "node_modules/vite/package.json"), "utf8")).version;
const playwrightPath = process.env.VCR_PLAYWRIGHT_PATH ?? path.join(os.homedir(), ".vcr/runtime/node_modules/playwright");
const require = createRequire(import.meta.url);
const { chromium } = require(playwrightPath);
const mode = process.argv[2] ?? "";
if (packageJson.version !== "6.0.0" || viteVersion !== "8.3.5") throw new Error(`Unexpected package versions: canvas-record ${packageJson.version}, Vite ${viteVersion}`);
if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
fs.mkdirSync(out, { recursive: true });

const portProbe = net.createServer();
await new Promise((resolve, reject) => portProbe.once("error", reject).listen(0, "127.0.0.1", resolve));
const port = portProbe.address().port;
await new Promise((resolve) => portProbe.close(resolve));
const vite = spawn(process.execPath, [path.join(here, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: here, stdio: "ignore" });
let browser;
try {
  const url = `http://127.0.0.1:${port}/`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (vite.exitCode !== null) throw new Error(`Vite exited early with ${vite.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Vite did not become ready at the loopback URL");
  browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  if (browserVersion !== "156.0.8078.4") throw new Error(`Unexpected Chrome version ${browserVersion}`);
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForFunction(() => typeof window.recordCanvasWithLibrary === "function", { timeout: 15000 });

  const measurePass = async (index) => {
    const result = await page.evaluate(() => window.recordCanvasWithLibrary());
    const bytes = Buffer.from(result.bytes_base64, "base64");
    const webmPath = path.join(out, `recording-${index}.webm`);
    fs.writeFileSync(webmPath, bytes);
    const probes = [];
    const ffprobe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_frames", "-show_entries", "stream=codec_name,width,height,r_frame_rate,avg_frame_rate,nb_read_frames:frame=best_effort_timestamp_time,pkt_duration_time:format=duration", "-of", "json", webmPath], { encoding: "utf8" });
    if (ffprobe.error?.code === "ENOENT") probes.push("ffprobe unavailable");
    else if (ffprobe.status !== 0) throw new Error(`ffprobe failed: ${ffprobe.stderr}`);
    else {
      const probe = JSON.parse(ffprobe.stdout);
      const stream = probe.streams[0];
      const frameTimestamps = probe.frames.map((frame) => Number(frame.best_effort_timestamp_time));
      if (stream.codec_name !== "vp9" || Number(stream.width) !== 32 || Number(stream.height) !== 32 || Number(stream.nb_read_frames) !== 3) {
        throw new Error(`ffprobe video mismatch: ${JSON.stringify(stream)}`);
      }
      const expectedTimestamps = [0, 0.333, 0.667];
      if (frameTimestamps.length !== 3 || frameTimestamps.some((timestamp, i) => Math.abs(timestamp - expectedTimestamps[i]) > 0.002)) {
        throw new Error(`ffprobe timestamp mismatch: ${JSON.stringify(frameTimestamps)}`);
      }
      if (Math.abs(Number(probe.format.duration) - 1) > 0.002) throw new Error(`ffprobe duration mismatch: ${probe.format.duration}`);
      probes.push({ ...stream, format_duration: probe.format.duration, frame_timestamps: frameTimestamps });
    }
    const expectedRgb = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
    const samples = result.samples.map((sample, i) => {
      const errors = expectedRgb[i].map((target, c) => Math.abs(sample.rgba[c] - target));
      if (sample.rgba[3] !== 255 || Math.max(...errors) > 24) throw new Error(`decoded color mismatch at ${sample.requested_time}: ${sample.rgba}`);
      fs.writeFileSync(path.join(out, `preview-${index}-${i}.png`), Buffer.from(sample.preview_png.split(",")[1], "base64"));
      return { requested_time: sample.requested_time, decoded_time: sample.decoded_time, rgba: sample.rgba, max_channel_error: Math.max(...errors) };
    });
    if (result.width !== 32 || result.height !== 32 || Math.abs(result.duration - 1) > 0.15) {
      throw new Error(`video metadata mismatch: ${JSON.stringify({ width: result.width, height: result.height, duration: result.duration })}`);
    }
    return { width: result.width, height: result.height, duration: result.duration, bytes: bytes.length, ffprobe: probes, decoded_samples: samples };
  };

  const first = await measurePass(1);
  const second = await measurePass(2);
  const sem = (pass) => ({ width: pass.width, height: pass.height, duration: pass.duration, ffprobe: pass.ffprobe, decoded_samples: pass.decoded_samples });
  if (JSON.stringify(sem(first)) !== JSON.stringify(sem(second))) throw new Error("repeat semantic metrics differ");
  const metrics = {
    canvas_record: packageJson.version,
    vite: viteVersion,
    node: process.version,
    playwright: require(`${playwrightPath}/package.json`).version,
    browser: `Chrome for Testing ${browserVersion}`,
    host: `${os.type()} ${os.release()} ${os.arch()}`,
    hostname: os.hostname(),
    codec: "VP9",
    extension: "webm",
    target: "in-browser",
    recording_passes: 2,
    semantic_repeat_matches: true,
    first: sem(first),
    second: sem(second),
  };
  const rendered = JSON.stringify(metrics, null, 2) + "\n";
  if (mode === "--record") {
    fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
    fs.writeFileSync(expectedPath, rendered);
    console.log(`RECORDED ${expectedPath}`);
  } else {
    if (fs.readFileSync(expectedPath, "utf8") !== rendered) throw new Error(`metrics differ from ${expectedPath}:\n${rendered}`);
    console.log("OK: Canvas Record VP9 WebM metadata, decoded samples and repeat metrics match expected/result.json");
  }
  console.log(rendered);
} finally {
  if (browser) await browser.close();
  vite.kill("SIGTERM");
}
