import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const [assetId, fileName] = process.argv.slice(2);
const fail = (message) => { console.error(`FAIL: ${message}`); process.exit(1); };

const api = JSON.parse(readFileSync('output/cache/api.json', 'utf8'));
if (api.numberOfResults !== 1) fail(`expected 1 asset for id=${assetId}, got ${api.numberOfResults}`);
const asset = api.foundAssets[0];
if (asset.assetId !== assetId || asset.dataType !== 'Material') fail('asset id or type differs from the pin');

const listed = asset.downloadFolders.default.downloadFiletypeCategories.zip.downloads.find((d) => d.fileName === fileName);
if (!listed) fail(`${fileName} not listed by the API`);

const zipBytes = readFileSync(`output/cache/${fileName}`);
if (zipBytes.length !== listed.size) fail(`ZIP is ${zipBytes.length} bytes, API reports ${listed.size}`);

// Predeclared: the API payload carries a licence field. It does not; the licence is stated on the docs site only.
const payloadLicenceField = Object.keys(asset).some((k) => /licen[cs]e|copyright|rights/i.test(k));
if (!payloadLicenceField) console.log('KNOWN FAIL: API payload has no licence field; CC0 rests on docs.ambientcg.com/license only');

const docs = readFileSync('output/cache/license.html', 'utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const docsStatesCc0 = docs.includes('All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License');
if (!docsStatesCc0) fail('licence page no longer carries the CC0 sentence');

const dir = 'output/unzipped';
const members = Object.fromEntries(readdirSync(dir).sort().map((n) => [n, statSync(`${dir}/${n}`).size]));
const mapPath = (suffix) => `${dir}/${assetId}_1K-JPG_${suffix}.jpg`;
const magick = (...args) => execFileSync('magick', args, { encoding: 'utf8' }).trim();
const dimensions = Object.fromEntries(['Color', 'Roughness', 'NormalGL', 'NormalDX', 'Displacement', 'AmbientOcclusion']
  .map((s) => [s, magick('identify', '-format', '%wx%h', mapPath(s))]));
for (const [map, size] of Object.entries(dimensions)) if (size !== '1024x1024') fail(`${map} is ${size}, not 1024x1024`);

// DirectX and OpenGL normal maps differ by a flipped green channel, so their green means sum to about 255.
const meanGreen = (s) => Number(magick(mapPath(s), '-channel', 'G', '-separate', '-format', '%[fx:mean*255]', 'info:'));
const greenSum = meanGreen('NormalDX') + meanGreen('NormalGL');
if (Math.abs(greenSum - 255) > 3) fail(`NormalDX + NormalGL green means sum to ${greenSum.toFixed(1)}, expected about 255`);

const metrics = {
  asset: { id: asset.assetId, releaseDate: asset.releaseDate, dataType: asset.dataType, creationMethod: asset.creationMethod, maps: asset.maps },
  zip: { fileName, bytes: zipBytes.length, sha256: createHash('sha256').update(zipBytes).digest('hex'), apiReportedBytes: listed.size },
  members,
  dimensions,
  normalGreenMeansSumRounded: Math.round(greenSum),
  licence: { payloadLicenceField, docsStatesCc0 },
};
writeFileSync('output/metrics.json', JSON.stringify(metrics, null, 2) + '\n');
