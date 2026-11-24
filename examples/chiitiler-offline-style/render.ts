// Renders an inline MapLibre style (background + GeoJSON fill) with chiitiler in Node, with network
// protocols refused, checks the predeclared pixel colours in the renderer's RGBA buffer and writes
// output/map.png and output/render.json. run.sh decodes the PNG independently and checks rerun bytes.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Chiitiler, ChiitilerCache, type StyleSpecification } from "chiitiler";

type Rgb = [number, number, number];
type Probe = { name: string; x: number; y: number; expectedRgb: Rgb };
type ProbeResult = Probe & { actualRgba: [number, number, number, number]; pass: boolean };

// === PUBLIC API ===

const SIZE_PX = 512;
const CAMERA = { center: [5, 5] as [number, number], zoom: 4, bearing: 0 };
const BACKGROUND_RGB: Rgb = [16, 32, 48];
const FILL_RGB: Rgb = [255, 204, 0];

const PROBES: Probe[] = [
  { name: "fill-centre", x: 256, y: 256, expectedRgb: FILL_RGB },
  { name: "fill-inside-left-edge", x: 200, y: 256, expectedRgb: FILL_RGB },
  { name: "background-outside-left-edge", x: 170, y: 256, expectedRgb: BACKGROUND_RGB },
  { name: "background-top-left-corner", x: 16, y: 16, expectedRgb: BACKGROUND_RGB },
  { name: "background-bottom-right-corner", x: 496, y: 496, expectedRgb: BACKGROUND_RGB },
];

async function main(): Promise<void> {
  const style = buildInlineStyle();
  const chiitiler = new Chiitiler({
    cache: ChiitilerCache.noneCache(),
    protocols: { http: refuseNetwork, https: refuseNetwork },
    concurrency: 1,
  });
  const image = await chiitiler.renderView({
    stylejson: style,
    center: CAMERA.center,
    zoom: CAMERA.zoom,
    bearing: CAMERA.bearing,
    width: SIZE_PX,
    height: SIZE_PX,
    pixelRatio: 1,
  });
  if (image.width !== SIZE_PX || image.height !== SIZE_PX) {
    throw new Error(`rendered ${image.width}x${image.height}, expected ${SIZE_PX}x${SIZE_PX}`);
  }
  const png = await image.toPng();
  const pngDimensions = readPngDimensions(png);
  if (pngDimensions.width !== SIZE_PX || pngDimensions.height !== SIZE_PX) {
    throw new Error(`PNG IHDR is ${pngDimensions.width}x${pngDimensions.height}, expected ${SIZE_PX}x${SIZE_PX}`);
  }
  const probes = PROBES.map((probe) => probeRgba(image.data, image.width, probe));
  const alphaRange = alphaMinMax(image.data);
  const failedProbes = probes.filter((probe) => !probe.pass);
  if (failedProbes.length > 0) {
    throw new Error(`pixel probes differ from predeclared colours: ${JSON.stringify(failedProbes)}`);
  }
  if (alphaRange.min !== 255 || alphaRange.max !== 255) {
    throw new Error(`alpha range is ${alphaRange.min}..${alphaRange.max}, expected 255..255`);
  }
  const result = {
    versions: { chiitiler: readPackageVersion(), node: process.version },
    size: { width: SIZE_PX, height: SIZE_PX },
    camera: CAMERA,
    style,
    networkRefused: true,
    probes,
    alphaRange,
    png: { bytes: png.byteLength, sha256: sha256Hex(png), ihdr: pngDimensions },
  };
  mkdirSync("output", { recursive: true });
  writeFileSync("output/map.png", png);
  writeFileSync("output/render.json", `${JSON.stringify(result, null, 2)}\n`);
  console.log(`render: ${SIZE_PX}x${SIZE_PX}, ${probes.length} probes match, alpha 255..255, sha256 ${result.png.sha256}`);
}

// === INLINE STYLE ===

function buildInlineStyle(): StyleSpecification {
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

async function refuseNetwork(url: string): Promise<Uint8Array | null> {
  throw new Error(`network access refused by the fixture: ${url}`);
}

function probeRgba(data: Uint8Array, width: number, probe: Probe): ProbeResult {
  const offset = (probe.y * width + probe.x) * 4;
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

function readPngDimensions(png: Uint8Array): { width: number; height: number } {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const isPng = signature.every((byte, index) => png[index] === byte);
  if (!isPng) throw new Error("renderer output is not a PNG (signature mismatch)");
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

function rgbToHex([red, green, blue]: Rgb): string {
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function sha256Hex(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function readPackageVersion(): string {
  const packageJson = JSON.parse(readFileSync("node_modules/chiitiler/package.json", "utf8")) as { version: string };
  return packageJson.version;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
