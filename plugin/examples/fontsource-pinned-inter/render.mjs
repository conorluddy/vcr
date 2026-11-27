// Load @fontsource/inter CSS in Chromium, wait on document.fonts.ready, and record facts a script can diff.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const packageDirectory = dirname(require.resolve('@fontsource/inter/package.json'));
const packageJson = JSON.parse(readFileSync(join(packageDirectory, 'package.json'), 'utf8'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const woff2Hashes = Object.fromEntries(
  ['400', '700'].map((weight) => [
    `inter-latin-${weight}-normal.woff2`,
    sha256(readFileSync(join(packageDirectory, 'files', `inter-latin-${weight}-normal.woff2`))),
  ]),
);

mkdirSync('output', { recursive: true });
const stylesheets = ['400', '700'].map((weight) => pathToFileURL(join(packageDirectory, `${weight}.css`)).href);
const pageHtml = (withFontsource) => `<!doctype html><meta charset="utf-8">
${withFontsource ? stylesheets.map((href) => `<link rel="stylesheet" href="${href}">`).join('') : ''}
<style>html,body{margin:0;background:#fff}h1{margin:24px;font:700 72px/1.2 'Inter',sans-serif;color:#111}
p{margin:24px;font:400 40px/1.3 'Inter',sans-serif;color:#111}</style>
<h1><span>Fontsource pins Inter</span></h1><p><span>Same bytes in every render, 0123456789.</span></p>`;

const browser = await chromium.launch();
async function capture(name, withFontsource) {
  const htmlPath = resolve('output', `${name}.html`);
  writeFileSync(htmlPath, pageHtml(withFontsource));
  const page = await browser.newPage({ viewport: { width: 1000, height: 260 }, deviceScaleFactor: 1 });
  const fontRequests = [];
  page.on('request', (request) => { if (request.url().endsWith('.woff2')) fontRequests.push(request.url().split('/').pop()); });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(() => document.fonts.ready);
  const facts = await page.evaluate(() => ({
    loadedFaces: [...document.fonts].filter((face) => face.status === 'loaded').map((face) => `${face.family} ${face.weight}`).sort(),
    declaredFaces: document.fonts.size,
    headingWidthPx: Math.round(document.querySelector('h1 span').getBoundingClientRect().width),
    textWidthPx: Math.round(document.querySelector('p span').getBoundingClientRect().width),
  }));
  const png = await page.screenshot({ path: resolve('output', `${name}.png`) });
  await page.close();
  return { facts, fontRequests: fontRequests.sort(), pngSha256: sha256(png) };
}

const first = await capture('inter', true);
const second = await capture('inter-again', true);
const control = await capture('control', false);
const chromiumVersion = browser.version();
await browser.close();

if (first.pngSha256 !== second.pngSha256) throw new Error('FAIL: Inter PNG differs between two renders');
if (first.pngSha256 === control.pngSha256) throw new Error('FAIL: Inter render equals the no-fontsource control');

const metrics = {
  package: `${packageJson.name}@${packageJson.version}`,
  packageLicense: packageJson.license,
  woff2Sha256: woff2Hashes,
  withFontsource: { ...first.facts, woff2Requests: first.fontRequests },
  control: { ...control.facts, woff2Requests: control.fontRequests },
  pngByteStableAcrossPages: first.pngSha256 === second.pngSha256,
  controlDiffers: first.pngSha256 !== control.pngSha256,
};
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
writeFileSync('output/chromium-version.txt', `${chromiumVersion}\n`);
