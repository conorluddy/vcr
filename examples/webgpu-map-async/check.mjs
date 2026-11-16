import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const sceneHtml = await readFile(path.join(here, 'scene.html'), 'utf8');
assert.doesNotMatch(sceneHtml, /getContext|WebGL/i, 'fixture must not request or use WebGL');
const server = createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  response.end(sceneHtml);
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    timeout: 30_000,
    args: [
      '--enable-features=Vulkan',
      '--use-angle=swiftshader',
      '--use-vulkan=swiftshader',
      '--use-webgpu-adapter=swiftshader',
      '--disable-vulkan-surface',
      '--enable-unsafe-webgpu',
    ],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(25_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const port = server.address().port;
  await page.goto('http://127.0.0.1:' + port + '/', { waitUntil: 'load', timeout: 20_000 });
  const result = await page.evaluate(() => window.runWebGPUCompute(), { timeout: 25_000 });
  assert.deepEqual(errors, [], 'browser page errors: ' + errors.join('; '));
  assert.equal(result.secureContext, true);
  assert.equal(result.webgpuUsed, true);
  assert.equal(result.adapter.vendor, 'google');
  assert.equal(result.adapter.architecture, 'swiftshader');
  assert.equal(result.shaderErrorCount, 0);
  assert.equal(result.mappedReadCount, 3);
  const expectedValues = [0.5, 3.5, -5.5, 1.25, 11, -4, 7.25, 0.125];
  for (const values of result.outputs) assert.deepEqual(values, expectedValues);
  const outputHashes = result.outputs.map(values => createHash('sha256')
    .update(Buffer.from(new Float32Array(values).buffer))
    .digest('hex'));
  assert.equal(new Set(outputHashes).size, 1, 'repeated WebGPU dispatch results differed');
  const metrics = {
    playwrightVersion: JSON.parse(await readFile(path.join(here, 'node_modules/playwright/package.json'), 'utf8')).version,
    chromiumVersion: browser.version(),
    webgpuUsed: result.webgpuUsed,
    webglApiUsed: false,
    secureContext: result.secureContext,
    adapter: result.adapter,
    adapterFeatures: result.features,
    maxComputeWorkgroupSizeX: result.maxComputeWorkgroupSizeX,
    shaderErrorCount: result.shaderErrorCount,
    mappedReadCount: result.mappedReadCount,
    inputValues: result.inputValues,
    expectedValues,
    outputs: result.outputs,
    outputHashes,
  };
  assert.equal(metrics.playwrightVersion, '1.64.1');
  assert.equal(metrics.chromiumVersion, '156.0.8078.4');
  const expectedPath = path.join(here, 'expected/metrics.json');
  if (process.argv[2] === '--record') await writeFile(expectedPath, JSON.stringify(metrics, null, 2) + '\n');
  else assert.deepEqual(metrics, JSON.parse(await readFile(expectedPath, 'utf8')));
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}
