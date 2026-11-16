import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AudioSampleSink, ALL_FORMATS, Conversion, FilePathSource, FilePathTarget, Input, Mp4OutputFormat, Output, Quality } from 'mediabunny';
import { registerMediabunnyServer } from '@mediabunny/server';
import { ffmpegVersion as nodeAvFfmpegVersion } from 'node-av/ffmpeg';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, 'output');
const packageLock = JSON.parse(await readFile(path.join(here, 'package-lock.json'), 'utf8'));
const packageVersions = {
  mediabunny: packageLock.packages['node_modules/mediabunny'].version,
  serverExtension: packageLock.packages['node_modules/@mediabunny/server'].version,
  nodeAv: packageLock.packages['node_modules/node-av'].version,
};
assert.deepEqual(packageVersions, { mediabunny: '1.66.0', serverExtension: '1.66.0', nodeAv: '6.2.0' });

const round = value => Number(value.toFixed(6));
async function decode(filePath) {
  const input = new Input({ formats: ALL_FORMATS, source: new FilePathSource(filePath) });
  assert.equal(await input.canRead(), true, 'Mediabunny cannot read ' + filePath);
  const audioTracks = await input.getAudioTracks();
  assert.equal(audioTracks.length, 1, 'expected one audio track in ' + filePath);
  const track = audioTracks[0];
  const codec = await track.getCodec();
  assert.equal(codec, 'aac', 'expected AAC codec, got ' + codec);
  assert.equal(await track.canDecode(), true, 'AAC decoder not registered for ' + filePath);
  const duration = await track.computeDuration();
  const sink = new AudioSampleSink(track);
  let frames = 0;
  let channels = null;
  let sampleRate = null;
  let squareSum = 0;
  let peak = 0;
  let crossings = 0;
  let previous = null;
  for await (const sample of sink.samples()) {
    sampleRate = sample.sampleRate;
    channels = sample.numberOfChannels;
    assert.equal(channels, 1, 'expected mono decoded samples');
    const floatCount = sample.allocationSize({ format: 'f32', planeIndex: 0 }) / 4;
    const data = new Float32Array(floatCount);
    sample.copyTo(data, { format: 'f32', planeIndex: 0 });
    for (const value of data) {
      squareSum += value * value;
      peak = Math.max(peak, Math.abs(value));
      if (previous !== null && ((previous <= 0 && value > 0) || (previous >= 0 && value < 0))) crossings++;
      previous = value;
    }
    frames += sample.numberOfFrames;
    sample.close();
  }
  await input.dispose();
  const sampleDuration = frames / sampleRate;
  const measured = {
    codec,
    durationSeconds: round(duration),
    sampleRate,
    channels,
    decodedFrames: frames,
    decodedDurationSeconds: round(sampleDuration),
    rms: round(Math.sqrt(squareSum / frames)),
    peak: round(peak),
    zeroCrossingHz: round(crossings / 2 / sampleDuration),
  };
  assert.ok(duration >= 0.97 && duration <= 1.05, 'duration out of range: ' + duration);
  assert.ok(frames >= 46_000 && frames <= 50_500, 'decoded frame count out of range: ' + frames);
  assert.equal(sampleRate, 48_000);
  assert.ok(measured.rms >= 0.10 && measured.rms <= 0.24, 'unexpected RMS ' + measured.rms);
  assert.ok(measured.zeroCrossingHz >= 420 && measured.zeroCrossingHz <= 460, 'unexpected frequency ' + measured.zeroCrossingHz);
  return measured;
}

const sourcePath = path.join(output, 'source.m4a');
const sourceInput = new Input({ formats: ALL_FORMATS, source: new FilePathSource(sourcePath) });
const sourceTrack = (await sourceInput.getAudioTracks())[0];
assert.ok(sourceTrack, 'source has no AAC audio track');
assert.equal(await sourceTrack.getCodec(), 'aac');
const sourceCanDecodeBeforeRegistration = await sourceTrack.canDecode();
assert.equal(sourceCanDecodeBeforeRegistration, false, 'AAC unexpectedly available before server extension registration');
registerMediabunnyServer();
const sourceCanDecodeAfterRegistration = await sourceTrack.canDecode();
assert.equal(sourceCanDecodeAfterRegistration, true, 'server extension did not register the AAC decoder');
const conversionOutput = new Output({
  format: new Mp4OutputFormat(),
  target: new FilePathTarget(path.join(output, 'transcoded.m4a')),
});
const conversion = await Conversion.init({
  input: sourceInput,
  output: conversionOutput,
  audio: {
    codec: 'aac',
    forceTranscode: true,
    numberOfChannels: 1,
    sampleRate: 48_000,
    quality: new Quality({ bitrate: 96_000 }),
  },
});
assert.equal(conversion.isValid, true, 'conversion invalid: ' + JSON.stringify(conversion.discardedTracks.map(x => x.reason)));
assert.equal(conversion.utilizedTracks.length, 1, 'conversion did not utilize exactly one input track');
assert.equal(conversion.discardedTracks.length, 0, 'conversion discarded an input track');
await conversion.execute();
await sourceInput.dispose();

const source = await decode(sourcePath);
const transcodedPath = path.join(output, 'transcoded.m4a');
const transcoded = await decode(transcodedPath);
assert.ok((await stat(transcodedPath)).size > 0, 'transcoded file is empty');
const wav = await readFile(path.join(output, 'tone.wav'));
const metrics = {
  packages: packageVersions,
  nodeVersion: process.version,
  platform: os.platform() + ' ' + os.arch(),
  hostRelease: os.release(),
  nodeAvFfmpegVersion: nodeAvFfmpegVersion(),
  sourceFfmpegVersion: (await readFile(path.join(output, 'source-ffmpeg-version.txt'), 'utf8')).trim(),
  extensionRegistered: true,
  sourceCanDecodeBeforeRegistration,
  sourceCanDecodeAfterRegistration,
  forcedTranscode: true,
  utilizedInputTracks: conversion.utilizedTracks.length,
  discardedInputTracks: conversion.discardedTracks.length,
  sourceWavSha256: createHash('sha256').update(wav).digest('hex'),
  sourceMediabunnyDecode: source,
  transcodedMediabunnyDecode: transcoded,
  transcodedFileBytes: (await stat(transcodedPath)).size,
};
const expectedPath = path.join(here, 'expected/metrics.json');
if (process.argv[2] === '--record') await writeFile(expectedPath, JSON.stringify(metrics, null, 2) + '\n');
else assert.deepEqual(metrics, JSON.parse(await readFile(expectedPath, 'utf8')));
console.log(JSON.stringify(metrics, null, 2));
