// Renders an inline MapLibre style (background + GeoJSON fill) with @maplibre/maplibre-gl-native at pixel
// ratios 1 and 2, refuses and counts every resource request, checks the predeclared pixel colours in each
// RGBA buffer and writes output/map-ratio{1,2}.rgba and output/render.json. run.sh decodes the buffers
// with ImageMagick and checks reruns in a second process.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

type MapLibreNativeModule = typeof import("@maplibre/maplibre-gl-native");
type Rgb = [number, number, number];
type Probe = { name: string; x: number; y: number; expectedRgb: Rgb };
type ProbeResult = Probe & { actualRgba: [number, number, number, number]; pass: boolean };
type RenderResult = {
  pixelRatio: number;
  width: number;
  height: number;
  file: string;
  bytes: number;
  sha256: string;
  alphaRange: { min: number; max: number };
  probes: ProbeResult[];
};

// === PUBLIC API ===

const SIZE_PX = 512;
const CAMERA = { center: [5, 5] as [number, number], zoom: 4, bearing: 0, pitch: 0 };
const BACKGROUND_RGB: Rgb = [16, 32, 48];
const FILL_RGB: Rgb = [255, 204, 0];

const PROBES_AT_RATIO_1: Probe[] = [
  { name: "fill-centre", x: 256, y: 256, expectedRgb: FILL_RGB },
  { name: "fill-inside-left-edge", x: 200, y: 256, expectedRgb: FILL_RGB },
  { name: "background-outside-left-edge", x: 170, y: 256, expectedRgb: BACKGROUND_RGB },
  { name: "background-top-left-corner", x: 16, y: 16, expectedRgb: BACKGROUND_RGB },
  { name: "background-bottom-right-corner", x: 496, y: 496, expectedRgb: BACKGROUND_RGB },
];

const PROBES_AT_RATIO_2: Probe[] = [
  { name: "fill-centre", x: 512, y: 512, expectedRgb: FILL_RGB },
  { name: "fill-inside-left-edge", x: 400, y: 512, expectedRgb: FILL_RGB },
  { name: "background-outside-left-edge", x: 340, y: 512, expectedRgb: BACKGROUND_RGB },
  { name: "background-top-left-corner", x: 32, y: 32, expectedRgb: BACKGROUND_RGB },
  { name: "background-bottom-right-corner", x: 992, y: 992, expectedRgb: BACKGROUND_RGB },
];

async function main(): Promise<void> {
  const mbgl = loadBinding();
  const style = buildInlineStyle();
  const requestUrls: string[] = [];
  const renders: RenderResult[] = [];
  const pixelRatios: Array<{ pixelRatio: 1 | 2; probes: Probe[] }> = [
    { pixelRatio: 1, probes: PROBES_AT_RATIO_1 },
    { pixelRatio: 2, probes: PROBES_AT_RATIO_2 },
  ];

  for (const { pixelRatio, probes } of pixelRatios) {
    const widthPx = SIZE_PX * pixelRatio;
    const heightPx = SIZE_PX * pixelRatio;
    const buffer = await renderBuffer(mbgl, style, pixelRatio, requestUrls);
    const expectedBytes = widthPx * heightPx * 4;
    if (buffer.byteLength !== expectedBytes) {
      throw new Error(`pixelRatio ${pixelRatio}: buffer is ${buffer.byteLength} bytes, expected ${expectedBytes} (${widthPx}x${heightPx} RGBA)`);
    }
    const results = probes.map((probe) => probeRgba(buffer, widthPx, probe));
    const failedProbes = results.filter((probe) => !probe.pass);
    if (failedProbes.length > 0) {
      throw new Error(`pixelRatio ${pixelRatio}: probes differ from predeclared colours: ${JSON.stringify(failedProbes)}`);
    }
    const alphaRange = alphaMinMax(buffer);
    if (alphaRange.min !== 255 || alphaRange.max !== 255) {
      throw new Error(`pixelRatio ${pixelRatio}: alpha range is ${alphaRange.min}..${alphaRange.max}, expected 255..255`);
    }
    const file = `map-ratio${pixelRatio}.rgba`;
    writeFileSync(`output/${file}`, buffer);
    renders.push({
      pixelRatio,
      width: widthPx,
      height: heightPx,
      file,
      bytes: buffer.byteLength,
      sha256: sha256Hex(buffer),
      alphaRange,
      probes: results,
    });
  }

  if (requestUrls.length > 0) {
    throw new Error(`offline render made ${requestUrls.length} resource request(s): ${requestUrls.join(", ")}`);
  }

  const result = {
    versions: { maplibreGlNative: readBindingVersion(), node: process.version, abi: process.versions.modules },
    camera: CAMERA,
    style,
    requestsAttempted: requestUrls.length,
    renders,
  };
  mkdirSync("output", { recursive: true });
  writeFileSync("output/render.json", `${JSON.stringify(result, null, 2)}\n`);
  const summary = renders.map((render) => `${render.width}x${render.height} sha256 ${render.sha256}`).join("; ");
  console.log(`render: ${summary}`);
}

// === INLINE STYLE ===

function buildInlineStyle(): Record<string, unknown> {
  return {
    version: 8,
    sources: {
      area: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [2, 2],
                    [8, 2],
                    [8, 8],
                    [2, 8],
                    [2, 2],
                  ],
                ],
              },
            },
          ],
        },
      },
    },
    layers: [
      { id: "paper", type: "background", paint: { "background-color": rgbToHex(BACKGROUND_RGB) } },
      { id: "fill", type: "fill", source: "area", paint: { "fill-color": rgbToHex(FILL_RGB), "fill-opacity": 1 } },
    ],
  };
}

// === HELPERS ===

function loadBinding(): MapLibreNativeModule {
  const requireFromHere = createRequire(import.meta.url);
  return requireFromHere("@maplibre/maplibre-gl-native") as MapLibreNativeModule;
}

function renderBuffer(
  mbgl: MapLibreNativeModule,
  style: Record<string, unknown>,
  pixelRatio: number,
  requestUrls: string[],
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const map = new mbgl.Map({
      ratio: pixelRatio,
      request: (request, callback) => {
        requestUrls.push(request.url);
        callback(new Error(`network access refused by the fixture: ${request.url}`));
      },
    });
    map.load(style);
    map.render(
      { zoom: CAMERA.zoom, center: CAMERA.center, bearing: CAMERA.bearing, pitch: CAMERA.pitch, width: SIZE_PX, height: SIZE_PX },
      (error, buffer) => {
        // The binding passes null (not undefined) as the error on success, despite the typings.
        if (error || buffer === undefined) {
          map.release();
          reject(error ?? new Error(`pixelRatio ${pixelRatio}: render returned no buffer`));
          return;
        }
        // The binding documents the buffer as valid only inside this callback, so copy it before release.
        const copy = new Uint8Array(buffer);
        map.release();
        resolve(copy);
      },
    );
  });
}

function probeRgba(data: Uint8Array, widthPx: number, probe: Probe): ProbeResult {
  const offset = (probe.y * widthPx + probe.x) * 4;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const alpha = data[offset + 3];
  if (red === undefined || green === undefined || blue === undefined || alpha === undefined) {
    throw new Error(`probe ${probe.name} at (${probe.x}, ${probe.y}) is outside the RGBA buffer`);
  }
  const actualRgba: [number, number, number, number] = [red, green, blue, alpha];
  const pass =
    red === probe.expectedRgb[0] &&
    green === probe.expectedRgb[1] &&
    blue === probe.expectedRgb[2] &&
    alpha === 255;
  return { ...probe, actualRgba, pass };
}

function alphaMinMax(data: Uint8Array): { min: number; max: number } {
  let min = 255;
  let max = 0;
  for (let index = 3; index < data.length; index += 4) {
    const alpha = data[index] ?? 0;
    min = Math.min(min, alpha);
    max = Math.max(max, alpha);
  }
  return { min, max };
}

function rgbToHex([red, green, blue]: Rgb): string {
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readBindingVersion(): string {
  const packageJson = JSON.parse(readFileSync("node_modules/@maplibre/maplibre-gl-native/package.json", "utf8")) as {
    version: string;
  };
  return packageJson.version;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
