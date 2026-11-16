import CCapture from "ccapture.js";

const width = 32;
const height = 32;
const colors = ["#ff0000", "#00ff00", "#0000ff"];

window.captureWithCCapture = async () => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  document.body.appendChild(canvas);

  const capturer = new CCapture({
    format: "png",
    name: "ccapture-js-fixture",
    framerate: 3,
    hookDate: false,
    hookMedia: false,
    display: false,
    verbose: false,
  });

  let blob;
  try {
    await capturer.start();
    for (const color of colors) {
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);
      await capturer.capture(canvas);
    }
    await capturer.stop();
    const returned = await capturer.save((savedBlob) => { blob = savedBlob; });
    blob ??= returned;
  } finally {
    await capturer.dispose();
    canvas.remove();
  }

  if (!(blob instanceof Blob) || blob.size === 0) throw new Error("CCapture did not return a nonempty TAR Blob");
  return { type: blob.type, size: blob.size, tar_base64: btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer()))) };
};
