import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({
  headless: true,
  timeout: 30_000,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(pathToFileURL(path.join(here, 'scene.html')).href, { waitUntil: 'load', timeout: 30_000 });
  const setup = await page.evaluate(() => ({
    width: window.fixture.width,
    height: window.fixture.height,
    glVersion: window.fixture.glVersion,
    shadingLanguageVersion: window.fixture.shadingLanguageVersion,
    vendor: window.fixture.vendor,
    renderer: window.fixture.renderer,
    contextAttributes: window.fixture.contextAttributes,
  }));
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join('; ')}`);
  assert.equal(setup.width, 96);
  assert.equal(setup.height, 72);
  assert.match(setup.glVersion, /^WebGL 1\.0/);
  assert.match(setup.renderer, /SwiftShader/i, `unexpected WebGL renderer: ${setup.renderer}`);

  const sequential = await page.evaluate(() => [0, 0.5, 1].map(time => {
    const frame = window.fixture.render(time);
    return { time, hash: frame.hash, pixels: frame.pixels };
  }));
  const shuffled = await page.evaluate(() => [1, 0, 0.5].map(time => {
    const frame = window.fixture.render(time);
    return { time, hash: frame.hash, pixels: frame.pixels };
  }));
  assert.deepEqual(shuffled.map(frame => frame.hash), [sequential[2].hash, sequential[0].hash, sequential[1].hash]);
  assert.equal(new Set(sequential.map(frame => frame.hash)).size, 3, 'time samples should render distinct positions');
  const middle = sequential[1].pixels;
  assert.equal(middle.length, 96 * 72 * 4);
  const changed = [];
  const triangle = [];
  for (let y = 0; y < 72; y++) {
    for (let x = 0; x < 96; x++) {
      const i = (y * 96 + x) * 4;
      const [r, g, b, a] = middle.slice(i, i + 4);
      if (r !== 16 || g !== 24 || b !== 40 || a !== 255) changed.push([x, y]);
      if (g > 150 && r < 80 && b > 90) triangle.push([x, y]);
    }
  }
  assert.ok(triangle.length > 500, `triangle pixel count too small: ${triangle.length}`);
  const xs = triangle.map(([x]) => x);
  const ys = triangle.map(([, y]) => y);
  const metrics = {
    playwrightVersion: JSON.parse(await readFile(path.join(here, 'node_modules/playwright/package.json'), 'utf8')).version,
    chromiumVersion: browser.version(),
    ...setup,
    sequentialHashes: sequential.map(frame => frame.hash),
    shuffledHashes: shuffled.map(frame => frame.hash),
    readPixelsBytes: middle.length,
    changedPixels: changed.length,
    trianglePixels: triangle.length,
    triangleBoundsBottomLeft: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    middleFrameReadPixelsHash: sequential[1].hash,
  };
  assert.deepEqual(metrics.contextAttributes, {
    alpha: false,
    antialias: false,
    depth: false,
    desynchronized: false,
    failIfMajorPerformanceCaveat: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    powerPreference: 'default',
    stencil: false,
    xrCompatible: false,
  });
  await page.evaluate(() => window.fixture.render(0.5));
  await page.locator('#scene').screenshot({ path: path.join(here, 'output/triangle.png') });
  const expectedPath = path.join(here, 'expected/metrics.json');
  if (process.argv[2] === '--record') await writeFile(expectedPath, `${JSON.stringify(metrics, null, 2)}\n`);
  else assert.deepEqual(metrics, JSON.parse(await readFile(expectedPath, 'utf8')));
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await browser.close();
}
