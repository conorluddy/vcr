import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "output");
const expectedPath = path.join(here, "expected/result.json");
const packageInfo = (name) => JSON.parse(fs.readFileSync(path.join(here, "node_modules", name, "package.json"), "utf8"));
const wrapper = packageInfo("@ffmpeg/ffmpeg");
const core = packageInfo("@ffmpeg/core");
const vite = packageInfo("vite");
const playwrightPath = process.env.VCR_PLAYWRIGHT_PATH ?? path.join(os.homedir(), ".vcr/runtime/node_modules/playwright");
const require = createRequire(import.meta.url);
const { chromium } = require(playwrightPath);
const mode = process.argv[2] ?? "";
if (wrapper.version !== "0.12.15" || core.version !== "0.12.10" || vite.version !== "8.3.5") {
  throw new Error(`Unexpected versions: @ffmpeg/ffmpeg ${wrapper.version}, @ffmpeg/core ${core.version}, Vite ${vite.version}`);
}
if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
fs.mkdirSync(out, { recursive: true });
const publicDir = path.join(out, "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.copyFileSync(path.join(here, "node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js"), path.join(publicDir, "ffmpeg-core.js"));
fs.copyFileSync(path.join(here, "node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm"), path.join(publicDir, "ffmpeg-core.wasm"));

function bounded(promise, label, milliseconds) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} exceeded ${milliseconds} ms`)), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer));
}

function parseWave(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") throw new Error("Output is not RIFF/WAVE");
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let offset = 12;
  let format;
  let data;
  while (offset + 8 <= buffer.length) {
    const name = buffer.toString("ascii", offset, offset + 4);
    const size = view.getUint32(offset + 4, true);
    const begin = offset + 8;
    if (begin + size > buffer.length) throw new Error(`Invalid ${name} chunk length`);
    if (name === "fmt ") {
      format = {
        format: view.getUint16(begin, true),
        channels: view.getUint16(begin + 2, true),
        sample_rate: view.getUint32(begin + 4, true),
        bits_per_sample: view.getUint16(begin + 14, true),
      };
    } else if (name === "data") data = buffer.subarray(begin, begin + size);
    offset = begin + size + (size & 1);
  }
  if (!format || !data) throw new Error("WAV missing fmt or data chunk");
  if (format.format !== 1 || format.channels !== 1 || format.sample_rate !== 8000 || format.bits_per_sample !== 16 || data.length % 2) {
    throw new Error(`Unexpected WAV metadata ${JSON.stringify(format)} / ${data.length} PCM bytes`);
  }
  const samples = Array.from({ length: data.length / 2 }, (_, index) => data.readInt16LE(index * 2));
  return { ...format, sample_count: samples.length, duration_seconds: samples.length / format.sample_rate, samples, pcm_sha256: crypto.createHash("sha256").update(data).digest("hex") };
}

const server = net.createServer();
await new Promise((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
const port = server.address().port;
await new Promise((resolve) => server.close(resolve));
const viteProcess = spawn(process.execPath, [path.join(here, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: here, stdio: "ignore" });
let browser;
try {
  const url = `http://127.0.0.1:${port}/`;
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (viteProcess.exitCode !== null) throw new Error(`Vite exited early with ${viteProcess.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error("Vite did not become ready within 10 seconds");
  browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") pageErrors.push(message.text()); });
  await page.goto(url, { timeout: 15000 });
  await page.waitForFunction(() => typeof window.runWasmTrim === "function", { timeout: 15000 });
  const browserResult = await bounded(page.evaluate(() => window.runWasmTrim()), "FFmpeg.wasm load and two trim operations", 90000);
  if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join("; ")}`);

  const firstBytes = Buffer.from(browserResult.output_a_base64, "base64");
  const repeatBytes = Buffer.from(browserResult.output_b_base64, "base64");
  const first = parseWave(firstBytes);
  const repeat = parseWave(repeatBytes);
  const expected = Array.from({ length: 4000 }, (_, index) => (((index + 2000) * 37) % 20001) - 10000);
  if (first.sample_count !== 4000 || first.duration_seconds !== 0.5 || JSON.stringify(first.samples) !== JSON.stringify(expected)) {
    throw new Error(`Trim output did not match expected 4,000-sample payload: ${JSON.stringify({ ...first, samples: first.samples.slice(0, 6) })}`);
  }
  if (JSON.stringify(first) !== JSON.stringify(repeat)) throw new Error("Repeated trim metadata or PCM samples differ");
  const versionLog = browserResult.logs.find((line) => /^ffmpeg version\s/i.test(line));
  if (!versionLog) throw new Error(`Could not identify core FFmpeg version from logs: ${browserResult.logs.slice(0, 8).join(" | ")}`);
  const ffmpegVersion = versionLog.match(/^ffmpeg version\s+([^\s]+)/i)?.[1];
  const metrics = {
    wrapper: wrapper.version,
    core_package: core.version,
    core_license: core.license,
    ffmpeg_core_version: ffmpegVersion,
    vite: vite.version,
    node: process.version,
    playwright: require(`${playwrightPath}/package.json`).version,
    browser: `Chrome for Testing ${browserVersion}`,
    host: `${os.type()} ${os.release()} ${os.arch()}`,
    hostname: os.hostname(),
    operation: "browser FFmpeg.wasm PCM WAV sample trim",
    input: { format: "PCM s16le WAV", channels: 1, sample_rate: 8000, sample_count: 8000 },
    trim: { start_sample: 2000, end_sample: 6000 },
    output: {
      format: "PCM s16le WAV",
      channels: first.channels,
      sample_rate: first.sample_rate,
      bits_per_sample: first.bits_per_sample,
      sample_count: first.sample_count,
      duration_seconds: first.duration_seconds,
      exact_expected_samples: true,
      pcm_sha256: first.pcm_sha256,
      repeat_semantics_match: true,
    },
  };
  if (mode === "--record") {
    fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
    fs.writeFileSync(expectedPath, JSON.stringify(metrics, null, 2) + "\n");
    fs.writeFileSync(path.join(out, "ffmpeg.log"), browserResult.logs.join("\n") + "\n");
    console.log(`RECORDED ${expectedPath}`);
  } else {
    if (fs.readFileSync(expectedPath, "utf8") !== JSON.stringify(metrics, null, 2) + "\n") throw new Error(`metrics differ from ${expectedPath}:\n${JSON.stringify(metrics, null, 2)}`);
    console.log("OK: FFmpeg.wasm WAV trim sample count, exact data and repeat metrics match expected/result.json");
  }
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  if (browser) await browser.close();
  viteProcess.kill("SIGTERM");
}
