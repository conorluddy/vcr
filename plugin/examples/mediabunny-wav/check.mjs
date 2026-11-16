import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AudioSampleSink, BlobSource, Input, WAVE } from 'mediabunny';

const here = path.dirname(fileURLToPath(import.meta.url));
const bytes = await readFile(path.join(here, 'output/input.wav'));
const input = new Input({ formats: [WAVE], source: new BlobSource(new Blob([bytes])) });
assert.equal(await input.canRead(), true);
assert.equal((await input.getFormat()).name, 'WAVE');
assert.equal(await input.computeDuration(), 0.1);
const audioTracks = await input.getAudioTracks();
assert.equal(audioTracks.length, 1);
assert.equal((await input.getVideoTracks()).length, 0);
const track = audioTracks[0];
assert.equal(await track.computeDuration(), 0.1);
const sink = new AudioSampleSink(track);
let frameCount = 0;
const sampleMetadata = [];
const firstSamples = [];
const hash = createHash('sha256');
for await (const sample of sink.samples()) {
  assert.equal(sample.sampleRate, 8000);
  assert.equal(sample.numberOfChannels, 1);
  sampleMetadata.push({ timestamp: sample.timestamp, frames: sample.numberOfFrames });
  const data = new Float32Array(sample.numberOfFrames);
  sample.copyTo(data, { format: 'f32', planeIndex: 0 });
  for (const value of data) {
    if (firstSamples.length < 8) firstSamples.push(value);
  }
  hash.update(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
  frameCount += sample.numberOfFrames;
  sample.close();
}
assert.equal(frameCount, 800);
const expected = [0, 0.25, -0.25, 0.5, -0.5, 32767 / 32768, -1, 0];
assert.equal(firstSamples.length, expected.length);
for (let i = 0; i < expected.length; i++) assert.ok(Math.abs(firstSamples[i] - expected[i]) <= 1e-6, `sample ${i}: ${firstSamples[i]} != ${expected[i]}`);
const metrics = {
  mediabunnyVersion: '1.62.1',
  format: (await input.getFormat()).name,
  durationSeconds: await input.computeDuration(),
  audioTracks: audioTracks.length,
  videoTracks: (await input.getVideoTracks()).length,
  sampleRate: 8000,
  channels: 1,
  decodedFrames: frameCount,
  sampleChunks: sampleMetadata,
  firstEightDecodedF32: firstSamples,
  decodedF32Sha256: hash.digest('hex'),
};
await input.dispose();
const expectedPath = path.join(here, 'expected/metrics.json');
if (process.argv.includes('--record')) await writeFile(expectedPath, `${JSON.stringify(metrics, null, 2)}\n`);
else assert.deepEqual(metrics, JSON.parse(await readFile(expectedPath, 'utf8')));
console.log(JSON.stringify(metrics, null, 2));
