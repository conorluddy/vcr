import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const expectedPath = path.join(here, 'expected', 'frames.json');
const record = process.argv.includes('--record');
const outputDir = path.join(here, 'output');
const bundleDir = path.join(outputDir, 'bundle');
const pngDir = path.join(outputDir, 'frames');
const chromePath = chromium.executablePath();
const chromeVersion = spawnSync(chromePath, ['--version'], { encoding: 'utf8' });
if (chromeVersion.status !== 0) throw new Error(`Cannot query Chrome version: ${chromeVersion.stderr}`);
const browserVersion = chromeVersion.stdout.trim();
if (!browserVersion.includes('156.0.8078.4')) throw new Error(`Unexpected Chrome version: ${browserVersion}`);

await mkdir(outputDir, { recursive: true });
await rm(bundleDir, { recursive: true, force: true });
await rm(pngDir, { recursive: true, force: true });
await mkdir(pngDir, { recursive: true });

const serveUrl = await bundle({
  entryPoint: path.join(here, 'src/index.jsx'),
  outDir: bundleDir,
  rootDir: here,
  enableCaching: false,
  onProgress: () => {},
});
const composition = await selectComposition({
  serveUrl,
  id: 'moving-square',
  browserExecutable: chromePath,
});
if (composition.width !== 64 || composition.height !== 48 || composition.durationInFrames !== 31) {
  throw new Error(`Unexpected composition metadata: ${JSON.stringify(composition)}`);
}

const expected = new Map([
  [0, { left: 8, right: 20, top: 18, bottom: 30 }],
  [15, { left: 24, right: 36, top: 18, bottom: 30 }],
  [30, { left: 40, right: 52, top: 18, bottom: 30 }],
]);
const hashes = new Map();
const results = new Map();

for (const order of [[0, 15, 30], [30, 0, 15]]) {
  for (const frame of order) {
    const output = path.join(pngDir, `frame-${frame}.png`);
    await renderStill({
      serveUrl,
      composition,
      frame,
      output,
      imageFormat: 'png',
      browserExecutable: chromePath,
      overwrite: true,
      logLevel: 'error',
    });
    const bytes = await readFile(output);
    const digest = createHash('sha256').update(bytes).digest('hex');
    const previous = hashes.get(frame);
    if (previous && previous !== digest) throw new Error(`Frame ${frame} changed between render orders`);
    hashes.set(frame, digest);

    const png = PNG.sync.read(bytes);
    if (png.width !== 64 || png.height !== 48) throw new Error(`Unexpected PNG dimensions ${png.width}x${png.height}`);
    let redPixels = 0;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < png.height; y += 1) {
      for (let x = 0; x < png.width; x += 1) {
        const offset = (y * png.width + x) * 4;
        const [red, green, blue, alpha] = png.data.subarray(offset, offset + 4);
        if (alpha !== 0 && (red !== 255 || green !== 0 || blue !== 0 || alpha !== 255)) {
          throw new Error(`Unexpected non-transparent pixel at ${x},${y}: ${[red, green, blue, alpha]}`);
        }
        if (red === 255 && green === 0 && blue === 0 && alpha === 255) {
          redPixels += 1;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    const bounds = { left: minX, right: maxX + 1, top: minY, bottom: maxY + 1 };
    const target = expected.get(frame);
    if (redPixels !== 144 || JSON.stringify(bounds) !== JSON.stringify(target)) {
      throw new Error(`Frame ${frame}: expected 144 red pixels and ${JSON.stringify(target)}, got ${redPixels} and ${JSON.stringify(bounds)}`);
    }
    results.set(frame, { bounds, redPixels, sha256: digest });
  }
}

const observation = {
  status: 'pass',
  remotion: '4.0.544',
  react: '19.3.1',
  node: process.version,
  os: `${os.type()} ${os.release()} (${os.arch()})`,
  browser: browserVersion,
  sequentialThenShuffled: Object.fromEntries([...results.entries()].map(([frame, result]) => [frame, result])),
};

if (record) {
  await mkdir(path.dirname(expectedPath), { recursive: true });
  await writeFile(expectedPath, `${JSON.stringify(observation, null, 2)}\n`);
} else {
  const expectedEvidence = JSON.parse(await readFile(expectedPath, 'utf8'));
  if (JSON.stringify(observation) !== JSON.stringify(expectedEvidence)) {
    throw new Error('Observed frame evidence differs from expected/frames.json; rerun with --record only after reviewing the change.');
  }
}

console.log(JSON.stringify(observation, null, 2));
