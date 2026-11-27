// Facts a script can diff: per-icon SVG structure and hash, licence handling, and set-wide licence counts.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const { credits, setCounts } = JSON.parse(readFileSync('output/credits.json', 'utf8'));
const expectedHandling = {
  'lucide:film': 'notice-retained',
  'fa6-brands:github': 'attribution-required',
  'simple-icons:ffmpeg': 'free',
};
const icons = credits.map((credit) => {
  const svg = readFileSync(`output/${credit.icon.replace(':', '-')}.svg`, 'utf8');
  if (expectedHandling[credit.icon] !== credit.handling) {
    throw new Error(`${credit.icon}: expected handling ${expectedHandling[credit.icon]}, got ${credit.handling}`);
  }
  if (/<(text|image|script)\b|font-family/.test(svg)) throw new Error(`${credit.icon}: SVG is not path/shape only`);
  return {
    icon: credit.icon,
    licence: credit.licence,
    handling: credit.handling,
    viewBox: svg.match(/viewBox="([^"]+)"/)?.[1],
    size: `${svg.match(/ width="([^"]+)"/)?.[1]}x${svg.match(/ height="([^"]+)"/)?.[1]}`,
    sha256: createHash('sha256').update(svg).digest('hex'),
  };
});
const total = Object.values(setCounts).reduce((sum, count) => sum + count, 0);
if (setCounts.unknown) throw new Error(`${setCounts.unknown} sets have an unclassified licence`);
writeFileSync('output/metrics.json', `${JSON.stringify({ icons, setCounts, totalSets: total }, null, 2)}\n`);
