import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'output');
const cli = join(here, 'node_modules/pixelbolt/bin/pixelbolt.js');
const record = process.argv.includes('--record');
const palette = { k: [29, 43, 58, 255], g: [63, 163, 77, 255], l: [143, 209, 106, 255], w: [244, 244, 232, 255] };

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
const png = (file) => PNG.sync.read(readFileSync(file));
const pixel = (image, x, y) => Array.from(image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 4));
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const listFiles = (dir, base = dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(join(dir, e.name), base) : [join(dir, e.name).slice(base.length + 1)]);
const hashTree = (dir) => Object.fromEntries(listFiles(dir).sort().map((f) => [f, sha(readFileSync(join(dir, f)))]));

function pixelbolt(...args) {
  const run = spawnSync('node', [cli, ...args], { cwd: here, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`pixelbolt ${args.join(' ')} failed: ${run.stderr || run.stdout}`);
  return run.stdout;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const version = JSON.parse(readFileSync(join(here, 'node_modules/pixelbolt/package.json'), 'utf8')).version;

const sequenceArgs = ['--fps', '30', '--size', '1080p', '--animation', 'idle', '--seconds', '1'];
pixelbolt('render', 'slime.json', '--out', 'output/render-a', '--look');
pixelbolt('render', 'slime.json', '--out', 'output/render-b', '--look');
pixelbolt('sequence', 'slime.json', '--out', 'output/seq-a', ...sequenceArgs);
pixelbolt('sequence', 'slime.json', '--out', 'output/seq-b', ...sequenceArgs);

const sheet = png(join(out, 'render-a/slime.png'));
const atlas = JSON.parse(readFileSync(join(out, 'render-a/slime.atlas.json'), 'utf8'));
const allowed = Object.values(palette);
let foreign = 0;
let partialAlpha = 0;
for (let i = 0; i < sheet.data.length; i += 4) {
  const px = Array.from(sheet.data.subarray(i, i + 4));
  if (px[3] === 0) continue;
  if (px[3] !== 255) partialAlpha++;
  if (!allowed.some((c) => same(c, px))) foreign++;
}

const seqFiles = readdirSync(join(out, 'seq-a')).filter((f) => f.endsWith('.png')).sort();
const frame = (n) => png(join(out, 'seq-a', seqFiles[n - 1]));
const f1 = frame(1);
const f10 = frame(10);
const f16 = frame(16);
const eq = (a, b) => Buffer.compare(a.data, b.data) === 0;
const blockCentre = (sx, sy) => [312 + sx * 108 + 54, sy * 108 + 54];
// Source pixel (0,5) of "rest" is dark outline; the "up" pose is the same art one pixel higher.
const probeRest = pixel(f1, ...blockCentre(0, 5));
const probeUp = pixel(f10, ...blockCentre(0, 4));

const checks = {
  version_is_pinned: version === '0.21.0',
  sheet_is_36x10_three_frames: sheet.width === 36 && sheet.height === 10 && Object.keys(atlas.frames ?? atlas).length >= 3,
  sheet_only_palette_colours: foreign === 0,
  sheet_alpha_is_binary: partialAlpha === 0,
  sheet_probe_outline_exact: same(pixel(sheet, 0, 5), palette.k),
  sequence_is_30_frames_1080p: seqFiles.length === 30 && f1.width === 1920 && f1.height === 1080,
  sequence_timing_9_rest_6_up: [1, 9].every((n) => eq(frame(n), f1)) && [10, 15].every((n) => eq(frame(n), f10)) && !eq(f1, f10),
  sequence_loops_at_15_frames: eq(f16, f1),
  sequence_block_scale_exact: same(probeRest, palette.k) && same(probeUp, palette.k) && same(pixel(f1, 311, 540), [0, 0, 0, 0]),
  render_repeats_byte_identical: JSON.stringify(hashTree(join(out, 'render-a'))) === JSON.stringify(hashTree(join(out, 'render-b'))),
  sequence_repeats_byte_identical: JSON.stringify(hashTree(join(out, 'seq-a'))) === JSON.stringify(hashTree(join(out, 'seq-b'))),
};

const metrics = {
  pixelbolt_version: version,
  sheet: { width: sheet.width, height: sheet.height, sha256: sha(readFileSync(join(out, 'render-a/slime.png'))) },
  sequence: { frames: seqFiles.length, width: f1.width, height: f1.height, frame_1_sha256: sha(f1.data), frame_10_sha256: sha(f10.data) },
  sequence_tree_sha256: sha(JSON.stringify(hashTree(join(out, 'seq-a')))),
  checks,
};
writeFileSync(join(out, 'metrics.json'), JSON.stringify(metrics, null, 2) + '\n');

const expectedPath = join(here, 'expected/metrics.json');
if (record) {
  mkdirSync(dirname(expectedPath), { recursive: true });
  writeFileSync(expectedPath, JSON.stringify(metrics, null, 2) + '\n');
}
if (!existsSync(expectedPath)) throw new Error('expected/metrics.json missing; run ./run.sh --record');
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? 'ok' : 'KNOWN FAIL'}  ${name}`);
if (readFileSync(expectedPath, 'utf8') !== readFileSync(join(out, 'metrics.json'), 'utf8')) {
  console.error('pixelbolt-recipe-sequence: output differs from expected/metrics.json');
  process.exit(1);
}
console.log('pixelbolt-recipe-sequence: OK');
