import { FFmpeg } from "@ffmpeg/ffmpeg";

const SAMPLE_RATE = 8000;
const INPUT_SAMPLES = 8000;
const TRIM_START = 2000;
const TRIM_END = 6000;

function makeWave() {
  const buffer = new ArrayBuffer(44 + INPUT_SAMPLES * 2);
  const view = new DataView(buffer);
  const text = (offset, value) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, buffer.byteLength - 8, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, INPUT_SAMPLES * 2, true);
  for (let index = 0; index < INPUT_SAMPLES; index++) {
    const sample = ((index * 37) % 20001) - 10000;
    view.setInt16(44 + index * 2, sample, true);
  }
  return new Uint8Array(buffer);
}

window.runWasmTrim = async () => {
  const ffmpeg = new FFmpeg();
  const logs = [];
  ffmpeg.on("log", ({ message }) => logs.push(message));
  try {
    const coreBase = new URL("/", location.href);
    await ffmpeg.load({
      coreURL: new URL("ffmpeg-core.js", coreBase).href,
      wasmURL: new URL("ffmpeg-core.wasm", coreBase).href,
    });
    const input = makeWave();
    await ffmpeg.writeFile("input.wav", input);
    const command = [
      "-y", "-i", "input.wav",
      "-af", `atrim=start_sample=${TRIM_START}:end_sample=${TRIM_END},asetpts=PTS-STARTPTS`,
      "-c:a", "pcm_s16le", "output.wav",
    ];
    const exitCode = await ffmpeg.exec(command, 30000);
    if (exitCode !== 0) throw new Error(`ffmpeg exec returned ${exitCode}`);
    const outputA = await ffmpeg.readFile("output.wav");
    const repeatExitCode = await ffmpeg.exec(command, 30000);
    if (repeatExitCode !== 0) throw new Error(`repeat ffmpeg exec returned ${repeatExitCode}`);
    const outputB = await ffmpeg.readFile("output.wav");
    return {
      output_a_base64: btoa(String.fromCharCode(...outputA)),
      output_b_base64: btoa(String.fromCharCode(...outputB)),
      logs,
      core_package: "@ffmpeg/core@0.12.10",
    };
  } finally {
    await ffmpeg.terminate();
  }
};

document.querySelector("#status").textContent = "FFmpeg.wasm ready";
