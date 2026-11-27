// Renders a full-screen-triangle shader written as TypeScript ('use gpu' functions) through TypeGPU on the
// webgpu package (Dawn) in Node, reads the rgba8unorm texture back, and checks every pixel against an
// analytic reference. Also records the WGSL TypeGPU generates. Run through preload.mjs (the build plugin's
// Node hook): `pnpm -s render`. Writes output/render.json and output/shader.wgsl.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import tgpu, { d } from "typegpu";
import { div } from "typegpu/std";
import { create, globals } from "webgpu";

Object.assign(globalThis, globals);

const WIDTH = 64;
const HEIGHT = 64;
const BYTES_PER_PIXEL = 4;
const FRAME_TIMES = [0, 0.25, 1] as const;
const SHUFFLED_ORDER = [2, 0, 1];
const MAX_CHANNEL_DEVIATION = 1;

type Rgba = [number, number, number, number];

const gpu = create([]);
const adapter = await gpu.requestAdapter();
if (!adapter) throw new Error("no WebGPU adapter: requestAdapter() returned null under Node");
const device = await adapter.requestDevice();
const root = tgpu.initFromDevice({ device });

const Params = d.struct({ time: d.f32, size: d.vec2f });
const params = root.createUniform(Params);

const vertexMain = tgpu.vertexFn({ in: { vertexIndex: d.builtin.vertexIndex }, out: { pos: d.builtin.position } })(
  ({ vertexIndex }) => {
    "use gpu";
    const corners = [d.vec2f(-1, -1), d.vec2f(3, -1), d.vec2f(-1, 3)];
    return { pos: d.vec4f(corners[vertexIndex]!, 0, 1) };
  },
);

const fragmentMain = tgpu.fragmentFn({ in: { position: d.builtin.position }, out: d.vec4f })(({ position }) => {
  "use gpu";
  const uv = div(position.xy, params.$.size);
  return d.vec4f(uv.x, uv.y, params.$.time, 1);
});

const pipeline = root.createRenderPipeline({ vertex: vertexMain, fragment: fragmentMain, targets: { format: "rgba8unorm" } });
const wgsl = tgpu.resolve([pipeline]);
const target = root.createTexture({ size: [WIDTH, HEIGHT], format: "rgba8unorm" }).$usage("render");
const readBuffer = device.createBuffer({
  size: WIDTH * HEIGHT * BYTES_PER_PIXEL,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
});

async function renderFrame(time: number): Promise<Uint8Array> {
  params.write({ time, size: d.vec2f(WIDTH, HEIGHT) });
  pipeline.withColorAttachment({ view: target, clearValue: [0, 0, 0, 0] }).draw(3);
  const encoder = device.createCommandEncoder();
  encoder.copyTextureToBuffer(
    { texture: root.unwrap(target) },
    { buffer: readBuffer, bytesPerRow: WIDTH * BYTES_PER_PIXEL, rowsPerImage: HEIGHT },
    [WIDTH, HEIGHT],
  );
  device.queue.submit([encoder.finish()]);
  await readBuffer.mapAsync(GPUMapMode.READ);
  const pixels = new Uint8Array(readBuffer.getMappedRange().slice(0));
  readBuffer.unmap();
  return pixels;
}

const frames: ReturnType<typeof summariseFrame>[] = [];
mkdirSync("output/frames", { recursive: true });
for (const [index, time] of FRAME_TIMES.entries()) {
  const pixels = await renderFrame(time);
  writeFileSync(`output/frames/frame-${index}.rgba`, pixels);
  frames.push(summariseFrame(time, pixels));
}
const shuffledHashes: string[] = [];
for (const index of SHUFFLED_ORDER) shuffledHashes.push(hash(await renderFrame(FRAME_TIMES[index]!)));
const shuffledMatchesSequential = SHUFFLED_ORDER.every(
  (index, position) => frames[index]!.sha256 === shuffledHashes[position],
);
const maxChannelDeviation = Math.max(...frames.map((frame) => frame.maxChannelDeviation));

const typegpuVersion = (JSON.parse(readFileSync("node_modules/typegpu/package.json", "utf8")) as { version: string })
  .version;
writeFileSync("output/shader.wgsl", wgsl);
const result = {
  versions: { typegpu: typegpuVersion, node: process.version },
  adapter: { vendor: adapter.info.vendor, architecture: adapter.info.architecture },
  width: WIDTH,
  height: HEIGHT,
  toleranceChannel: MAX_CHANNEL_DEVIATION,
  maxChannelDeviation,
  shuffledMatchesSequential,
  wgslSha256: hash(wgsl),
  wgslHasExpectedStages:
    /var<uniform>/.test(wgsl) && /time:\s*f32/.test(wgsl) && /@vertex/.test(wgsl) && /@fragment/.test(wgsl),
  frames,
};
writeFileSync("output/render.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(
  `render: ${frames.length} frames, max channel deviation ${maxChannelDeviation}, shuffled matches ${shuffledMatchesSequential}`,
);
root.destroy();
process.exit(0);

function summariseFrame(time: number, pixels: Uint8Array) {
  let maxDeviation = 0;
  let transparentPixelCount = 0;
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const actual = readPixel(pixels, x, y);
      const expected = expectedPixel(x, y, time);
      if (actual[3] !== 255) transparentPixelCount += 1;
      for (let channel = 0; channel < 4; channel += 1) {
        maxDeviation = Math.max(maxDeviation, Math.abs(actual[channel]! - expected[channel]!));
      }
    }
  }
  if (transparentPixelCount > 0) throw new Error(`time ${time}: ${transparentPixelCount} pixels not fully covered`);
  if (maxDeviation > MAX_CHANNEL_DEVIATION) {
    throw new Error(`time ${time}: channel deviation ${maxDeviation} exceeds ${MAX_CHANNEL_DEVIATION}`);
  }
  const probes = [
    [0, 0],
    [63, 0],
    [32, 32],
    [0, 63],
    [63, 63],
    [5, 40],
  ].map(([x, y]) => ({ x, y, rgba: readPixel(pixels, x!, y!), expectedRgba: expectedPixel(x!, y!, time) }));
  return { time, sha256: hash(pixels), maxChannelDeviation: maxDeviation, transparentPixelCount, probes };
}

function expectedPixel(x: number, y: number, time: number): Rgba {
  return [Math.round(((x + 0.5) / WIDTH) * 255), Math.round(((y + 0.5) / HEIGHT) * 255), Math.round(time * 255), 255];
}

function readPixel(pixels: Uint8Array, x: number, y: number): Rgba {
  const offset = (y * WIDTH + x) * BYTES_PER_PIXEL;
  return [pixels[offset]!, pixels[offset + 1]!, pixels[offset + 2]!, pixels[offset + 3]!];
}

function hash(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}
