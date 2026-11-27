// Framefields headless: a 24-frame composition rendered on native WebGPU, frames read back as raw RGBA.
// Writes output/render.json (facts only) and output/frames/*.png for inspection.
import { relative } from "node:path";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Composition, Layer, LayerAnimation } from "framefields";

const WIDTH = 320;
const HEIGHT = 180;
const FPS = 12;
const DURATION_FRAMES = 24;
const PROBE_FRAMES = [0, 6, 12, 18, 23];

const comp = new Composition({
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  durationFrames: DURATION_FRAMES,
  backgroundColor: "#101820",
  fonts: ["assets/fonts/JetBrainsMono-Bold.ttf"],
});

const slide = LayerAnimation.create()
  .fadeIn(0, 12, "power2.out")
  .fromTo("x", -120, 0, { start: 0, end: 18, ease: "power3.out" });

comp.add(
  Layer.box({
    width: 240,
    height: 100,
    background: "#e8590c",
    borderRadius: 12,
    padding: 16,
    children: [
      Layer.text("FRAME", { fontSize: 40, fontWeight: 700, fill: "#ffffff", fontFamily: "JetBrainsMono-Bold" }),
    ],
  }).animate(slide),
);

const hash = (buffer: Buffer): string => createHash("sha256").update(buffer).digest("hex");
const renderRaw = (frame: number): Promise<Buffer> => comp.renderFrame({ frame, format: "rgba" });

mkdirSync("output/frames", { recursive: true });
const sequential: Record<number, string> = {};
const sizes: Record<number, number> = {};
for (const frame of PROBE_FRAMES) {
  const raw = await renderRaw(frame);
  sequential[frame] = hash(raw);
  sizes[frame] = raw.length;
  writeFileSync(`output/frames/frame-${String(frame).padStart(2, "0")}.png`, await comp.renderFrame({ frame, format: "png" }));
}
const shuffledOrder = [18, 0, 23, 12, 6];
const shuffled: Record<number, string> = {};
for (const frame of shuffledOrder) shuffled[frame] = hash(await renderRaw(frame));

const video = await comp.renderVideo({ outputPath: "output/film.mp4", quality: "high" });
const version = (JSON.parse(readFileSync("node_modules/framefields/package.json", "utf8")) as { version: string }).version;

writeFileSync(
  "output/render.json",
  JSON.stringify(
    {
      versions: { framefields: version, node: process.version },
      width: WIDTH,
      height: HEIGHT,
      fps: FPS,
      durationFrames: DURATION_FRAMES,
      rawBytesPerFrame: [...new Set(Object.values(sizes))],
      sequentialHashes: sequential,
      shuffledMatchesSequential: PROBE_FRAMES.every((frame) => sequential[frame] === shuffled[frame]),
      distinctHashes: new Set(Object.values(sequential)).size,
      videoPath: relative(process.cwd(), video.filePath),
    },
    null,
    2,
  ) + "\n",
);
process.exit(0);
