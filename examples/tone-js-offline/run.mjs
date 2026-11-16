import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const sampleRate = 48000;
const duration = 1.2;
const events = [
  { note: 'C4', onset: 0.1, frequency: 261.6256 },
  { note: 'E4', onset: 0.45, frequency: 329.6276 },
  { note: 'G4', onset: 0.8, frequency: 391.9954 }
];

await mkdir('output', { recursive: true });
execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
const bundle = await readFile('output/render.bundle.js', 'utf8');
const browser = await chromium.launch({ headless: true });

async function render() {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ content: bundle });
  const result = await page.evaluate(() => window.renderToneOffline());
  await page.close();
  return result;
}

function estimateNote(samples, expectedOnset, expectedFrequency) {
  const firstSearch = Math.max(0, Math.floor((expectedOnset - 0.015) * sampleRate));
  const lastSearch = Math.min(samples.length, Math.ceil((expectedOnset + 0.04) * sampleRate));
  let onsetSample = -1;
  for (let i = firstSearch; i < lastSearch; i++) {
    if (Math.abs(samples[i]) > 0.02) {
      onsetSample = i;
      break;
    }
  }
  if (onsetSample < 0) throw new Error(`No onset found near ${expectedOnset}s`);
  const onset = onsetSample / sampleRate;
  const frequencyStart = Math.floor((expectedOnset + 0.04) * sampleRate);
  const frequencyEnd = Math.floor((expectedOnset + 0.20) * sampleRate);
  const risingCrossings = [];
  for (let i = frequencyStart + 1; i < frequencyEnd; i++) {
    if (samples[i - 1] <= 0 && samples[i] > 0) {
      const fraction = -samples[i - 1] / (samples[i] - samples[i - 1]);
      risingCrossings.push((i - 1 + fraction) / sampleRate);
    }
  }
  if (risingCrossings.length < 10) throw new Error(`Too few waveform cycles near ${expectedOnset}s`);
  const measuredFrequency = (risingCrossings.length - 1) / (risingCrossings.at(-1) - risingCrossings[0]);
  const rmsSamples = samples.slice(frequencyStart, frequencyEnd);
  const rms = Math.sqrt(rmsSamples.reduce((sum, sample) => sum + sample * sample, 0) / rmsSamples.length);
  return { note: events.find((event) => event.onset === expectedOnset).note, expected_onset_seconds: expectedOnset, onset_seconds: onset, frequency_hz: measuredFrequency, expected_frequency_hz: expectedFrequency, rms };
}

function makeWav(samples) {
  const dataBytes = samples.length * 2;
  const wav = Buffer.alloc(44 + dataBytes);
  wav.write('RIFF', 0); wav.writeUInt32LE(36 + dataBytes, 4); wav.write('WAVE', 8);
  wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    wav.writeInt16LE(Math.round(clamped * (clamped < 0 ? 32768 : 32767)), 44 + i * 2);
  }
  return wav;
}

try {
  const first = await render();
  const second = await render();
  const sampleArray = Float32Array.from(first.samples);
  const sampleBytes = Buffer.from(sampleArray.buffer, sampleArray.byteOffset, sampleArray.byteLength);
  const samplesHash = createHash('sha256').update(sampleBytes).digest('hex');
  const secondArray = Float32Array.from(second.samples);
  const secondHash = createHash('sha256').update(Buffer.from(secondArray.buffer, secondArray.byteOffset, secondArray.byteLength)).digest('hex');
  const noteMetrics = events.map((event) => estimateNote(first.samples, event.onset, event.frequency));
  const metrics = {
    tone_version: '15.1.22',
    sample_rate_hz: first.sampleRate,
    channels: first.channels,
    duration_seconds: first.duration,
    sample_count: first.samples.length,
    peak_amplitude: Math.max(...first.samples.map(Math.abs)),
    notes: noteMetrics,
    float32_samples_sha256: samplesHash,
    repeated_render_matches: samplesHash === secondHash
  };

  if (first.sampleRate !== sampleRate || first.channels !== 1 || first.samples.length !== sampleRate * duration || Math.abs(first.duration - duration) > 1 / sampleRate) {
    throw new Error(`Unexpected buffer shape: ${JSON.stringify({ sampleRate: first.sampleRate, channels: first.channels, duration: first.duration, samples: first.samples.length })}`);
  }
  for (const note of noteMetrics) {
    if (Math.abs(note.onset_seconds - note.expected_onset_seconds) > 0.015) throw new Error(`Onset outside ±15 ms: ${JSON.stringify(note)}`);
    if (Math.abs(note.frequency_hz - note.expected_frequency_hz) > 5) throw new Error(`Pitch estimate outside ±5 Hz: ${JSON.stringify(note)}`);
    if (note.rms <= 0.05) throw new Error(`Note window RMS too low: ${JSON.stringify(note)}`);
  }
  if (!metrics.repeated_render_matches) throw new Error('Independent Tone.Offline renders differ');

  await writeFile('output/tone-offline.wav', makeWav(first.samples));
  await writeFile('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
  if (process.argv.includes('--record')) {
    await mkdir('expected', { recursive: true });
    await writeFile('expected/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
  } else {
    const recorded = JSON.parse(await readFile('expected/metrics.json', 'utf8'));
    if (JSON.stringify(metrics) !== JSON.stringify(recorded)) throw new Error('Observed metrics differ from expected/metrics.json');
  }
  console.log(JSON.stringify(metrics, null, 2));
  console.log('tone-js-offline: OK');
} finally {
  await browser.close();
}
