// Renders a full-screen-triangle WGSL shader into an offscreen rgba8unorm texture through the webgpu
// package (Dawn) in Node, reads the texture back through a mapped buffer, and checks every pixel against
// an analytic reference. Frames are rendered sequentially and then in a shuffled order on the same device.
// Writes output/render.json. Checks live in run.sh and in the constants below.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { create, globals } from "webgpu";

Object.assign(globalThis, globals);

// === PUBLIC API ===

const WIDTH = 64;
const HEIGHT = 64;
const BYTES_PER_PIXEL = 4;
const FRAME_TIMES = [0, 0.25, 1] as const;
const SEQUENTIAL_ORDER = [0, 1, 2];
const SHUFFLED_ORDER = [2, 0, 1];
const MAX_CHANNEL_DEVIATION = 1;

const PROBE_PIXELS: Array<{ name: string; x: number; y: number }> = [
  { name: "top-left", x: 0, y: 0 },
  { name: "top-right", x: WIDTH - 1, y: 0 },
  { name: "centre", x: 32, y: 32 },
  { name: "bottom-left", x: 0, y: HEIGHT - 1 },
  { name: "bottom-right", x: WIDTH - 1, y: HEIGHT - 1 },
  { name: "mid-left", x: 5, y: 40 },
];

const SHADER_SOURCE = `
struct Params {
  time: f32,
  width: f32,
  height: f32,
  padding: f32,
};

@group(0) @binding(0) var<uniform> params: Params;

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  var corners = array<vec2<f32>, 3>(vec2<f32>(-1.0, -1.0), vec2<f32>(3.0, -1.0), vec2<f32>(-1.0, 3.0));
  return vec4<f32>(corners[index], 0.0, 1.0);
}

@fragment
fn fragmentMain(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = position.xy / vec2<f32>(params.width, params.height);
  return vec4<f32>(uv.x, uv.y, params.time, 1.0);
}
`;

type Rgba = [number, number, number, number];

type FrameResult = {
  time: number;
  sha256: string;
  maxChannelDeviation: number;
  transparentPixelCount: number;
  probes: Array<{ name: string; x: number; y: number; rgba: Rgba; expectedRgba: Rgba }>;
};

async function main(): Promise<void> {
  const gpu = create([]);
  const adapter = await gpu.requestAdapter();
  if (!adapter) throw new Error("no WebGPU adapter: requestAdapter() returned null under Node");
  const device = await adapter.requestDevice();
  const adapterInfo = adapter.info;

  const module = device.createShaderModule({ code: SHADER_SOURCE });
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module, entryPoint: "vertexMain" },
    fragment: { module, entryPoint: "fragmentMain", targets: [{ format: "rgba8unorm" }] },
    primitive: { topology: "triangle-list" },
  });
  const uniformBuffer = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });
  const texture = device.createTexture({
    size: [WIDTH, HEIGHT],
    format: "rgba8unorm",
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
  });
  const readBuffer = device.createBuffer({
    size: WIDTH * HEIGHT * BYTES_PER_PIXEL,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  const renderFrame = async (time: number): Promise<Uint8Array> => {
    device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time, WIDTH, HEIGHT, 0]));
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        { view: texture.createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: "clear", storeOp: "store" },
      ],
    });
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();
    encoder.copyTextureToBuffer(
      { texture },
      { buffer: readBuffer, bytesPerRow: WIDTH * BYTES_PER_PIXEL, rowsPerImage: HEIGHT },
      [WIDTH, HEIGHT],
    );
    device.queue.submit([encoder.finish()]);
    await readBuffer.mapAsync(GPUMapMode.READ);
    const pixels = new Uint8Array(readBuffer.getMappedRange().slice(0));
    readBuffer.unmap();
    return pixels;
  };

  const frames: FrameResult[] = [];
  mkdirSync("output/frames", { recursive: true });
  for (const index of SEQUENTIAL_ORDER) {
    const time = requireTime(index);
    const pixels = await renderFrame(time);
    writeFileSync(`output/frames/frame-${String(index).padStart(4, "0")}.rgba`, pixels);
    frames.push(summariseFrame(time, pixels));
  }

  const shuffledHashes: string[] = [];
  for (const index of SHUFFLED_ORDER) {
    const time = requireTime(index);
    shuffledHashes.push(summariseFrame(time, await renderFrame(time)).sha256);
  }

  const sequentialHashesInShuffledOrder = SHUFFLED_ORDER.map((index) => requireFrame(frames, index).sha256);
  const shuffledMatchesSequential = shuffledHashes.join() === sequentialHashesInShuffledOrder.join();
  const maxChannelDeviation = Math.max(...frames.map((frame) => frame.maxChannelDeviation));
  const result = {
    versions: { webgpu: readWebgpuVersion(), node: process.version },
    adapter: {
      vendor: adapterInfo.vendor,
      architecture: adapterInfo.architecture,
      device: adapterInfo.device,
      description: adapterInfo.description,
    },
    width: WIDTH,
    height: HEIGHT,
    format: "rgba8unorm",
    frameTimes: FRAME_TIMES,
    sequentialOrder: SEQUENTIAL_ORDER,
    shuffledOrder: SHUFFLED_ORDER,
    toleranceChannel: MAX_CHANNEL_DEVIATION,
    maxChannelDeviation,
    shuffledMatchesSequential,
    frames,
    shuffledHashes,
  };
  mkdirSync("output", { recursive: true });
  writeFileSync("output/render.json", `${JSON.stringify(result, null, 2)}\n`);
  console.log(
    `render: ${frames.length} frames ${WIDTH}x${HEIGHT}, max channel deviation ${maxChannelDeviation}, shuffled matches sequential ${shuffledMatchesSequential}`,
  );

  uniformBuffer.destroy();
  readBuffer.destroy();
  texture.destroy();
  device.destroy();
  process.exit(0);
}

// === PIXEL REFERENCE ===

function summariseFrame(time: number, pixels: Uint8Array): FrameResult {
  let maxChannelDeviation = 0;
  let transparentPixelCount = 0;
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const actual = readPixel(pixels, x, y);
      const expected = expectedPixel(x, y, time);
      if (actual[3] !== 255) transparentPixelCount += 1;
      const pixelDeviation = Math.max(
        Math.abs(actual[0] - expected[0]),
        Math.abs(actual[1] - expected[1]),
        Math.abs(actual[2] - expected[2]),
        Math.abs(actual[3] - expected[3]),
      );
      maxChannelDeviation = Math.max(maxChannelDeviation, pixelDeviation);
    }
  }
  if (transparentPixelCount > 0) {
    throw new Error(`time ${time}: ${transparentPixelCount} pixels are not fully covered (alpha != 255)`);
  }
  if (maxChannelDeviation > MAX_CHANNEL_DEVIATION) {
    throw new Error(`time ${time}: channel deviation ${maxChannelDeviation} exceeds ${MAX_CHANNEL_DEVIATION}`);
  }
  const probes = PROBE_PIXELS.map((probe) => ({
    name: probe.name,
    x: probe.x,
    y: probe.y,
    rgba: readPixel(pixels, probe.x, probe.y),
    expectedRgba: expectedPixel(probe.x, probe.y, time),
  }));
  return {
    time,
    sha256: createHash("sha256").update(pixels).digest("hex"),
    maxChannelDeviation,
    transparentPixelCount,
    probes,
  };
}

function expectedPixel(x: number, y: number, time: number): Rgba {
  return [
    Math.round(((x + 0.5) / WIDTH) * 255),
    Math.round(((y + 0.5) / HEIGHT) * 255),
    Math.round(time * 255),
    255,
  ];
}

function readPixel(pixels: Uint8Array, x: number, y: number): Rgba {
  const offset = (y * WIDTH + x) * BYTES_PER_PIXEL;
  const red = pixels[offset];
  const green = pixels[offset + 1];
  const blue = pixels[offset + 2];
  const alpha = pixels[offset + 3];
  if (red === undefined || green === undefined || blue === undefined || alpha === undefined) {
    throw new Error(`pixel (${x}, ${y}) is outside the ${pixels.length}-byte readback`);
  }
  return [red, green, blue, alpha];
}

function requireFrame(frames: FrameResult[], index: number): FrameResult {
  const frame = frames[index];
  if (!frame) throw new Error(`no sequential frame at index ${index}`);
  return frame;
}

function requireTime(index: number): number {
  const time = FRAME_TIMES[index];
  if (time === undefined) throw new Error(`frame index ${index} is outside FRAME_TIMES`);
  return time;
}

function readWebgpuVersion(): string {
  const packageJson = JSON.parse(readFileSync("node_modules/webgpu/package.json", "utf8")) as { version: string };
  return packageJson.version;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
