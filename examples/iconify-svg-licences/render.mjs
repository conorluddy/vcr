// Offline Iconify: pull icons from the local @iconify/json data, build SVG with @iconify/utils,
// and emit a credits manifest that classifies each set's licence handling. No network, no API.
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';

const require = createRequire(import.meta.url);
const jsonDirectory = require.resolve('@iconify/json/package.json').replace('package.json', '');
const readJson = (relativePath) => JSON.parse(readFileSync(jsonDirectory + relativePath, 'utf8'));

// What a credits step must do for each licence; anything unrecognised stays 'unknown', never 'free'.
export function classifyLicence(spdx) {
  if (!spdx) return 'unknown';
  if (/NC/.test(spdx)) return 'blocked-non-commercial';
  if (/^(A?GPL|LGPL)/.test(spdx)) return 'blocked-copyleft';
  if (/^CC-BY-SA/.test(spdx) || spdx === 'MPL-2.0') return 'share-alike-review';
  if (/^CC-BY-\d/.test(spdx) || spdx === 'OFL-1.1') return 'attribution-required';
  if (['MIT', 'ISC', 'Apache-2.0', 'BSD-3-Clause'].includes(spdx)) return 'notice-retained';
  return ['CC0-1.0', 'Unlicense'].includes(spdx) ? 'free' : 'unknown';
}

const requested = [
  { set: 'lucide', name: 'film' },
  { set: 'fa6-brands', name: 'github' },
  { set: 'simple-icons', name: 'ffmpeg' },
];

const collections = readJson('collections.json');
const setCounts = {};
for (const info of Object.values(collections)) {
  const handling = classifyLicence(info.license?.spdx);
  setCounts[handling] = (setCounts[handling] ?? 0) + 1;
}

mkdirSync('output', { recursive: true });
const credits = [];
for (const { set, name } of requested) {
  const data = getIconData(readJson(`json/${set}.json`), name);
  if (!data) throw new Error(`icon ${set}:${name} not found in @iconify/json`);
  const { attributes, body } = iconToSVG(data, { height: 96 });
  const svg = iconToHTML(replaceIDs(body), attributes).replace('<svg ', '<svg color="#111111" ');
  writeFileSync(`output/${set}-${name}.svg`, `${svg}\n`);
  const { license, author } = collections[set];
  credits.push({
    icon: `${set}:${name}`,
    licence: license.spdx,
    licenceUrl: license.url,
    author: author.name,
    handling: classifyLicence(license.spdx),
  });
}
writeFileSync('output/credits.json', `${JSON.stringify({ credits, setCounts }, null, 2)}\n`);
