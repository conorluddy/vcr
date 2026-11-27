// Builds a 10-word sentence from per-word `say` clips (known onsets), aligns it with Echogarden's
// DTW engine twice, applies the predeclared gates and writes output/checks.json + alignment.json.
// Usage: node align.mjs WORDS_DIR OUTPUT_DIR
import { readFileSync, writeFileSync } from "node:fs";
import * as Echogarden from "echogarden";

const SAMPLE_RATE_HZ = 16000;
const LEAD_IN_S = 0.5;
const GAP_S = 0.4;
const ONSET_THRESHOLD_FRACTION = 0.03;
const MAX_START_ERROR_S = 0.2;
const MIN_WORDS_WITHIN_TOLERANCE = 9;
const WORDS = ["the", "red", "fox", "jumps", "over", "the", "quiet", "brown", "river", "today"];

const [wordsDir, outputDir] = process.argv.slice(2);
if (!wordsDir || !outputDir) throw new Error("usage: node align.mjs WORDS_DIR OUTPUT_DIR");

const clips = WORDS.map((_, index) => readPcm16Mono(`${wordsDir}/${String(index).padStart(2, "0")}.wav`));
const { sentence, referenceStartsS } = buildSentence(clips);
const sentenceWavPath = `${outputDir}/input.wav`;
writeFileSync(sentenceWavPath, encodeWav(sentence));

const runs = [];
for (let runIndex = 0; runIndex < 2; runIndex++) {
  const result = await Echogarden.align(sentenceWavPath, WORDS.join(" "), { engine: "dtw", language: "en" });
  runs.push(result.wordTimeline.map((entry) => ({ word: entry.text, start: entry.startTime, end: entry.endTime })));
}

const startErrorsS = runs[0].map((entry, index) => Math.abs(entry.start - referenceStartsS[index]));
const withinTolerance = startErrorsS.filter((error) => error <= MAX_START_ERROR_S).length;
const gates = {
  G1_ten_words_in_reference_order: JSON.stringify(runs[0].map((entry) => entry.word.toLowerCase())) === JSON.stringify(WORDS),
  G2_starts_non_decreasing_and_ends_after_starts: runs[0].every(
    (entry, index) => entry.end > entry.start && (index === 0 || entry.start >= runs[0][index - 1].start),
  ),
  [`G3_at_least_${MIN_WORDS_WITHIN_TOLERANCE}_starts_within_${MAX_START_ERROR_S}s`]: withinTolerance >= MIN_WORDS_WITHIN_TOLERANCE,
  G4_timings_identical_across_runs_to_1ms: JSON.stringify(roundMs(runs[0])) === JSON.stringify(roundMs(runs[1])),
};
const checks = {
  gates,
  pass: Object.values(gates).every(Boolean),
  thresholds: { maxStartErrorS: MAX_START_ERROR_S, minWordsWithinTolerance: MIN_WORDS_WITHIN_TOLERANCE },
  observed: {
    wordsWithinTolerance: withinTolerance,
    meanAbsStartErrorS: round(startErrorsS.reduce((a, b) => a + b, 0) / startErrorsS.length, 2),
    maxAbsStartErrorS: round(Math.max(...startErrorsS), 2),
    wordsWithDifferentTimingOnRerun: runs[0].flatMap((entry, index) => (JSON.stringify(roundMs([entry])) === JSON.stringify(roundMs([runs[1][index]])) ? [] : [entry.word + "@" + index])),
  },
};
writeFileSync(`${outputDir}/checks.json`, JSON.stringify(checks, null, 2) + "\n");
const alignment = runs[0].map((entry, index) => ({
  word: entry.word,
  start: round(entry.start, 2),
  end: round(entry.end, 2),
  referenceStart: round(referenceStartsS[index], 2),
}));
writeFileSync(`${outputDir}/alignment.json`, JSON.stringify(alignment, null, 2) + "\n");
const failed = Object.entries(gates).filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length) console.error(`KNOWN FAIL: gated checks failed: ${failed.join(", ")}`);

function buildSentence(wordClips) {
  const parts = [new Int16Array(Math.round(LEAD_IN_S * SAMPLE_RATE_HZ))];
  const starts = [];
  let length = parts[0].length;
  wordClips.forEach((clip, index) => {
    starts.push((length + findOnsetIndex(clip)) / SAMPLE_RATE_HZ);
    parts.push(clip);
    length += clip.length;
    if (index < wordClips.length - 1) {
      const gap = new Int16Array(Math.round(GAP_S * SAMPLE_RATE_HZ));
      parts.push(gap);
      length += gap.length;
    }
  });
  const merged = new Int16Array(length);
  let offset = 0;
  for (const part of parts) {
    merged.set(part, offset);
    offset += part.length;
  }
  return { sentence: merged, referenceStartsS: starts };
}

function findOnsetIndex(samples) {
  const peak = samples.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  if (peak === 0) throw new Error("clip is silent; the say step failed");
  return samples.findIndex((value) => Math.abs(value) >= ONSET_THRESHOLD_FRACTION * peak);
}

function readPcm16Mono(path) {
  const bytes = readFileSync(path);
  if (bytes.readUInt32LE(24) !== SAMPLE_RATE_HZ || bytes.readUInt16LE(22) !== 1 || bytes.readUInt16LE(34) !== 16) {
    throw new Error(`${path}: expected 16 kHz mono 16-bit PCM (ffmpeg -ar 16000 -ac 1 -c:a pcm_s16le)`);
  }
  const dataIndex = bytes.indexOf("data") + 8;
  const sampleCount = Math.floor((bytes.length - dataIndex) / 2);
  const samples = new Int16Array(sampleCount);
  for (let index = 0; index < sampleCount; index++) samples[index] = bytes.readInt16LE(dataIndex + index * 2);
  return samples;
}

function encodeWav(samples) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + samples.length * 2, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE_HZ, 24);
  header.writeUInt32LE(SAMPLE_RATE_HZ * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(samples.length * 2, 40);
  return Buffer.concat([header, Buffer.from(samples.buffer)]);
}

function roundMs(timeline) {
  return timeline.map((entry) => [Math.round(entry.start * 1000), Math.round(entry.end * 1000)]);
}

function round(value, digits) {
  return Number(value.toFixed(digits));
}
