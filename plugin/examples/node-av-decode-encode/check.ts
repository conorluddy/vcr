// Decode a generated H.264 clip frame by frame with node-av, re-encode it with libx264 and check
// the decoded facts and the ffprobe fields of input and output against predeclared values.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Decoder, Demuxer, Encoder, Muxer } from 'node-av/api';
import { AV_PIX_FMT_YUV420P, FF_ENCODER_LIBX264 } from 'node-av/constants';
import { ffmpegVersion } from 'node-av/ffmpeg';

// === PREDECLARED VALUES ===
const EXPECTED_FRAME_COUNT = 24;
const EXPECTED_WIDTH = 320;
const EXPECTED_HEIGHT = 240;
const EXPECTED_PIXEL_FORMAT = 'yuv420p';
const EXPECTED_FRAME_RATE = '24/1';
const EXPECTED_CODEC = 'h264';
const EXPECTED_MP4_FORMAT_NAME = 'mov,mp4,m4a,3gp,3g2,mj2';
const MINIMUM_DISTINCT_FRAME_HASHES = 2;

// === TYPES ===
type FfprobeStream = {
  codec_name: string;
  width: number;
  height: number;
  pix_fmt: string;
  nb_read_frames: string;
  r_frame_rate: string;
};
type FfprobeJson = { streams: FfprobeStream[]; format: { format_name: string } };
type ProbeFacts = {
  codecName: string;
  width: number;
  height: number;
  pixelFormat: string;
  readFrameCount: number;
  frameRate: string;
  formatName: string;
};
type DecodeFacts = {
  frameCount: number;
  width: number;
  height: number;
  pixelFormatIsYuv420p: boolean;
  ptsStrictlyIncreasing: boolean;
  distinctFrameHashes: number;
};

// === PUBLIC API ===
const here = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.join(here, 'output');
const inputPath = path.join(outputDirectory, 'input.mp4');
const reencodedPath = path.join(outputDirectory, 'reencoded.mp4');
const expectedPath = path.join(here, 'expected', 'metrics.json');
const isRecording = process.argv.includes('--record');

const probeFacts = (filePath: string): ProbeFacts => {
  const json = JSON.parse(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries',
        'stream=codec_name,width,height,pix_fmt,nb_read_frames,r_frame_rate:format=format_name',
        '-of', 'json', filePath],
      { encoding: 'utf8' },
    ),
  ) as FfprobeJson;
  const stream = json.streams[0];
  assert.ok(stream, `ffprobe found no video stream in ${filePath}`);
  return {
    codecName: stream.codec_name,
    width: stream.width,
    height: stream.height,
    pixelFormat: stream.pix_fmt,
    readFrameCount: Number(stream.nb_read_frames),
    frameRate: stream.r_frame_rate,
    formatName: json.format.format_name,
  };
};

const assertProbeMatchesPredeclared = (facts: ProbeFacts, label: string): void => {
  assert.equal(facts.codecName, EXPECTED_CODEC, `${label}: codec`);
  assert.equal(facts.width, EXPECTED_WIDTH, `${label}: width`);
  assert.equal(facts.height, EXPECTED_HEIGHT, `${label}: height`);
  assert.equal(facts.pixelFormat, EXPECTED_PIXEL_FORMAT, `${label}: pixel format`);
  assert.equal(facts.readFrameCount, EXPECTED_FRAME_COUNT, `${label}: frame count`);
  assert.equal(facts.frameRate, EXPECTED_FRAME_RATE, `${label}: frame rate`);
  assert.equal(facts.formatName, EXPECTED_MP4_FORMAT_NAME, `${label}: container`);
};

const decodeFrameByFrame = async (filePath: string): Promise<DecodeFacts> => {
  await using input = await Demuxer.open(filePath);
  const videoStream = input.video();
  assert.ok(videoStream, `node-av found no video stream in ${filePath}`);
  using decoder = await Decoder.create(videoStream);
  const frameHashes = new Set<string>();
  let frameCount = 0;
  let width = 0;
  let height = 0;
  let pixelFormatIsYuv420p = true;
  let ptsStrictlyIncreasing = true;
  let previousPts: bigint | null = null;
  for await (const frame of decoder.frames(input.packets(videoStream.index))) {
    if (frame === null) continue;
    frameCount++;
    width = frame.width;
    height = frame.height;
    if (frame.format !== AV_PIX_FMT_YUV420P) pixelFormatIsYuv420p = false;
    if (previousPts !== null && frame.pts <= previousPts) ptsStrictlyIncreasing = false;
    previousPts = frame.pts;
    frameHashes.add(createHash('sha256').update(frame.toBuffer()).digest('hex'));
    frame.free();
  }
  return {
    frameCount,
    width,
    height,
    pixelFormatIsYuv420p,
    ptsStrictlyIncreasing,
    distinctFrameHashes: frameHashes.size,
  };
};

const reencodeWithLibx264 = async (inputFile: string, outputFile: string): Promise<number> => {
  await using input = await Demuxer.open(inputFile);
  const videoStream = input.video();
  assert.ok(videoStream, `node-av found no video stream in ${inputFile}`);
  using decoder = await Decoder.create(videoStream);
  using encoder = await Encoder.create(FF_ENCODER_LIBX264, { decoder });
  await using output = await Muxer.open(outputFile, { input });
  const outputIndex = output.addStream(encoder, { inputStream: videoStream });
  const decodedFrames = decoder.frames(input.packets(videoStream.index));
  let packetCount = 0;
  for await (using packet of encoder.packets(decodedFrames)) {
    if (packet === null) continue;
    await output.writePacket(packet, outputIndex);
    packetCount++;
  }
  return packetCount;
};

const readNodeAvVersion = (): string => {
  const manifest = JSON.parse(readFileSync(path.join(here, 'node_modules', 'node-av', 'package.json'), 'utf8')) as { version: string };
  return manifest.version;
};

const readSystemFfmpegVersion = (): string =>
  readFileSync(path.join(outputDirectory, 'system-ffmpeg-version.txt'), 'utf8').trim();

// === MAIN ===
const inputProbe = probeFacts(inputPath);
assertProbeMatchesPredeclared(inputProbe, 'input ffprobe');

const inputDecode = await decodeFrameByFrame(inputPath);
assert.equal(inputDecode.frameCount, EXPECTED_FRAME_COUNT, 'node-av decoded frame count');
assert.equal(inputDecode.width, EXPECTED_WIDTH, 'node-av decoded width');
assert.equal(inputDecode.height, EXPECTED_HEIGHT, 'node-av decoded height');
assert.equal(inputDecode.pixelFormatIsYuv420p, true, 'node-av decoded pixel format is not yuv420p');
assert.equal(inputDecode.ptsStrictlyIncreasing, true, 'node-av decoded pts are not strictly increasing');
assert.ok(
  inputDecode.distinctFrameHashes >= MINIMUM_DISTINCT_FRAME_HASHES,
  `only ${inputDecode.distinctFrameHashes} distinct decoded frame hashes`,
);

const encodedPacketCount = await reencodeWithLibx264(inputPath, reencodedPath);
assert.ok(encodedPacketCount > 0, 'node-av wrote no encoded packets');

const reencodedProbe = probeFacts(reencodedPath);
assertProbeMatchesPredeclared(reencodedProbe, 'reencoded ffprobe');

const roundTripDecode = await decodeFrameByFrame(reencodedPath);
assert.equal(roundTripDecode.frameCount, EXPECTED_FRAME_COUNT, 'round-trip decoded frame count');
assert.equal(roundTripDecode.width, EXPECTED_WIDTH, 'round-trip decoded width');
assert.equal(roundTripDecode.height, EXPECTED_HEIGHT, 'round-trip decoded height');
assert.equal(roundTripDecode.pixelFormatIsYuv420p, true, 'round-trip decoded pixel format is not yuv420p');

const metrics = {
  inputFfprobe: inputProbe,
  inputNodeAvDecode: inputDecode,
  reencodedEncoder: 'libx264',
  reencodedFfprobe: reencodedProbe,
  reencodedRoundTripDecode: roundTripDecode,
};

const versions = {
  nodeAv: readNodeAvVersion(),
  bundledFfmpeg: ffmpegVersion(),
  systemFfmpeg: readSystemFfmpegVersion(),
  node: process.version,
  platform: `${os.platform()} ${os.arch()}`,
};
console.log(JSON.stringify({ versions, metrics }, null, 2));

if (isRecording) {
  writeFileSync(expectedPath, JSON.stringify(metrics, null, 2) + '\n');
} else {
  assert.deepEqual(metrics, JSON.parse(readFileSync(expectedPath, 'utf8')));
}
