import { Recorder } from "canvas-record";

const width = 32;
const height = 32;
const colors = [
  { name: "red", rgb: [255, 0, 0] },
  { name: "green", rgb: [0, 255, 0] },
  { name: "blue", rgb: [0, 0, 255] },
];

function eventOnce(target, name) {
  return new Promise((resolve, reject) => {
    target.addEventListener(name, resolve, { once: true });
    target.addEventListener("error", () => reject(new Error(`video element ${name} failed`)), { once: true });
  });
}

async function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
  if (Array.isArray(value)) {
    const blobs = await Promise.all(value.map(async (part) => part instanceof Blob ? part : new Blob([part])));
    return new Uint8Array(await new Blob(blobs, { type: "video/webm" }).arrayBuffer());
  }
  throw new Error(`Unsupported Recorder.stop() output: ${Object.prototype.toString.call(value)}`);
}

window.recordCanvasWithLibrary = async () => {
  if (!window.VideoEncoder || !(await VideoEncoder.isConfigSupported({ codec: "vp09.00.10.08", width, height, bitrate: 200000, framerate: 3 })).supported) {
    throw new Error("Native WebCodecs VP9 encoder is unsupported in this browser");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  const context = canvas.getContext("2d", { alpha: false });
  const recorder = new Recorder(context, {
    name: "canvas-record-vp8-fixture",
    extension: "webm",
    target: "in-browser",
    download: false,
    duration: Infinity,
    frameRate: 3,
    encoderOptions: { codec: "vp09.00.10.08", width, height, bitrate: 200000, framerate: 3 },
  });

  let output;
  try {
    await recorder.start({ initOnly: true });
    for (const color of colors) {
      context.fillStyle = `rgb(${color.rgb.join(",")})`;
      context.fillRect(0, 0, width, height);
      await recorder.step();
    }
    output = await recorder.stop();
  } finally {
    await recorder.dispose();
    canvas.remove();
  }
  const bytes = await toBytes(output);
  if (!bytes.length) throw new Error("Canvas Record returned an empty video");

  const blob = new Blob([bytes], { type: "video/webm" });
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  const url = URL.createObjectURL(blob);
  video.src = url;
  document.body.appendChild(video);
  try {
    await eventOnce(video, "loadedmetadata");
    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = width;
    probeCanvas.height = height;
    const probeContext = probeCanvas.getContext("2d", { alpha: false });
    const samples = [];
    for (const targetTime of [0.05, 0.4, 0.75]) {
      const seeked = eventOnce(video, "seeked");
      video.currentTime = targetTime;
      await seeked;
      probeContext.drawImage(video, 0, 0, width, height);
      const rgba = [...probeContext.getImageData(16, 16, 1, 1).data];
      const png = probeCanvas.toDataURL("image/png");
      samples.push({ requested_time: targetTime, decoded_time: video.currentTime, rgba, preview_png: png });
    }
    return {
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      codec_api_supported: true,
      samples,
      bytes_base64: btoa(String.fromCharCode(...bytes)),
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    video.remove();
    URL.revokeObjectURL(url);
  }
};
