// Pure core only (no DOM, spring or clock): resampleIcon -> buildPlan -> interpPolar -> serialize.
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildPlan, interpPolar, resampleIcon, serialize } from 'morphicons';

const menu = 'M4 6h16M4 12h16M4 18h16'; // Lucide "menu"
const close = 'M18 6 6 18M6 6l12 12'; // Lucide "x"
const progressValues = [0, 0.25, 0.5, 0.75, 1];

const plan = buildPlan(resampleIcon(menu), resampleIcon(close));
const outputs = plan.items.map((item) => new Float64Array(item.a.length));
const closedFlags = plan.items.map((item) => item.closed);

const pathAt = (progress) => {
  interpPolar(plan, progress, outputs);
  return serialize(outputs, closedFlags);
};
const wrap = (d) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="240" height="240" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>\n`;

mkdirSync('output', { recursive: true });
const frames = progressValues.map((progress) => ({ progress, d: pathAt(progress) }));
frames.forEach(({ progress, d }) => writeFileSync(`output/frame-${progress}.svg`, wrap(d)));
writeFileSync('output/frames.json', `${JSON.stringify({ subpaths: plan.items.length, frames }, null, 2)}\n`);
// Asking for the same progress again must give the same bytes: no hidden state between calls.
if (pathAt(0.5) !== frames[2].d) throw new Error('interpPolar is not a pure function of progress');
