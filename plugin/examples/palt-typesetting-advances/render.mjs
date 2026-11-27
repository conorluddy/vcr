// Typeset Japanese with palt-typesetting in Node, then measure palt on/off advances in Chromium with a pinned Noto Sans JP.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import Typesetter from 'palt-typesetting';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const packageInfo = (name) => {
  const directory = dirname(require.resolve(`${name}/package.json`));
  return { directory, json: JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')) };
};
const fontPackage = packageInfo('@fontsource/noto-sans-jp');
const libraryPackage = packageInfo('palt-typesetting');
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

const sourceText = 'ようこそ、VCRへ。「かなのつめ組み」とEnglishの混植です。';
const typesetHtml = new Typesetter().render(sourceText);
const typesetHtmlAgain = new Typesetter().render(sourceText);

mkdirSync('output', { recursive: true });
const stylesheet = pathToFileURL(join(fontPackage.directory, '400.css')).href;
const libraryCss = pathToFileURL(join(libraryPackage.directory, 'dist', 'typesetter.css')).href;
const pageHtml = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="${stylesheet}"><link rel="stylesheet" href="${libraryCss}">
<style>html,body{margin:0;background:#fff}div{margin:24px;font:400 48px/1.4 'Noto Sans JP',sans-serif;color:#111;white-space:nowrap}
.palt{font-feature-settings:'palt'}</style>
<div id="off">${sourceText}</div><div id="on" class="palt">${sourceText}</div>
<div id="typeset-off">${typesetHtml}</div><div id="typeset-on" class="palt">${typesetHtml}</div>`;

const browser = await chromium.launch();
async function measure(name) {
  const htmlPath = resolve('output', `${name}.html`);
  writeFileSync(htmlPath, pageHtml);
  const page = await browser.newPage({ viewport: { width: 1500, height: 440 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate((text) => document.fonts.load('400 48px "Noto Sans JP"', text), sourceText);
  await page.evaluate(() => document.fonts.ready);
  const facts = await page.evaluate(() => {
    const round = (value) => Math.round(value * 100) / 100;
    const advances = (id) => {
      const textNode = document.getElementById(id).firstChild;
      const range = document.createRange();
      return [...textNode.textContent].map((_, index) => {
        range.setStart(textNode, index);
        range.setEnd(textNode, index + 1);
        return round(range.getBoundingClientRect().width);
      });
    };
    const blockWidth = (id) => {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(id));
      return round(range.getBoundingClientRect().width);
    };
    return {
      loadedFaces: [...document.fonts].filter((face) => face.status === 'loaded').length,
      offAdvances: advances('off'),
      onAdvances: advances('on'),
      offWidthPx: blockWidth('off'),
      onWidthPx: blockWidth('on'),
      typesetOffWidthPx: blockWidth('typeset-off'),
      typesetOnWidthPx: blockWidth('typeset-on'),
      thinSpaceCount: document.querySelectorAll('#typeset-off .typesetting-thin-space').length,
    };
  });
  const png = await page.screenshot({ path: resolve('output', `${name}.png`) });
  await page.close();
  return { facts, pngSha256: sha256(png) };
}
const first = await measure('palt');
const second = await measure('palt-again');
const chromiumVersion = browser.version();
await browser.close();

const { offAdvances, onAdvances } = first.facts;
const characters = [...sourceText];
const metrics = {
  library: `${libraryPackage.json.name}@${libraryPackage.json.version}`,
  libraryLicense: libraryPackage.json.license,
  font: `${fontPackage.json.name}@${fontPackage.json.version}`,
  fontLicense: fontPackage.json.license,
  typesetHtmlSha256: sha256(typesetHtml),
  typesetHtml,
  renderIdenticalAcrossInstances: typesetHtml === typesetHtmlAgain,
  pngIdenticalAcrossPages: first.pngSha256 === second.pngSha256,
  characterCount: characters.length,
  narrowedCharacters: characters.filter((_, index) => onAdvances[index] < offAdvances[index]).join(''),
  widenedCount: onAdvances.filter((value, index) => value > offAdvances[index]).length,
  ...first.facts,
};
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
writeFileSync('output/chromium-version.txt', `${chromiumVersion}\n`);
