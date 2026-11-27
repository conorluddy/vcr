// Reads two compiled bundles and prints a machine-independent summary (no hashes, no toolchain identity).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const [firstBundle, secondBundle] = process.argv.slice(2);
const codecs = ["vp9", "h265", "h264"];

const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const readManifest = (path) => {
  const bytes = readFileSync(path);
  const length = Number(bytes.readBigUInt64LE(0x28));
  return { magic: bytes.subarray(0, 4).toString(), manifest: JSON.parse(bytes.subarray(0x40, 0x40 + length).toString()) };
};

const summary = { codecs: {}, repeatCompileByteIdentical: true, buildWarnings: [] };
for (const codec of codecs) {
  const path = `${firstBundle}/${codec}.avl`;
  const { magic, manifest } = readManifest(path);
  const rendition = manifest.renditions[0];
  summary.codecs[codec] = {
    magic,
    formatVersion: manifest.formatVersion,
    layout: manifest.layout,
    alphaLayout: rendition.alphaLayout,
    codedSize: [rendition.codedWidth, rendition.codedHeight],
    canvas: [manifest.canvas.width, manifest.canvas.height],
    frameCount: manifest.units[0].frameCount,
    hasBytes: readFileSync(path).length > 1000,
  };
  if (sha256(path) !== sha256(`${secondBundle}/${codec}.avl`)) summary.repeatCompileByteIdentical = false;
}
summary.buildWarnings = JSON.parse(readFileSync(`${firstBundle}/build.json`, "utf8")).warnings;
console.log(JSON.stringify(summary, null, 2));
