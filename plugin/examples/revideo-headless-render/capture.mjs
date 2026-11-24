import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {promisify} from 'node:util';
import {renderVideo} from '@revideo/renderer';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const outputDir = path.join(here, 'output');
const expectedPath = path.join(here, 'expected', 'render.json');
const record = process.argv.includes('--record');

// Predeclared parameters; they must match src/project.ts and the README plan.
const predeclared = {
  width: 320,
  height: 180,
  fps: 30,
  durationSeconds: 2,
  frameCount: 60,
  codecName: 'h264',
  pixelFormat: 'yuv420p',
  rectStartX: -100,
  rectEndX: 100,
  sampledFrameIndices: [0, 15, 30, 45, 59],
  toleranceXPx: 2,
  rectPixelCountMin: 1200,
  rectPixelCountMax: 2000,
};

// Analysis uses the system Homebrew ffmpeg and ffprobe; the renderer encodes with its bundled ffmpeg.
const chromePath = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ffmpegPath = process.env.FFMPEG_BIN || '/opt/homebrew/bin/ffmpeg';
const ffprobePath = process.env.FFPROBE_BIN || '/opt/homebrew/bin/ffprobe';

const checks = [];
function recordCheck(name, passed, detail) {
  checks.push({name, passed, detail});
}

// Renders the project once into output/<renderName>/ and returns the MP4 path.
async function renderOnce(renderName) {
  const outDir = path.join(outputDir, renderName);
  await rm(outDir, {recursive: true, force: true});
  await mkdir(outDir, {recursive: true});
  return renderVideo({
    projectFile: './src/project.ts',
    settings: {
      outDir,
      outFile: 'video.mp4',
      logProgress: false,
      projectSettings: {
        size: {x: predeclared.width, y: predeclared.height},
        range: [0, predeclared.durationSeconds],
        exporter: {name: '@revideo/core/ffmpeg', options: {format: 'mp4'}},
      },
      // The renderer launches with --single-process; the installed Google Chrome is used, not a download.
      puppeteer: {executablePath: chromePath, args: ['--no-sandbox']},
      ffmpeg: {ffmpegLogLevel: 'error'},
    },
  });
}

async function probeVideo(mp4Path) {
  const {stdout} = await execFileAsync(ffprobePath, [
    '-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_read_frames',
    '-of', 'json', mp4Path,
  ]);
  const stream = JSON.parse(stdout).streams[0];
  return {
    codec_name: stream.codec_name,
    pix_fmt: stream.pix_fmt,
    width: stream.width,
    height: stream.height,
    r_frame_rate: stream.r_frame_rate,
    nb_read_frames: stream.nb_read_frames,
  };
}

// Decodes every frame to raw RGB24 so hashes cover pixels, not container bytes.
async function decodeRgbFrames(mp4Path, rawPath) {
  await execFileAsync(ffmpegPath, ['-v', 'error', '-y', '-i', mp4Path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', rawPath]);
  const raw = await readFile(rawPath);
  const frameBytes = predeclared.width * predeclared.height * 3;
  const frames = [];
  for (let offset = 0; offset + frameBytes <= raw.length; offset += frameBytes) {
    frames.push(raw.subarray(offset, offset + frameBytes));
  }
  return frames;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

// Finds the red rect by colour; the white Txt node and black background are excluded.
function measureRect(frameRgb) {
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (let y = 0; y < predeclared.height; y += 1) {
    for (let x = 0; x < predeclared.width; x += 1) {
      const offset = (y * predeclared.width + x) * 3;
      if (frameRgb[offset] > 150 && frameRgb[offset + 1] < 100 && frameRgb[offset + 2] < 100) {
        count += 1;
        sumX += x + 0.5;
        sumY += y + 0.5;
      }
    }
  }
  return {count, centreX: count ? sumX / count : NaN, centreY: count ? sumY / count : NaN};
}

// Linear tween over the scene: frame i is at time i / fps, progress = time / duration.
function expectedCentreXPx(frameIndex) {
  const progress = frameIndex / predeclared.fps / predeclared.durationSeconds;
  return predeclared.width / 2 + predeclared.rectStartX + (predeclared.rectEndX - predeclared.rectStartX) * progress;
}

function checkSampledPositions(frames) {
  return predeclared.sampledFrameIndices.map(frameIndex => {
    const frame = frames[frameIndex];
    const measured = frame ? measureRect(frame) : {count: 0, centreX: NaN, centreY: NaN};
    const expectedX = expectedCentreXPx(frameIndex);
    const deltaXPx = measured.centreX - expectedX;
    const deltaYPx = measured.centreY - predeclared.height / 2;
    const positionOk = Math.abs(deltaXPx) <= predeclared.toleranceXPx && Math.abs(deltaYPx) <= predeclared.toleranceXPx;
    const countOk = measured.count >= predeclared.rectPixelCountMin && measured.count <= predeclared.rectPixelCountMax;
    recordCheck(`frame ${frameIndex} rect position within ${predeclared.toleranceXPx}px`, positionOk && countOk,
      `centre x ${measured.centreX.toFixed(2)} px (expected ${expectedX.toFixed(2)}), centre y ${measured.centreY.toFixed(2)} px (expected ${predeclared.height / 2}), red pixels ${measured.count}`);
    return {
      frame: frameIndex,
      expected_x_px: Number(expectedX.toFixed(2)),
      measured_x_px: Number(measured.centreX.toFixed(2)),
      measured_y_px: Number(measured.centreY.toFixed(2)),
      red_pixels: measured.count,
    };
  });
}

async function renderAndAnalyse(renderName) {
  const mp4Path = await renderOnce(renderName);
  const probe = await probeVideo(mp4Path);
  const frames = await decodeRgbFrames(mp4Path, path.join(outputDir, renderName, 'frames.rgb'));
  return {mp4Path, probe, frames, hashes: frames.map(sha256)};
}

const first = await renderAndAnalyse('render-a');
const second = await renderAndAnalyse('render-b');
const probe = first.probe;

recordCheck('codec is h264', probe.codec_name === predeclared.codecName, `codec ${probe.codec_name}`);
recordCheck('pixel format is yuv420p', probe.pix_fmt === predeclared.pixelFormat, `pix_fmt ${probe.pix_fmt}`);
recordCheck('dimensions 320x180', probe.width === predeclared.width && probe.height === predeclared.height, `${probe.width}x${probe.height}`);
recordCheck('frame rate 30/1', probe.r_frame_rate === `${predeclared.fps}/1`, `r_frame_rate ${probe.r_frame_rate}`);
recordCheck('ffprobe frame count 60', Number(probe.nb_read_frames) === predeclared.frameCount, `nb_read_frames ${probe.nb_read_frames}`);
recordCheck('decoded frame count 60', first.frames.length === predeclared.frameCount, `decoded ${first.frames.length} RGB frames`);
recordCheck('at least two distinct frame hashes', new Set(first.hashes).size >= 2, `${new Set(first.hashes).size} distinct hashes`);
const positions = checkSampledPositions(first.frames);
const rerenderMismatches = first.hashes.filter((hash, index) => hash !== second.hashes[index]).length;
recordCheck('rerender gives identical per-frame hashes', rerenderMismatches === 0 && first.hashes.length === second.hashes.length,
  `${rerenderMismatches} mismatched frames of ${first.hashes.length}`);

const allPassed = checks.every(check => check.passed);
const observed = {
  renderer: {
    revideo_packages: '0.11.0',
    puppeteer: require('puppeteer/package.json').version,
    vite: require('vite/package.json').version,
    chrome: (await execFileAsync(chromePath, ['--version'])).stdout.trim(),
    system_ffmpeg: (await execFileAsync(ffmpegPath, ['-version'])).stdout.split('\n')[0],
    bundled_ffmpeg: (await execFileAsync(require('@ffmpeg-installer/ffmpeg').path, ['-version'])).stdout.split('\n')[0],
    node: process.version,
  },
  probe,
  decoded_frame_count: first.frames.length,
  sampled_positions: positions,
  frame_hashes: first.hashes,
  mp4_sha256_informational: {render_a: sha256(await readFile(first.mp4Path)), render_b: sha256(await readFile(second.mp4Path))},
};
await writeFile(path.join(outputDir, 'observed.json'), `${JSON.stringify({observed, checks}, null, 2)}\n`);
for (const check of checks) console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}: ${check.detail}`);

if (!allPassed) {
  console.error('revideo-headless-render: FAILED predeclared checks; expected/ was not written');
  process.exit(1);
}

if (record) {
  await writeFile(expectedPath, `${JSON.stringify(observed, null, 2)}\n`);
  console.log(`recorded ${path.relative(here, expectedPath)}`);
  process.exit(0);
}

const expected = JSON.parse(await readFile(expectedPath, 'utf8'));
if (JSON.stringify(expected.probe) !== JSON.stringify(observed.probe)) {
  console.error('revideo-headless-render: ffprobe facts differ from expected/render.json');
  process.exit(1);
}
if (JSON.stringify(expected.frame_hashes) !== JSON.stringify(observed.frame_hashes)) {
  console.error('revideo-headless-render: decoded frame hashes differ from expected/render.json');
  process.exit(1);
}
console.log('revideo-headless-render: OK');
