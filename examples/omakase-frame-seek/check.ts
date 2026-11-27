// Load a burnt-in-frame-number MP4 in Omakase Player, seek by frame index, screenshot the video, decode the number.
import { build } from "esbuild";
import { chromium } from "playwright";
import { createReadStream, statSync, writeFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "output");
const bitCount = 20;
const blockPx = 32;
const targetFrames = [0, 1, 2, 59, 60, 119, 7, 100, 23, 24, 0, 119, 58, 3];

mkdirSync(out, { recursive: true });
await build({ entryPoints: [join(here, "scene.ts")], bundle: true, format: "esm", target: "esnext", outfile: join(out, "scene.js"), loader: { ".css": "empty" }, logLevel: "error" });

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://x");
  if (url.pathname === "/") { response.setHeader("content-type", "text/html"); response.end(`<!doctype html><link rel="stylesheet" href="/omakase-player.css"><body style="margin:0;background:#000"><div id="player" style="width:640px;height:360px"></div><script type="module" src="/scene.js"></script>`); return; }
  const file = url.pathname === "/omakase-player.css" ? join(here, "node_modules/@byomakase/omakase-player/dist/omakase-player.css") : url.pathname === "/scene.js" ? join(out, "scene.js") : url.pathname === "/clip.mp4" ? join(out, "clip.mp4") : "";
  if (!file) { response.statusCode = 404; response.end(); return; }
  const size = statSync(file).size;
  const range = /bytes=(\d+)-(\d*)/.exec(request.headers.range ?? "");
  const type = file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : "video/mp4";
  if (!range) { response.writeHead(200, { "content-type": type, "content-length": size, "accept-ranges": "bytes" }); createReadStream(file).pipe(response); return; }
  const start = Number(range[1]);
  const end = range[2] ? Number(range[2]) : size - 1;
  response.writeHead(206, { "content-type": type, "content-range": `bytes ${start}-${end}/${size}`, "content-length": end - start + 1, "accept-ranges": "bytes" });
  createReadStream(file, { start, end }).pipe(response);
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = (server.address() as { port: number }).port;

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
const errors: string[] = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(`http://127.0.0.1:${port}/?src=${encodeURIComponent(`http://127.0.0.1:${port}/clip.mp4`)}`);
const loaded = await page.evaluate(() => window.__ready);

const decoder = await browser.newPage();
async function decodeBarcode(png: Buffer): Promise<number> {
  return decoder.evaluate(async ({ data, bits, block }) => {
    const image = new Image();
    await new Promise((resolve) => { image.onload = resolve; image.src = `data:image/png;base64,${data}`; });
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const scale = image.width / (bits * block);
    let value = 0;
    for (let bit = 0; bit < bits; bit++) {
      const red = context.getImageData(Math.round((bit + 0.5) * block * scale), Math.round(block * scale / 2), 1, 1).data[0] ?? 0;
      if (red > 127) value += 2 ** bit;
    }
    return value;
  }, { data: png.toString("base64"), bits: bitCount, block: blockPx });
}

const rows: { requested: number; reported: number; burnedIn: number }[] = [];
for (const requested of targetFrames) {
  const reported = await page.evaluate((frame) => window.__seekToFrame(frame), requested);
  await page.waitForTimeout(150);
  const png = await page.locator("video").first().screenshot();
  if (requested === 60) writeFileSync(join(out, "frame-60.png"), png);
  rows.push({ requested, reported, burnedIn: await decodeBarcode(png) });
}
await browser.close();
server.close();

const mismatches = rows.filter((row) => row.requested !== row.burnedIn || row.requested !== row.reported);
const summary = { durationSeconds: Number(loaded.duration.toFixed(3)), seeks: rows.length, burnedInMismatches: rows.filter((row) => row.requested !== row.burnedIn).map((row) => row.requested), reportedMismatches: rows.filter((row) => row.requested !== row.reported).map((row) => row.requested), pageErrors: errors.length };
writeFileSync(join(out, "rows.json"), `${JSON.stringify(rows)}\n`);
writeFileSync(join(out, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary), mismatches.length ? `mismatches: ${JSON.stringify(mismatches)}` : "all match");
