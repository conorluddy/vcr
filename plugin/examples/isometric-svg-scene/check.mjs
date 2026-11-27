// Predeclared checks on the rendered frames; writes output/metrics.json (facts, never media).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { renderFrameSvg } from './scene.mjs';

const times = [0, 0.5, 1];
const expectedIds = ['scene', 'floor', ...['a', 'b'].flatMap((name) => ['top', 'front', 'side'].map((face) => `${name}-${face}`))];
const count = (svg, pattern) => (svg.match(pattern) ?? []).length;
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const fail = (message) => { throw new Error(message); };

// Frames rendered by render.mjs in a separate process, in sequential order.
const frames = Object.fromEntries(times.map((t) => [t, readFileSync(`output/frame-${t}.svg`, 'utf8').trimEnd()]));

// Same bytes when rendered in this process in shuffled order, and again after the others.
for (const t of [1, 0, 0.5, 0, 1]) {
  if (renderFrameSvg(t) !== frames[t]) fail(`frame t=${t} differs between processes or render order`);
}

const perFrame = times.map((t) => {
  const svg = frames[t];
  const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
  if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) fail(`t=${t}: ids ${ids} are not the explicit ones`);
  const banned = count(svg, /<animate|<text|<pattern|<image|<style|<script|font-family/g);
  if (banned !== 0) fail(`t=${t}: ${banned} animation, text, pattern, image or style elements`);
  const paths = count(svg, /<path\b/g);
  if (paths !== 7) fail(`t=${t}: expected 7 paths (floor + 2 blocks x 3 faces), got ${paths}`);
  const topTipY = Number(svg.match(/id="b-top"[^>]* d="M[\d.]+ ([\d.]+)/)[1]);
  return { t, paths, topTipY, sha256: sha256(svg) };
});

// Block b grows 3 world units; one unit is `scale` (40) pixels tall, so its top rises exactly 120 px.
const rise = perFrame[0].topTipY - perFrame[2].topTipY;
if (rise !== 120) fail(`expected block b to rise 120 px between t=0 and t=1, got ${rise}`);
if (new Set(perFrame.map((frame) => frame.sha256)).size !== 3) fail('frames are not all different');

writeFileSync('output/metrics.json', `${JSON.stringify({ frames: perFrame, risePx: rise, lengthBytes: perFrame.map((frame) => frames[frame.t].length) }, null, 2)}\n`);
