// Node side: bezier-easing(t). Browser side: Chromium's computed progress for the same cubic-bezier() string.
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import BezierEasing from 'bezier-easing';
import { curves, sampleCount, toleranceMax } from './curves.mjs';

const ts = Array.from({ length: sampleCount }, (_, i) => i / (sampleCount - 1));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<div id="probe" style="position:absolute;margin-left:0"></div>');
const chromiumProgress = await page.evaluate(({ curves, ts }) => {
  const probe = document.getElementById('probe');
  const result = {};
  for (const [name, [x1, y1, x2, y2]] of Object.entries(curves)) {
    const animation = probe.animate(
      { marginLeft: ['0px', '1000px'] },
      { duration: 1000, fill: 'both', easing: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})` },
    );
    animation.pause();
    result[name] = ts.map((t) => {
      animation.currentTime = t * 1000;
      return parseFloat(getComputedStyle(probe).marginLeft) / 1000;
    });
    animation.cancel();
  }
  return result;
}, { curves, ts });
const chromiumVersion = browser.version();
await browser.close();

const report = { chromiumVersion, curves: {} };
const plot = [];
for (const [name, points] of Object.entries(curves)) {
  const ease = BezierEasing(...points);
  const lib = ts.map((t) => ease(t));
  const maxAbsDiff = Math.max(...lib.map((v, i) => Math.abs(v - chromiumProgress[name][i])));
  report.curves[name] = {
    maxAbsDiffOver101Samples: Number(maxAbsDiff.toPrecision(2)),
    withinTolerance: maxAbsDiff <= toleranceMax,
    endpoints: [ease(0), ease(1)],
    peak: Number(Math.max(...lib).toFixed(3)),
  };
  plot.push({ name, lib, browser: chromiumProgress[name] });
}
mkdirSync('output', { recursive: true });
writeFileSync('output/report.json', `${JSON.stringify(report, null, 2)}\n`);
writeFileSync('output/curves.svg', plotSvg(plot));
const failed = Object.entries(report.curves).filter(([, c]) => !c.withinTolerance).map(([n]) => n);
if (failed.length) { console.error(`FAIL: beyond ${toleranceMax}: ${failed.join(', ')}`); process.exit(1); }

function plotSvg(series) {
  const cell = 220, pad = 20;
  const px = (t) => pad + t * (cell - 2 * pad);
  const py = (v) => cell - pad - ((v + 0.1) / 1.4) * (cell - 2 * pad);
  const line = (vals, stroke, dash) => `<polyline fill="none" stroke="${stroke}" stroke-width="2" ${dash ? 'stroke-dasharray="4 3"' : ''} points="${vals.map((v, i) => `${px(i / (vals.length - 1)).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}"/>`;
  const cells = series.map((s, i) => `<g transform="translate(${(i % 3) * cell},${Math.floor(i / 3) * cell})"><rect x="${pad}" y="${py(1)}" width="${cell - 2 * pad}" height="${py(0) - py(1)}" fill="none" stroke="#bbb"/>${line(s.browser, '#d33', true)}${line(s.lib, '#136', false)}<text x="${pad}" y="14" font-size="12" font-family="Helvetica">${s.name}</text></g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cell * 3}" height="${cell * 2}" viewBox="0 0 ${cell * 3} ${cell * 2}"><rect width="100%" height="100%" fill="white"/>${cells}</svg>\n`;
}
