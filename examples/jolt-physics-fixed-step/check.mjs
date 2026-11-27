import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const raw = readFileSync('output/trajectory.json', 'utf8');
const { frames } = JSON.parse(raw);
const last = frames[frames.length - 1];
const minY = Math.min(...frames.flatMap((frame) => frame.map((p) => p[1])));
const checks = {
  frameCount: frames.length === 90,
  allFinite: frames.flat(2).every(Number.isFinite),
  startsAtDropHeight: frames[0].map((p) => p[1]).join() === '4,6,8',
  fellTowardFloor: last.every((p) => p[1] < 1),
  neverBelowFloor: minY > 0.4,
  bounced: frames.some((frame, i) => i > 0 && frame[0][1] > frames[i - 1][0][1]),
};
for (const [name, ok] of Object.entries(checks)) {
  if (!ok) { console.error(`FAIL: ${name}`); process.exit(1); }
}
const metrics = {
  frames: frames.length,
  trajectorySha256: createHash('sha256').update(raw).digest('hex'),
  finalPositions: last.map((p) => p.map((v) => Number(v.toFixed(4)))),
  minY: Number(minY.toFixed(4)),
};
writeFileSync('output/metrics.json', JSON.stringify(metrics, null, 2) + '\n');
