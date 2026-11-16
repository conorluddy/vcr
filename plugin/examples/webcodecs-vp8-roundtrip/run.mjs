import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(here, "output");
const expectedPath = path.join(here, "expected/result.json");
const playwrightPath = process.env.VCR_PLAYWRIGHT_PATH ?? path.join(os.homedir(), ".vcr/runtime/node_modules/playwright");
const require = createRequire(import.meta.url);
const { chromium } = require(playwrightPath);
const mode = process.argv[2] ?? "";
const width = 32;
const height = 32;
const timestamps = [0, 33333, 66666];
const duration = 33333;
const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
fs.mkdirSync(outputDir, { recursive: true });

const server = createServer((req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end("<!doctype html><title>WebCodecs fixture</title>");
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const browserVersion = browser.version();
  if (browserVersion !== "156.0.8078.4") throw new Error(`Unexpected Chrome version ${browserVersion}`);
  const page = await browser.newPage();
  const port = server.address().port;
  await page.goto(`http://127.0.0.1:${port}/`);
  const runPass = () => page.evaluate(async ({ width, height, timestamps, duration, colors }) => {
    if (!globalThis.VideoEncoder || !globalThis.VideoDecoder || !globalThis.VideoFrame || !globalThis.EncodedVideoChunk) {
      throw new Error("Required WebCodecs APIs unavailable");
    }
    const config = { codec: "vp8", width, height, bitrate: 100000, framerate: 30 };
    const [encoderSupport, decoderSupport] = await Promise.all([
      VideoEncoder.isConfigSupported(config),
      VideoDecoder.isConfigSupported({ codec: "vp8", codedWidth: width, codedHeight: height }),
    ]);
    if (!encoderSupport.supported || !decoderSupport.supported) {
      throw new Error(`VP8 unsupported: encoder=${encoderSupport.supported}, decoder=${decoderSupport.supported}`);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    const sourceDurations = [];
    const chunks = [];
    let encoderError = null;
    const encoder = new VideoEncoder({
      output(chunk) {
        const bytes = new Uint8Array(chunk.byteLength);
        chunk.copyTo(bytes);
        chunks.push({ type: chunk.type, timestamp: chunk.timestamp, duration: chunk.duration ?? null, bytes: Array.from(bytes) });
      },
      error(error) { encoderError = String(error); },
    });
    encoder.configure(config);
    for (let i = 0; i < colors.length; i++) {
      const [r, g, b] = colors[i];
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, width, height);
      const frame = new VideoFrame(canvas, { timestamp: timestamps[i], duration });
      sourceDurations.push(frame.duration);
      encoder.encode(frame, { keyFrame: true });
      frame.close();
    }
    await encoder.flush();
    encoder.close();
    if (encoderError) throw new Error(`VideoEncoder: ${encoderError}`);

    const decoded = [];
    let decoderError = null;
    const decoder = new VideoDecoder({
      output(frame) {
        const decodeCanvas = document.createElement("canvas");
        decodeCanvas.width = frame.displayWidth;
        decodeCanvas.height = frame.displayHeight;
        const decodeCtx = decodeCanvas.getContext("2d", { alpha: false });
        decodeCtx.drawImage(frame, 0, 0);
        const pixels = decodeCtx.getImageData(0, 0, decodeCanvas.width, decodeCanvas.height).data;
        const sums = [0, 0, 0];
        const count = decodeCanvas.width * decodeCanvas.height;
        for (let p = 0; p < pixels.length; p += 4) {
          sums[0] += pixels[p]; sums[1] += pixels[p + 1]; sums[2] += pixels[p + 2];
        }
        decoded.push({
          timestamp: frame.timestamp,
          duration: frame.duration ?? null,
          width: frame.displayWidth,
          height: frame.displayHeight,
          mean_rgb: sums.map((sum) => sum / count),
          preview_png: decodeCanvas.toDataURL("image/png"),
        });
        frame.close();
      },
      error(error) { decoderError = String(error); },
    });
    decoder.configure({ codec: "vp8", codedWidth: width, codedHeight: height });
    for (const chunk of chunks) {
      const bytes = new Uint8Array(chunk.bytes);
      const init = { type: chunk.type, timestamp: chunk.timestamp, data: bytes };
      if (chunk.duration !== null) init.duration = chunk.duration;
      decoder.decode(new EncodedVideoChunk(init));
    }
    await decoder.flush();
    decoder.close();
    if (decoderError) throw new Error(`VideoDecoder: ${decoderError}`);

    const maxColorErrors = decoded.map((frame, i) => Math.max(...frame.mean_rgb.map((v, c) => Math.abs(v - colors[i][c]))));
    return {
      encoder_supported: encoderSupport.supported,
      decoder_supported: decoderSupport.supported,
      config: encoderSupport.config,
      source_durations: sourceDurations,
      encoded_chunks: chunks.map(({ type, timestamp, duration }) => ({ type, timestamp, duration })),
      decoded_frames: decoded,
      max_color_errors: maxColorErrors,
    };
  }, { width, height, timestamps, duration, colors });

  const first = await runPass();
  const second = await runPass();
  for (const [i, frame] of first.decoded_frames.entries()) {
    fs.writeFileSync(path.join(outputDir, `decoded-${i}.png`), Buffer.from(frame.preview_png.split(",")[1], "base64"));
  }
  first.decoded_frames = first.decoded_frames.map(({ preview_png, ...frame }) => frame);
  second.decoded_frames = second.decoded_frames.map(({ preview_png, ...frame }) => frame);
  if (first.decoded_frames.length !== 3 || first.encoded_chunks.length !== 3) throw new Error("expected exactly 3 encoded and decoded frames");
  if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error("repeat functional metrics differ");
  if (first.source_durations.some((d) => d !== duration)) throw new Error(`source duration mismatch: ${first.source_durations}`);
  if (first.encoded_chunks.some((chunk, i) => chunk.timestamp !== timestamps[i])) throw new Error(`encoded timestamps mismatch: ${JSON.stringify(first.encoded_chunks)}`);
  if (first.encoded_chunks.some((chunk) => chunk.duration !== null && chunk.duration !== duration)) throw new Error("encoded duration mismatch");
  if (first.decoded_frames.some((frame, i) => frame.timestamp !== timestamps[i] || frame.width !== width || frame.height !== height)) {
    throw new Error(`decoded frame timing or dimensions mismatch: ${JSON.stringify(first.decoded_frames)}`);
  }
  if (first.max_color_errors.some((error) => error > 20)) throw new Error(`decoded color error exceeds 20: ${first.max_color_errors}`);

  const metrics = {
    browser: `Chrome for Testing ${browserVersion}`,
    node: process.version,
    playwright: require(`${playwrightPath}/package.json`).version,
    host: `${os.type()} ${os.release()} ${os.arch()}`,
    hostname: os.hostname(),
    codec: "vp8",
    width,
    height,
    target_timestamps: timestamps,
    target_duration: duration,
    passes_match: true,
    pass: first,
  };
  const rendered = JSON.stringify(metrics, null, 2) + "\n";
  if (mode === "--record") {
    fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
    fs.writeFileSync(expectedPath, rendered);
    console.log(`RECORDED ${expectedPath}`);
  } else {
    if (fs.readFileSync(expectedPath, "utf8") !== rendered) throw new Error(`metrics differ from ${expectedPath}:\n${rendered}`);
    console.log("OK: WebCodecs frame timing, dimensions, colors and repeat metrics match expected/result.json");
  }
  console.log(rendered);
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
