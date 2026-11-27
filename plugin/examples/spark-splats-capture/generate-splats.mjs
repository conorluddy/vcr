// Writes a synthetic 3000-splat scene in the antimatter15 .splat layout (32 bytes per splat:
// position f32x3, scale f32x3, rgba u8x4, quaternion u8x4). Seeded, so the bytes are identical every run.
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const outputPath = process.argv[2] ?? "output/scene.splat";
const splatCount = 3000;
let state = 0x5eed;
const random = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32);

const buffer = Buffer.alloc(splatCount * 32);
for (let index = 0; index < splatCount; index++) {
  // Two thirds a lime shell, one third a coral double helix through its centre.
  const isHelix = index % 3 === 2;
  let position;
  let colour;
  if (isHelix) {
    const along = (index / splatCount) * 2 - 1;
    const angle = along * 9 + (index % 2) * Math.PI;
    position = [0.55 * Math.cos(angle), along * 1.2, 0.55 * Math.sin(angle)];
    colour = [255, 112, 92];
  } else {
    const z = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const ring = Math.sqrt(1 - z * z);
    position = [ring * Math.cos(angle) * 1.1, z * 1.1, ring * Math.sin(angle) * 1.1];
    const shade = 0.55 + (0.45 * (position[1] / 1.1 + 1)) / 2;
    colour = [Math.round(199 * shade), Math.round(243 * shade), Math.round(107 * shade)];
  }
  const offset = index * 32;
  position.forEach((value, axis) => buffer.writeFloatLE(value, offset + axis * 4));
  const radius = isHelix ? 0.035 : 0.04;
  for (let axis = 0; axis < 3; axis++) buffer.writeFloatLE(radius, offset + 12 + axis * 4);
  colour.forEach((value, channel) => buffer.writeUInt8(value, offset + 24 + channel));
  buffer.writeUInt8(235, offset + 27);
  [255, 128, 128, 128].forEach((value, component) => buffer.writeUInt8(value, offset + 28 + component)); // identity quaternion (w,x,y,z)
}
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buffer);
console.log(`${splatCount} splats, ${buffer.length} bytes, sha256 ${createHash("sha256").update(buffer).digest("hex")}`);
