// Render the frames named on the command line (default 0 0.5 1) to output/frame-<t>.svg.
import { mkdirSync, writeFileSync } from 'node:fs';
import { renderFrameSvg } from './scene.mjs';

const times = process.argv.slice(2).map(Number);
mkdirSync('output', { recursive: true });
for (const t of times.length ? times : [0, 0.5, 1]) {
  writeFileSync(`output/frame-${t}.svg`, `${renderFrameSvg(t)}\n`);
}
