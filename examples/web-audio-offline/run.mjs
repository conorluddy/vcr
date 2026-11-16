import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "output");
const require = createRequire(import.meta.url);
const playwrightPath = process.env.VCR_PLAYWRIGHT_PATH ?? path.join(os.homedir(), ".vcr/runtime/node_modules/playwright");
const { chromium } = require(playwrightPath);
const mode = process.argv[2] ?? "";
const sampleRate = 48000;
const frameCount = 48000;

if (mode && mode !== "--record") throw new Error("usage: run.sh [--record]");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const chromeVersion = browser.version();
  if (chromeVersion !== "156.0.8078.4") throw new Error(`Unexpected Chromium version ${chromeVersion}`);

  async function render() {
    return await page.evaluate(async ({ sampleRate, frameCount }) => {
      const Context = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!Context) throw new Error("OfflineAudioContext is unavailable");
      const context = new Context(1, frameCount, sampleRate);
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, 0);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(0.5, 0.05);
      gain.gain.setValueAtTime(0.5, 0.8);
      gain.gain.linearRampToValueAtTime(0, 1.0);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(0);
      oscillator.stop(1.0);
      const rendered = await context.startRendering();
      const samples = new Uint8Array(rendered.getChannelData(0).buffer);
      let binary = "";
      for (let offset = 0; offset < samples.length; offset += 8192) {
        binary += String.fromCharCode(...samples.subarray(offset, offset + 8192));
      }
      return { sampleRate: rendered.sampleRate, length: rendered.length, channels: rendered.numberOfChannels, samplesBase64: btoa(binary) };
    }, { sampleRate, frameCount });
  }

  const a = await render();
  const b = await render();
  if (a.sampleRate !== sampleRate || a.length !== frameCount || a.channels !== 1) {
    throw new Error(`unexpected buffer metadata ${JSON.stringify({ sampleRate: a.sampleRate, length: a.length, channels: a.channels })}`);
  }
  const raw = Buffer.from(a.samplesBase64, "base64");
  const repeated = Buffer.from(b.samplesBase64, "base64");
  if (!raw.equals(repeated)) throw new Error("repeated OfflineAudioContext buffers differ byte-for-byte");

  const sample = (i) => raw.readFloatLE(i * 4);
  function rms(startSeconds, endSeconds) {
    const start = Math.floor(startSeconds * sampleRate);
    const end = Math.floor(endSeconds * sampleRate);
    let sum = 0;
    for (let i = start; i < end; i++) sum += sample(i) ** 2;
    return Math.sqrt(sum / (end - start));
  }
  let positiveCrossings = 0;
  const frequencyStart = Math.floor(0.2 * sampleRate);
  const frequencyEnd = Math.floor(0.7 * sampleRate);
  for (let i = frequencyStart + 1; i < frequencyEnd; i++) {
    if (sample(i - 1) <= 0 && sample(i) > 0) positiveCrossings++;
  }
  const frequencyHz = positiveCrossings / ((frequencyEnd - frequencyStart) / sampleRate);
  const metrics = {
    browser: `Chrome for Testing ${chromeVersion}`,
    node: process.version,
    playwright: require(`${playwrightPath}/package.json`).version,
    host: `${os.type()} ${os.release()} ${os.arch()}`,
    hostname: os.hostname(),
    sample_rate: a.sampleRate,
    channels: a.channels,
    samples_per_channel: a.length,
    duration_seconds: a.length / a.sampleRate,
    target_frequency_hz: 440,
    measured_frequency_hz: frequencyHz,
    attack_rms_0_005_0_04: rms(0.005, 0.04),
    sustain_rms_0_2_0_7: rms(0.2, 0.7),
    release_rms_0_85_0_95: rms(0.85, 0.95),
    tail_rms_0_98_0_999: rms(0.98, 0.999),
    repeated_buffer_matches: true,
    buffer_sha256: crypto.createHash("sha256").update(raw).digest("hex"),
  };

  if (Math.abs(frequencyHz - 440) > 1) throw new Error(`frequency check failed: ${frequencyHz} Hz`);
  if (!(metrics.attack_rms_0_005_0_04 > 0.1 && metrics.attack_rms_0_005_0_04 < 0.2)) throw new Error("attack RMS outside planned range");
  if (!(metrics.sustain_rms_0_2_0_7 > 0.34 && metrics.sustain_rms_0_2_0_7 < 0.36)) throw new Error("sustain RMS outside planned range");
  if (!(metrics.release_rms_0_85_0_95 > 0.17 && metrics.release_rms_0_85_0_95 < 0.20)) throw new Error("release RMS outside planned range");
  if (!(metrics.tail_rms_0_98_0_999 < 0.025)) throw new Error("tail RMS outside planned range");

  function encodeWav(samplesBuffer) {
    const wav = Buffer.alloc(44 + frameCount * 2);
    wav.write("RIFF", 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVE", 8);
    wav.write("fmt ", 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
    wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write("data", 36); wav.writeUInt32LE(frameCount * 2, 40);
    for (let i = 0; i < frameCount; i++) {
      const value = Math.max(-1, Math.min(1, samplesBuffer.readFloatLE(i * 4)));
      wav.writeInt16LE(Math.round(value < 0 ? value * 32768 : value * 32767), 44 + i * 2);
    }
    return wav;
  }
  const wav = encodeWav(raw);
  const wavRepeat = encodeWav(repeated);
  if (!wav.equals(wavRepeat)) throw new Error("WAV encoding of repeat buffer differs");
  const wavPath = path.join(out, "tone.wav");
  const repeatWavPath = path.join(out, "tone-repeat.wav");
  fs.writeFileSync(wavPath, wav);
  fs.writeFileSync(repeatWavPath, wavRepeat);
  const wavHash = crypto.createHash("sha256").update(wav).digest("hex");
  if (!fs.readFileSync(wavPath).equals(fs.readFileSync(repeatWavPath))) throw new Error("WAV repeat differs");
  metrics.wav_codec = "pcm_s16le";
  metrics.wav_sha256 = wavHash;
  metrics.wav_bytes = wav.length;

  const ffprobe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name,sample_rate,channels,duration", "-of", "json", wavPath], { encoding: "utf8" });
  if (ffprobe.error?.code === "ENOENT") {
    metrics.ffprobe = "unavailable";
  } else if (ffprobe.status !== 0) {
    throw new Error(`ffprobe failed: ${ffprobe.stderr}`);
  } else {
    const stream = JSON.parse(ffprobe.stdout).streams[0];
    if (stream.codec_name !== "pcm_s16le" || Number(stream.sample_rate) !== sampleRate || Number(stream.channels) !== 1 || Number(stream.duration) !== 1) {
      throw new Error(`WAV probe mismatch: ${JSON.stringify(stream)}`);
    }
    metrics.ffprobe = stream;
  }

  const expectedPath = path.join(here, "expected/result.json");
  const rendered = JSON.stringify(metrics, null, 2) + "\n";
  if (mode === "--record") {
    fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
    fs.writeFileSync(expectedPath, rendered);
    console.log(`RECORDED ${expectedPath}`);
  } else {
    if (fs.readFileSync(expectedPath, "utf8") !== rendered) throw new Error(`metrics differ from ${expectedPath}:\n${rendered}`);
    console.log("OK: OfflineAudioContext metrics and repeated output match expected/result.json");
  }
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await browser.close();
}
