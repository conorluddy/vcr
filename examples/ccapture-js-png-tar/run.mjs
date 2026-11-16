import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import net from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "output");
const expectedPath = path.join(here, "expected/result.json");
const packageJson = JSON.parse(fs.readFileSync(path.join(here, "node_modules/ccapture.js/package.json"), "utf8"));
const viteVersion = JSON.parse(fs.readFileSync(path.join(here, "node_modules/vite/package.json"), "utf8")).version;
const playwrightPath = process.env.VCR_PLAYWRIGHT_PATH ?? path.join(os.homedir(), ".vcr/runtime/node_modules/playwright");
const require = createRequire(import.meta.url);
const { chromium } = require(playwrightPath);
const mode = process.argv[2] ?? "";
if (packageJson.version !== "2.0.0" || viteVersion !== "8.3.5") throw new Error(`Unexpected versions: ccapture.js ${packageJson.version}, Vite ${viteVersion}`);
if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
fs.mkdirSync(out, { recursive: true });

function bounded(promise, label, milliseconds) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} exceeded ${milliseconds} ms`)), milliseconds);
    }),
  ]).finally(() => clearTimeout(timer));
}

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
  await page.goto(url, { timeout: 15000 });
  await page.waitForFunction(() => typeof window.captureWithCCapture === "function", { timeout: 15000 });

  async function capturePass(index) {
    const captured = await bounded(page.evaluate(() => window.captureWithCCapture()), `CCapture pass ${index}`, 20000);
    const tarPath = path.join(out, `capture-${index}.tar`);
    fs.writeFileSync(tarPath, Buffer.from(captured.tar_base64, "base64"));
    const listing = spawnSync("tar", ["-tf", tarPath], { encoding: "utf8" });
    if (listing.status !== 0) throw new Error(`Invalid CCapture TAR: ${listing.stderr}`);
    const members = listing.stdout.split(/\r?\n/).filter((entry) => entry.toLowerCase().endsWith(".png"));
    if (members.length !== 3) throw new Error(`Expected 3 PNG members in TAR, found ${members.length}: ${listing.stdout}`);
    const extractDir = path.join(out, `extract-${index}`);
    fs.mkdirSync(extractDir, { recursive: true });
    const extraction = spawnSync("tar", ["-xf", tarPath, "-C", extractDir], { encoding: "utf8" });
    if (extraction.status !== 0) throw new Error(`TAR extraction failed: ${extraction.stderr}`);
    const files = members.map((member) => path.join(extractDir, member)).sort();
    const pngs = files.map((file) => fs.readFileSync(file).toString("base64"));
    const inspected = await page.evaluate(async (pngs) => {
      const expected = [[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]];
      const results = [];
      for (let frame = 0; frame < pngs.length; frame++) {
        const binary = atob(pngs[frame]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let exact = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (expected[frame].every((value, c) => pixels[i + c] === value)) exact++;
        }
        results.push({
          width: canvas.width,
          height: canvas.height,
          rgba: expected[frame],
          exact_pixels: exact,
          raw_rgba_base64: btoa(String.fromCharCode(...pixels)),
        });
      }
      return results;
    }, pngs);
    for (let i = 0; i < inspected.length; i++) {
      if (inspected[i].width !== 32 || inspected[i].height !== 32 || inspected[i].exact_pixels !== 1024) {
        throw new Error(`Frame ${i} pixels/dimensions mismatch: ${JSON.stringify(inspected[i])}`);
      }
      fs.copyFileSync(files[i], path.join(out, `preview-${index}-${i}.png`));
    }
    return {
      member_count: members.length,
      frames: inspected.map((frame, i) => ({
        index: i,
        width: frame.width,
        height: frame.height,
        rgba: frame.rgba,
        exact_pixels: frame.exact_pixels,
        raw_pixel_sha256: crypto.createHash("sha256").update(Buffer.from(frame.raw_rgba_base64, "base64")).digest("hex"),
      })),
    };
  }

  const first = await capturePass(1);
  const second = await capturePass(2);
  if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error("Repeat semantic frame metrics differ");
  const metrics = {
    ccapture_js: packageJson.version,
    vite: viteVersion,
    node: process.version,
    playwright: require(`${playwrightPath}/package.json`).version,
    browser: `Chrome for Testing ${browserVersion}`,
    host: `${os.type()} ${os.release()} ${os.arch()}`,
    hostname: os.hostname(),
    format: "png TAR",
    captures: 2,
    semantic_repeat_matches: true,
    first,
    second,
  };
  const rendered = JSON.stringify(metrics, null, 2) + "\n";
  if (mode === "--record") {
    fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
    fs.writeFileSync(expectedPath, rendered);
    console.log(`RECORDED ${expectedPath}`);
  } else {
    if (fs.readFileSync(expectedPath, "utf8") !== rendered) throw new Error(`metrics differ from ${expectedPath}:\n${rendered}`);
    console.log("OK: CCapture PNG TAR frame count, pixels and repeat metrics match expected/result.json");
  }
  console.log(rendered);
} finally {
  if (browser) await browser.close();
  vite.kill("SIGTERM");
}
