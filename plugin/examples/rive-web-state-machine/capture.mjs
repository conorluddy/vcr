import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const browserPath = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outputDir = new URL('../../output/rive-web-state-machine/', import.meta.url);
await mkdir(outputDir, {recursive: true});
const browser = await chromium.launch({headless: true, executablePath: browserPath});
try {
  const page = await browser.newPage({viewport: {width: 256, height: 256}, deviceScaleFactor: 1});
  page.on('pageerror', (error) => { throw error; });
  await page.goto('http://127.0.0.1:4173', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.__ready || window.__error, {timeout: 20000});
  const error = await page.evaluate(() => window.__error);
  if (error) throw new Error(`Rive runtime failed to load: ${error}`);
  const digest = async (name) => page.evaluate(async (name) => {
    const canvas = document.querySelector('canvas');
    const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    const colorAt = (x, y) => Array.from(rgba.slice((y * canvas.width + x) * 4, (y * canvas.width + x) * 4 + 3));
    return {name, centerRgb: colorAt(128, 128), ringRgb: colorAt(128, 35)};
  }, name);
  const capture = async (name) => {
    const measurement = await digest(name);
    const png = await page.locator('canvas').evaluate((canvas) => canvas.toDataURL('image/png'));
    await writeFile(new URL(`${name}.png`, outputDir), Buffer.from(png.split(',')[1], 'base64'));
    return measurement;
  };
  const setState = async (outer, inner) => {
    await page.evaluate(({outer, inner}) => {
      window.__rive.setBooleanStateAtPath('CircleOuterState', outer, 'CircleOuter');
      window.__rive.setBooleanStateAtPath('CircleInnerState', inner, 'CircleOuter/CircleInner');
    }, {outer, inner});
    await page.waitForTimeout(500);
  };
  await page.waitForTimeout(500);
  const initial = await capture('initial');
  await setState(true, true);
  const bothInputsTrue = await capture('both-inputs-true');
  await setState(false, false);
  const bothInputsFalse = await capture('both-inputs-false');
  if (bothInputsTrue.centerRgb[0] <= bothInputsTrue.centerRgb[1]) throw new Error('Expected the inner true-state color at the canvas center');
  if (bothInputsTrue.ringRgb[1] <= bothInputsTrue.ringRgb[0]) throw new Error('Expected the outer true-state color on the ring');
  if (initial.centerRgb[0] !== initial.centerRgb[1] || bothInputsFalse.centerRgb[0] !== bothInputsFalse.centerRgb[1]) throw new Error('Expected the default and false states to show the neutral inner circle');
  const result = {
    tool: '@rive-app/canvas',
    version: '2.49.1',
    browser: browser.version(),
    viewport: [256, 256],
    checks: {
      bothInputsTrueChangesInnerCircle: true,
      bothInputsTrueChangesOuterRing: true,
      bothInputsFalseRestoresNeutralInnerCircle: true,
    },
    samples: {initial, bothInputsTrue, bothInputsFalse},
    limits: 'State-machine playback and nested boolean input response only; not a seekable or frame-deterministic capture route.',
  };
  if (process.argv.includes('--record')) {
    await writeFile(new URL('expected/state-machine.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  await browser.close();
}
