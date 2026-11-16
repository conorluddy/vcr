import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {mkdir, readFile, readdir, rm, stat, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {PNG} from 'pngjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(here, 'output');
const framesDir = path.join(outputDir, 'project');
const expectedPath = path.join(here, 'expected', 'render.json');
const record = process.argv.includes('--record');
const require = createRequire(import.meta.url);
const corePackage = require('@motion-canvas/core/package.json');
const vitePackage = require('vite/package.json');
const chromePath = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const expectedFrameCount = 11;
const port = Number(process.env.MOTION_CANVAS_PORT || 9047);

await rm(outputDir, {recursive: true, force: true});
await mkdir(outputDir, {recursive: true});
const server = spawn(process.execPath, [path.join(here, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: here,
  stdio: 'ignore',
});

let browser;
try {
  const url = `http://127.0.0.1:${port}/`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Vite exited early with code ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error(`Motion Canvas editor did not start at ${url}`);

  browser = await chromium.launch({headless: true, executablePath: chromePath, args: ['--no-sandbox']});
  const browserVersion = browser.version();
  if (!browserVersion.includes('157.0.8103.51')) throw new Error(`Unexpected Chrome version ${browserVersion}; update the reviewed fixture before recording.`);
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'networkidle'});
  await page.getByRole('spinbutton').nth(1).fill('5');
  await page.getByRole('spinbutton').nth(2).fill('64');
  await page.getByRole('spinbutton').nth(3).fill('48');

  const collect = async () => {
    await page.getByRole('button', {name: 'Render', exact: true}).click();
    let filenames = [];
    for (let attempt = 0; attempt < 150; attempt += 1) {
      filenames = (await readdir(framesDir).catch(() => [])).filter(name => /^\d{6}\.png$/.test(name)).sort();
      if (filenames.length === expectedFrameCount) {
        const sizes = await Promise.all(filenames.map(async name => (await stat(path.join(framesDir, name))).size));
        await new Promise(resolve => setTimeout(resolve, 300));
        const settledSizes = await Promise.all(filenames.map(async name => (await stat(path.join(framesDir, name))).size));
        if (sizes.every((size, index) => size === settledSizes[index])) break;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (filenames.length !== expectedFrameCount) throw new Error(`Expected ${expectedFrameCount} PNGs, found ${filenames.length}`);
    return Promise.all(filenames.map(async name => {
      const bytes = await readFile(path.join(framesDir, name));
      const png = PNG.sync.read(bytes);
      if (png.width !== 64 || png.height !== 48) throw new Error(`${name}: expected 64x48, found ${png.width}x${png.height}`);
      let alphaPixels = 0;
      let left = png.width;
      let top = png.height;
      let right = -1;
      let bottom = -1;
      for (let y = 0; y < png.height; y += 1) {
        for (let x = 0; x < png.width; x += 1) {
          const alpha = png.data[(y * png.width + x) * 4 + 3];
          if (alpha > 0) {
            alphaPixels += 1;
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x + 1);
            bottom = Math.max(bottom, y + 1);
          }
        }
      }
      if (alphaPixels === 0) throw new Error(`${name}: rendered frame is fully transparent`);
      return {
        name,
        width: png.width,
        height: png.height,
        alphaPixels,
        alphaBounds: {left, top, right, bottom},
        sha256: createHash('sha256').update(bytes).digest('hex'),
      };
    }));
  };

  const first = await collect();
  const second = await collect();
  for (let index = 0; index < expectedFrameCount; index += 1) {
    if (first[index].sha256 !== second[index].sha256) throw new Error(`${first[index].name} changed between editor renders`);
  }
  const observation = {
    status: 'pass',
    motionCanvas: corePackage.version,
    vite: vitePackage.version,
    node: process.version,
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    browser: `Chrome ${browserVersion}`,
    resolution: [64, 48],
    frameCount: expectedFrameCount,
    frames: first,
  };
  const serialized = `${JSON.stringify(observation, null, 2)}\n`;
  if (record) {
    await mkdir(path.dirname(expectedPath), {recursive: true});
    await writeFile(expectedPath, serialized);
  } else {
    const expected = await readFile(expectedPath, 'utf8');
    if (JSON.stringify(JSON.parse(expected)) !== JSON.stringify(observation)) {
      throw new Error('Observed output differs from expected/render.json; inspect it and rerun with --record only after review.');
    }
  }
  console.log(serialized);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
