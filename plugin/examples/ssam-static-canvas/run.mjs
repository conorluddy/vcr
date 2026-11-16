import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "output");
const expectedPath = path.join(here, "expected/result.json");
const mode = process.argv[2] ?? "";
const ssamVersion = JSON.parse(fs.readFileSync(path.join(here, "node_modules/ssam/package.json"), "utf8")).version;
const viteVersion = JSON.parse(fs.readFileSync(path.join(here, "node_modules/vite/package.json"), "utf8")).version;
const playwrightPath = process.env.VCR_PLAYWRIGHT_PATH ?? path.join(os.homedir(), ".vcr/runtime/node_modules/playwright");
const require = createRequire(import.meta.url);
const { chromium } = require(playwrightPath);
if (ssamVersion !== "0.22.0" || viteVersion !== "8.3.5") throw new Error(`Unexpected versions: ssam ${ssamVersion}, Vite ${viteVersion}`);
if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
fs.mkdirSync(out, { recursive: true });

const portProbe = net.createServer();
await new Promise((resolve, reject) => portProbe.once("error", reject).listen(0, "127.0.0.1", resolve));
const port = portProbe.address().port;
await new Promise((resolve) => portProbe.close(resolve));
const vite = spawn(process.execPath, [path.join(here, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  cwd: here,
  stdio: "ignore",
});
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

  async function renderPass(index) {
    const page = await browser.newPage();
    try {
      await page.goto(url);
      await page.waitForFunction(() => window.__ssamDrawCount > 0, { timeout: 15000 });
      const result = await page.evaluate(() => {
        const canvases = [...document.querySelectorAll("canvas")];
        if (canvases.length !== 1) throw new Error(`Expected one Ssam canvas, found ${canvases.length}`);
        const canvas = canvases[0];
        const ctx = canvas.getContext("2d");
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return {
          width: canvas.width,
          height: canvas.height,
          draw_count: window.__ssamDrawCount,
          rgba_base64: btoa(String.fromCharCode(...image.data)),
          preview_png: canvas.toDataURL("image/png"),
        };
      });
      const bytes = Buffer.from(result.rgba_base64, "base64");
      const expected = [
        { rgba: [255, 0, 0, 255], x0: 0, y0: 0 },
        { rgba: [0, 255, 0, 255], x0: 16, y0: 0 },
        { rgba: [0, 0, 255, 255], x0: 0, y0: 16 },
        { rgba: [255, 255, 255, 255], x0: 16, y0: 16 },
      ];
      if (result.width !== 32 || result.height !== 32 || bytes.length !== 32 * 32 * 4) throw new Error(`Unexpected canvas metrics ${result.width}x${result.height}, ${bytes.length} RGBA bytes`);
      const quadrants = [];
      for (const region of expected) {
        let exact = 0;
        for (let y = region.y0; y < region.y0 + 16; y++) {
          for (let x = region.x0; x < region.x0 + 16; x++) {
            const i = (y * 32 + x) * 4;
            if (region.rgba.every((v, c) => bytes[i + c] === v)) exact++;
          }
        }
        if (exact !== 256) throw new Error(`Expected 256 exact ${region.rgba} pixels, found ${exact}`);
        quadrants.push({ rgba: region.rgba, exact_pixels: exact });
      }
      fs.writeFileSync(path.join(out, `preview-${index}.png`), Buffer.from(result.preview_png.split(",")[1], "base64"));
      return {
        width: result.width,
        height: result.height,
        rgba_sha256: (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex"),
        quadrants,
      };
    } finally {
      await page.close();
    }
  }

  const first = await renderPass(1);
  const second = await renderPass(2);
  if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error(`Fresh Ssam manager renders differ: ${JSON.stringify({ first, second })}`);
  const metrics = {
    ssam: ssamVersion,
    vite: viteVersion,
    node: process.version,
    playwright: require(`${playwrightPath}/package.json`).version,
    browser: `Chrome for Testing ${browserVersion}`,
    host: `${os.type()} ${os.release()} ${os.arch()}`,
    hostname: os.hostname(),
    repeat_matches: true,
    render: first,
  };
  const rendered = JSON.stringify(metrics, null, 2) + "\n";
  if (mode === "--record") {
    fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
    fs.writeFileSync(expectedPath, rendered);
    console.log(`RECORDED ${expectedPath}`);
  } else {
    if (fs.readFileSync(expectedPath, "utf8") !== rendered) throw new Error(`metrics differ from ${expectedPath}:\n${rendered}`);
    console.log("OK: Ssam canvas size, exact pixels and fresh-manager repeat match expected/result.json");
  }
  console.log(rendered);
} finally {
  if (browser) await browser.close();
  vite.kill("SIGTERM");
}
