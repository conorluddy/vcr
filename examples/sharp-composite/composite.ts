// Composite generated RGBA layers and a rasterised SVG onto a half-transparent background,
// keeping alpha. Writes output/composite.png and output/summary.json (the checks run.sh diffs).
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const width = 640;
const height = 360;

// Probes are [label, x, y]. Expected values live in expected/summary.json, declared in the README before the first run.
const probes: ReadonlyArray<readonly [string, number, number]> = [
  ["navy_opaque", 50, 50],
  ["transparent_background", 600, 20],
  ["red_over_navy", 250, 100],
  ["red_over_transparent", 380, 100],
  ["svg_circle_centre", 544, 264],
  ["svg_corner_transparent", 485, 205],
];

const background = await sharp(navyLeftHalfRaw(), { raw: { width: width / 2, height: height / 2, channels: 4 } })
  .resize(width, height, { kernel: "nearest" })
  .png()
  .toBuffer();

const redOverlay = await sharp({
  create: { width: 200, height: 200, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0.5 } },
})
  .png()
  .toBuffer();

const svgMark = await sharp(readFileSync("mark.svg"), { density: 288 }).resize(128, 128).png().toBuffer();

mkdirSync("output", { recursive: true });
const { data: png, info } = await sharp(background)
  .composite([
    { input: redOverlay, left: 220, top: 80 },
    { input: svgMark, left: 480, top: 200 },
  ])
  .png()
  .toBuffer({ resolveWithObject: true });
writeFileSync("output/composite.png", png);

const metadata = await sharp(png).metadata();
const pixels = await sharp(png).ensureAlpha().raw().toBuffer();
const probeValues = Object.fromEntries(
  probes.map(([label, x, y]) => {
    const offset = (y * width + x) * 4;
    return [label, Array.from(pixels.subarray(offset, offset + 4))];
  }),
);

const summary = {
  sharp: sharp.versions.sharp,
  libvips: sharp.versions.vips,
  width: metadata.width,
  height: metadata.height,
  channels: metadata.channels,
  hasAlpha: metadata.hasAlpha,
  format: info.format,
  probes: probeValues,
  rawPixelsSha256: sha256(pixels),
  pngSha256: sha256(png),
};
writeFileSync("output/summary.json", `${JSON.stringify(summary, null, 2)}\n`);

// Half-resolution RGBA: left half opaque navy, right half fully transparent.
function navyLeftHalfRaw(): Buffer {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const raw = Buffer.alloc(halfWidth * halfHeight * 4);
  for (let y = 0; y < halfHeight; y++) {
    for (let x = 0; x < halfWidth / 2; x++) raw.set([20, 30, 90, 255], (y * halfWidth + x) * 4);
  }
  return raw;
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
