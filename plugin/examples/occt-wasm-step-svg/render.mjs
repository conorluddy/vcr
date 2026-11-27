// One filleted bracket with two bolt holes: model, round-trip through STEP, tessellate, draw hidden-line views.
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { OcctKernel } from 'occt-wasm';

const sha256 = (data) => createHash('sha256').update(data).digest('hex');
const round = (value) => Number(value.toFixed(3));

// Node 22 has no `using` syntax, so dispose by hand.
const kernel = await OcctKernel.init();
process.on('exit', () => kernel[Symbol.dispose]());

const [lengthMm, depthMm, heightMm, holeRadiusMm] = [60, 30, 10, 4];
const plate = kernel.makeBox(lengthMm, depthMm, heightMm);
const rounded = kernel.fillet(plate, verticalEdges(kernel, plate), 3);
let bracket = rounded;
for (const centerX of [15, 45]) {
  const hole = kernel.translate(kernel.makeCylinder(holeRadiusMm, heightMm), centerX, depthMm / 2, 0);
  bracket = kernel.cut(bracket, hole);
}
const [solid] = kernel.getSubShapes(bracket, 'solid');
if (!solid) throw new Error('boolean produced no solid');

const step = kernel.exportStep(solid);
const reimported = kernel.getSubShapes(kernel.importStep(step), 'solid')[0];
const mesh = kernel.tessellate(solid);
const stl = kernel.exportStl(solid);
const svg = kernel.toMultiviewSVG(solid);

mkdirSync('output', { recursive: true });
writeFileSync('output/bracket.step', step);
writeFileSync('output/bracket.stl', stl);
writeFileSync('output/bracket.svg', svg);
writeFileSync('output/metrics.json', `${JSON.stringify({
  volumeMm3: round(kernel.getVolume(solid)),
  reimportedVolumeMm3: round(kernel.getVolume(reimported)),
  boundingBox: Object.fromEntries(Object.entries(kernel.getBoundingBox(solid)).map(([key, value]) => [key, round(value) + 0])),
  faceCount: kernel.getSubShapes(solid, 'face').length,
  vertexCount: mesh.positions.length / 3,
  triangleCount: mesh.indices.length / 3,
  stepStartsWithIso: step.startsWith('ISO-10303-21'),
  // The STEP header stamps the export time to the second; the rest is identical, so hash without that timestamp.
  stepSha256WithoutTimestamp: sha256(step.replace(/FILE_NAME\('([^']*)','[^']*'/, "FILE_NAME('$1',''")),
  stlSha256: sha256(stl),
  svgSha256: sha256(svg),
}, null, 2)}\n`);

// Vertical (z-parallel) edges of the plate: the four corners to round.
function verticalEdges(kernelInstance, shape) {
  return kernelInstance.getSubShapes(shape, 'edge').filter((edge) => {
    const box = kernelInstance.getBoundingBox(edge);
    return box.zmax - box.zmin > 1 && box.xmax - box.xmin < 1e-6 && box.ymax - box.ymin < 1e-6;
  });
}
