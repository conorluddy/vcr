// Measures one WAV file for the rubber-band-stretch fixture: format, sample count, FFT peak and click onsets.
// Usage: pnpm exec tsx analyse.ts <file.wav>   (prints one JSON object on stdout)

import { readFileSync } from "node:fs";
import { basename } from "node:path";

// === TYPES ===

type SampleEncoding = "pcm16" | "float32";

type WavFormat = {
  encoding: SampleEncoding;
  sampleRateHz: number;
  channelCount: number;
  bitsPerSample: number;
};

type WavLayout = WavFormat & {
  dataOffsetBytes: number;
  dataSizeBytes: number;
};

type Measurement = {
  file: string;
  encoding: SampleEncoding;
  sampleRateHz: number;
  channelCount: number;
  bitsPerSample: number;
  samples: number;
  durationS: number;
  fftPeakHz: number;
  onsetsS: number[];
};

// === CONSTANTS ===

const FFT_BAND_MIN_HZ = 20;
const FFT_BAND_MAX_HZ = 20000;
const ONSET_WINDOW_S = 0.001;
const ONSET_RMS_THRESHOLD = 0.1;
const ONSET_REFRACTORY_S = 0.1;
const WAVE_FORMAT_PCM = 1;
const WAVE_FORMAT_IEEE_FLOAT = 3;
const WAVE_FORMAT_EXTENSIBLE = 0xfffe;
const EXTENSIBLE_SUBFORMAT_OFFSET = 24;
const PCM16_FULL_SCALE = 32768;

// === PUBLIC API ===

function measureWavFile(filePath: string): Measurement {
  const bytes = readFileSync(filePath);
  const layout = readWavLayout(bytes, filePath);
  const samples = readChannelZero(bytes, layout, filePath);
  return {
    file: basename(filePath),
    encoding: layout.encoding,
    sampleRateHz: layout.sampleRateHz,
    channelCount: layout.channelCount,
    bitsPerSample: layout.bitsPerSample,
    samples: samples.length,
    durationS: round6(samples.length / layout.sampleRateHz),
    fftPeakHz: round6(fftPeakHz(samples, layout.sampleRateHz)),
    onsetsS: detectOnsetsS(samples, layout.sampleRateHz).map(round6),
  };
}

// === PARSING ===

function readWavLayout(bytes: Buffer, filePath: string): WavLayout {
  if (bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`${filePath}: not a RIFF/WAVE file; rubberband output should be WAV`);
  }
  let format: WavFormat | undefined;
  let data: { offsetBytes: number; sizeBytes: number } | undefined;
  let chunkStart = 12;
  while (chunkStart + 8 <= bytes.length) {
    const chunkId = bytes.toString("ascii", chunkStart, chunkStart + 4);
    const chunkSize = bytes.readUInt32LE(chunkStart + 4);
    const chunkBody = chunkStart + 8;
    if (chunkId === "fmt ") format = readFormatChunk(bytes, chunkBody, filePath);
    if (chunkId === "data") data = { offsetBytes: chunkBody, sizeBytes: chunkSize };
    chunkStart = chunkBody + chunkSize + (chunkSize % 2);
  }
  if (format === undefined || data === undefined) {
    throw new Error(`${filePath}: missing fmt or data chunk`);
  }
  return { ...format, dataOffsetBytes: data.offsetBytes, dataSizeBytes: data.sizeBytes };
}

function readFormatChunk(bytes: Buffer, chunkBody: number, filePath: string): WavFormat {
  const declaredTag = bytes.readUInt16LE(chunkBody);
  const channelCount = bytes.readUInt16LE(chunkBody + 2);
  const sampleRateHz = bytes.readUInt32LE(chunkBody + 4);
  const bitsPerSample = bytes.readUInt16LE(chunkBody + 14);
  const formatTag =
    declaredTag === WAVE_FORMAT_EXTENSIBLE
      ? bytes.readUInt16LE(chunkBody + EXTENSIBLE_SUBFORMAT_OFFSET)
      : declaredTag;
  const encoding = encodingOf(formatTag, bitsPerSample);
  if (encoding === undefined) {
    throw new Error(
      `${filePath}: unsupported WAV format tag ${formatTag} with ${bitsPerSample} bits; expected 16-bit PCM or 32-bit float`,
    );
  }
  return { encoding, sampleRateHz, channelCount, bitsPerSample };
}

function encodingOf(formatTag: number, bitsPerSample: number): SampleEncoding | undefined {
  if (formatTag === WAVE_FORMAT_PCM && bitsPerSample === 16) return "pcm16";
  if (formatTag === WAVE_FORMAT_IEEE_FLOAT && bitsPerSample === 32) return "float32";
  return undefined;
}

function readChannelZero(bytes: Buffer, layout: WavLayout, filePath: string): Float64Array {
  if (layout.dataOffsetBytes + layout.dataSizeBytes > bytes.length) {
    throw new Error(`${filePath}: data chunk runs past the end of the file`);
  }
  const frameBytes = (layout.bitsPerSample / 8) * layout.channelCount;
  const frameCount = Math.floor(layout.dataSizeBytes / frameBytes);
  if (frameCount === 0) {
    throw new Error(`${filePath}: data chunk holds no complete frames`);
  }
  const samples = new Float64Array(frameCount);
  for (let frame = 0; frame < frameCount; frame++) {
    const position = layout.dataOffsetBytes + frame * frameBytes;
    samples[frame] =
      layout.encoding === "pcm16"
        ? bytes.readInt16LE(position) / PCM16_FULL_SCALE
        : bytes.readFloatLE(position);
  }
  return samples;
}

// === SPECTRUM AND ONSETS ===

function fftPeakHz(samples: Float64Array, sampleRateHz: number): number {
  const fftSize = 2 * nextPowerOfTwo(samples.length);
  const real = new Float64Array(fftSize);
  const imag = new Float64Array(fftSize);
  const lastIndex = samples.length - 1;
  for (let index = 0; index < samples.length; index++) {
    const hann = 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / lastIndex);
    real[index] = samples[index]! * hann;
  }
  transformInPlace(real, imag);

  const binHz = sampleRateHz / fftSize;
  const power = (bin: number): number => real[bin]! ** 2 + imag[bin]! ** 2;
  let peakBin = -1;
  let peakPower = Number.NEGATIVE_INFINITY;
  for (let bin = 1; bin < fftSize / 2 - 1; bin++) {
    const frequencyHz = bin * binHz;
    if (frequencyHz < FFT_BAND_MIN_HZ || frequencyHz > FFT_BAND_MAX_HZ) continue;
    if (power(bin) > peakPower) {
      peakPower = power(bin);
      peakBin = bin;
    }
  }
  if (peakBin < 0) {
    throw new Error(`no FFT bins between ${FFT_BAND_MIN_HZ} and ${FFT_BAND_MAX_HZ} Hz`);
  }
  return (peakBin + parabolicOffset(
    Math.log(power(peakBin - 1)),
    Math.log(power(peakBin)),
    Math.log(power(peakBin + 1)),
  )) * binHz;
}

// Sub-bin refinement: vertex of the parabola through three log-power bins.
function parabolicOffset(left: number, centre: number, right: number): number {
  const curvature = left - 2 * centre + right;
  if (curvature === 0) return 0;
  return (0.5 * (left - right)) / curvature;
}

function detectOnsetsS(samples: Float64Array, sampleRateHz: number): number[] {
  const windowSamples = Math.max(1, Math.round(ONSET_WINDOW_S * sampleRateHz));
  const onsetsS: number[] = [];
  let lastOnsetS = Number.NEGATIVE_INFINITY;
  for (let start = 0; start + windowSamples <= samples.length; start += windowSamples) {
    let sumSquares = 0;
    for (let index = start; index < start + windowSamples; index++) {
      sumSquares += samples[index]! ** 2;
    }
    const rms = Math.sqrt(sumSquares / windowSamples);
    const timeS = start / sampleRateHz;
    if (rms > ONSET_RMS_THRESHOLD && timeS - lastOnsetS >= ONSET_REFRACTORY_S) {
      onsetsS.push(timeS);
      lastOnsetS = timeS;
    }
  }
  return onsetsS;
}

// Iterative radix-2 Cooley-Tukey, in place. Length must be a power of two.
function transformInPlace(real: Float64Array, imag: Float64Array): void {
  const size = real.length;
  for (let index = 1, reversed = 0; index < size; index++) {
    let bit = size >> 1;
    for (; reversed & bit; bit >>= 1) reversed ^= bit;
    reversed ^= bit;
    if (index < reversed) {
      [real[index], real[reversed]] = [real[reversed]!, real[index]!];
      [imag[index], imag[reversed]] = [imag[reversed]!, imag[index]!];
    }
  }
  for (let length = 2; length <= size; length <<= 1) {
    const half = length / 2;
    const angleStep = (-2 * Math.PI) / length;
    for (let start = 0; start < size; start += length) {
      for (let offset = 0; offset < half; offset++) {
        const cosine = Math.cos(angleStep * offset);
        const sine = Math.sin(angleStep * offset);
        const evenIndex = start + offset;
        const oddIndex = evenIndex + half;
        const oddReal = real[oddIndex]! * cosine - imag[oddIndex]! * sine;
        const oddImag = real[oddIndex]! * sine + imag[oddIndex]! * cosine;
        real[oddIndex] = real[evenIndex]! - oddReal;
        imag[oddIndex] = imag[evenIndex]! - oddImag;
        real[evenIndex] = real[evenIndex]! + oddReal;
        imag[evenIndex] = imag[evenIndex]! + oddImag;
      }
    }
  }
}

function nextPowerOfTwo(value: number): number {
  let power = 1;
  while (power < value) power *= 2;
  return power;
}

function round6(value: number): number {
  return Number(value.toFixed(6));
}

main();

function main(): void {
  const filePath = process.argv[2];
  if (filePath === undefined) {
    throw new Error("analyse.ts: missing WAV path. Usage: tsx analyse.ts <file.wav>");
  }
  process.stdout.write(`${JSON.stringify(measureWavFile(filePath))}\n`);
}
