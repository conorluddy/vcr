// Writes 30 transparent RGBA PNG frames into <dir>/frames: an anti-aliased disc swinging once per loop so the loop seam is clean.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const size = 128;
const frameCount = 30;
const outputDirectory = process.argv[2];
if (!outputDirectory) throw new Error("usage: node make-frames.mjs <project-dir>");
mkdirSync(`${outputDirectory}/frames`, { recursive: true });

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

for (let frame = 0; frame < frameCount; frame++) {
  const centerX = 64 + 40 * Math.sin((2 * Math.PI * frame) / frameCount);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot(x + 0.5 - centerX, y + 0.5 - 64);
      const coverage = Math.min(1, Math.max(0, 20.5 - distance));
      const offset = y * (size * 4 + 1) + 1 + x * 4;
      raw[offset] = 255;
      raw[offset + 1] = 90;
      raw[offset + 2] = 40;
      raw[offset + 3] = Math.round(coverage * 255);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(`${outputDirectory}/frames/frame-${String(frame).padStart(4, "0")}.png`, png);
}
