// Deterministic frame capture of a browser scene. Contract learned in
// specifications/spikes/browser-capture.md: the page exposes one paused scene with a pure
// seek, the harness owns frame production via beginFrame, and nothing returned from
// evaluate is a framework object.
import { createHash } from "node:crypto";
import { mkdirSync, readFile, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { dirname, extname, join, normalize, relative } from "node:path";
import { chromium, type CDPSession, type Page } from "playwright";

// === TYPES ===

/** What a scene page must put on `window.__scene` before capture starts. */
export interface SceneContract {
  /** Seconds. The harness captures frames 0 .. round(duration * fps) - 1. */
  duration: number;
  /** Renders the scene at exactly this time. Must be pure: same t, same pixels. */
  seek: (seconds: number) => void;
}

export interface CaptureOptions {
  /** http(s):// URL of the scene page. Use `sceneFile` for a local page: file:// blocks ES module imports. */
  sceneUrl?: string | undefined;
  /** Absolute path to a local scene page; its directory (or `serveRoot`) is served over loopback HTTP for the run. */
  sceneFile?: string | undefined;
  /** Serve this ancestor directory instead of the scene's own, so scenes can reference shared assets and node_modules. */
  serveRoot?: string | undefined;
  /** Scripts to inject before the scene is built, e.g. a library's UMD bundle. */
  scripts?: Array<{ path: string } | { url: string }>;
  width: number;
  height: number;
  fps: number;
  /** Explicit frame list; defaults to the whole duration in order. */
  frames?: number[];
  /** Where PNGs go; omitted means hash only. */
  outputDirectory?: string | undefined;
  /** Capture every frame twice in a shuffled order and compare hashes. */
  verifyDeterminism?: boolean;
  /**
   * screenshot (default) settles two animation frames then captures; deterministic for DOM, 2D canvas and WebGL.
   * beginframe drives Chromium's frame production explicitly and is faster, but hangs on any page with a canvas.
   */
  captureMode?: CaptureMode | undefined;
}

export type CaptureMode = "beginframe" | "screenshot";

export interface CaptureReport {
  width: number;
  height: number;
  fps: number;
  duration_s: number;
  frames: number;
  wall_ms: number;
  frames_per_second: number;
  hashes: string[];
  shuffled_matches_sequential: boolean | null;
  mismatched_frames: number[];
}

/** Chromium flags that keep compositing and rasterisation on one path regardless of frame order. */
export const DETERMINISTIC_CHROMIUM_ARGS = [
  "--disable-threaded-animation",
  "--disable-threaded-scrolling",
  "--disable-checker-imaging",
  "--disable-image-animation-resync",
  "--disable-lcd-text",
  "--force-device-scale-factor=1",
  "--font-render-hinting=none",
];

/** Extra flags for beginframe mode: the harness, not Chromium's scheduler, decides when a frame is produced. */
export const BEGIN_FRAME_CHROMIUM_ARGS = ["--deterministic-mode", "--enable-begin-frame-control", "--run-all-compositor-stages-before-draw", "--disable-new-content-rendering-timeout"];

// === PUBLIC API ===

export async function captureFrames(options: CaptureOptions): Promise<CaptureReport> {
  const root = options.sceneFile ? (options.serveRoot ?? dirname(options.sceneFile)) : null;
  const served = root ? await serveDirectory(root) : null;
  const sceneUrl = served ? `${served.url}/${relative(root!, options.sceneFile!)}` : options.sceneUrl;
  if (!sceneUrl) throw new Error("captureFrames needs sceneUrl or sceneFile");
  log("capture.scene", { url: sceneUrl });
  const captureMode: CaptureMode = options.captureMode ?? (process.env["VCR_CAPTURE_MODE"] as CaptureMode | undefined) ?? "screenshot";
  const extraArgs = (process.env["VCR_CHROMIUM_EXTRA_ARGS"] ?? "").split(" ").filter(Boolean);
  const browser = await chromium.launch({ args: [...DETERMINISTIC_CHROMIUM_ARGS, ...(captureMode === "beginframe" ? BEGIN_FRAME_CHROMIUM_ARGS : []), ...extraArgs] });
  log("capture.mode", { captureMode });
  try {
    const page = await browser.newPage({ viewport: { width: options.width, height: options.height } });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
    const duration = await openScene(page, sceneUrl, options);
    log("capture.ready", { duration });
    const totalFrames = Math.round(duration * options.fps);
    const frames = options.frames ?? Array.from({ length: totalFrames }, (_, index) => index);
    if (options.outputDirectory) mkdirSync(options.outputDirectory, { recursive: true });

    const startedAt = performance.now();
    const hashes = await captureInOrder(page, cdp, frames, options, captureMode);
    const wallMs = Math.round(performance.now() - startedAt);

    let mismatched: number[] = [];
    let verified: boolean | null = null;
    if (options.verifyDeterminism) {
      const shuffled = shuffle(frames, 0x5eed);
      const again = await captureInOrder(page, cdp, shuffled, { ...options, outputDirectory: undefined }, captureMode);
      mismatched = frames.filter((frame) => hashes[frame] !== again[frame]);
      verified = mismatched.length === 0;
    }
    return {
      width: options.width,
      height: options.height,
      fps: options.fps,
      duration_s: duration,
      frames: frames.length,
      wall_ms: wallMs,
      frames_per_second: Number((frames.length / (wallMs / 1000)).toFixed(2)),
      hashes: frames.map((frame) => hashes[frame]!),
      shuffled_matches_sequential: verified,
      mismatched_frames: mismatched,
    };
  } finally {
    await browser.close();
    served?.server.close();
  }
}

// === PRIVATE HELPERS ===

function log(event: string, fields: Record<string, unknown> = {}): void {
  process.stderr.write(`${JSON.stringify({ time: new Date().toISOString(), event, ...fields })}\n`);
}

async function openScene(page: Page, sceneUrl: string, options: CaptureOptions): Promise<number> {
  page.on("pageerror", (error) => process.stderr.write(`${JSON.stringify({ event: "page.error", message: error.message })}\n`));
  page.on("console", (message) => {
    if (message.type() === "error") process.stderr.write(`${JSON.stringify({ event: "page.console.error", text: message.text() })}\n`);
  });
  await page.goto(sceneUrl);
  for (const script of options.scripts ?? []) await page.addScriptTag(script);
  // Interval polling: under begin-frame control no animation frame fires until the harness asks for one.
  await page.waitForFunction(() => typeof (window as unknown as { __scene?: SceneContract }).__scene?.seek === "function", undefined, { timeout: 10_000, polling: 50 });
  return page.evaluate(() => (window as unknown as { __scene: SceneContract }).__scene.duration);
}

async function captureInOrder(page: Page, cdp: CDPSession, frames: number[], options: CaptureOptions, captureMode: CaptureMode): Promise<string[]> {
  const hashes: string[] = [];
  for (const frame of frames) {
    await page.evaluate((seconds) => {
      (window as unknown as { __scene: SceneContract }).__scene.seek(seconds);
    }, frame / options.fps);
    const png = await captureOne(page, cdp, captureMode, frame);
    hashes[frame] = createHash("sha256").update(png).digest("hex");
    if (frame === frames[0] || frame % 30 === 0) log("capture.frame", { frame, bytes: png.length });
    if (options.outputDirectory) writeFileSync(join(options.outputDirectory, `frame-${String(frame).padStart(4, "0")}.png`), png);
  }
  return hashes;
}

async function captureOne(page: Page, cdp: CDPSession, captureMode: CaptureMode, frame: number): Promise<Buffer> {
  if (captureMode === "beginframe") {
    const result = (await cdp.send("HeadlessExperimental.beginFrame", { screenshot: { format: "png" } })) as { screenshotData?: string };
    if (!result.screenshotData) throw new Error(`beginFrame produced no screenshot for frame ${frame}`);
    return Buffer.from(result.screenshotData, "base64");
  }
  // Let the scheduled render run and reach the compositor before asking for pixels.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 0)))));
  return page.screenshot({ type: "png" });
}

/** Deterministic shuffle so a determinism failure reproduces. */
function shuffle(frames: number[], seed: number): number[] {
  const out = [...frames];
  let state = seed;
  for (let index = out.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [out[index], out[swap]] = [out[swap]!, out[index]!];
  }
  return out;
}

const MEDIA_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

/** Loopback static server for one scene directory. Symlinked node_modules resolve because readFile follows links. */
function serveDirectory(root: string): Promise<{ server: Server; url: string }> {
  const server = createServer((request, response) => {
    const requestPath = normalize(decodeURIComponent((request.url ?? "/").split("?")[0]!));
    const filePath = join(root, requestPath);
    if (!filePath.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, { "content-type": MEDIA_TYPES[extname(filePath)] ?? "application/octet-stream" }).end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}
