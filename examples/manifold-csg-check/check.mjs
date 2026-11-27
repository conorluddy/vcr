import Module from 'manifold-3d';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const radius = 1.2;
const circularSegments = 64;
const wasm = await Module();
wasm.setup();
const { Manifold } = wasm;

const cube = Manifold.cube([2, 2, 2], true);
const ball = Manifold.sphere(radius, circularSegments);
const result = cube.subtract(ball);
const mesh = result.getMesh();
const vertices = mesh.vertProperties; // numProp floats per vertex; first three are xyz
const stride = mesh.numProp;
const triangles = mesh.triVerts;

// Independent checks from the raw arrays, not from Manifold's own accessors.
let signedVolume = 0;
const directedEdges = new Map();
for (let t = 0; t < triangles.length; t += 3) {
  const corner = [0, 1, 2].map((k) => triangles[t + k]);
  const [a, b, c] = corner.map((i) => [vertices[i * stride], vertices[i * stride + 1], vertices[i * stride + 2]]);
  signedVolume += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
  for (let k = 0; k < 3; k++) {
    const key = `${corner[k]}>${corner[(k + 1) % 3]}`;
    directedEdges.set(key, (directedEdges.get(key) ?? 0) + 1);
  }
}
let unpairedEdges = 0;
let repeatedEdges = 0;
for (const [key, count] of directedEdges) {
  const [from, to] = key.split('>');
  if (count > 1) repeatedEdges++;
  if (!directedEdges.has(`${to}>${from}`)) unpairedEdges++;
}

const capHeight = radius - 1;
const capVolume = (Math.PI * capHeight * capHeight * (3 * radius - capHeight)) / 3;
const analyticVolume = 8 - ((4 / 3) * Math.PI * radius ** 3 - 6 * capVolume);

// The faceted ball is smaller than the true ball, so the analytic volume is context only;
// the claim is that the Boolean algebra is self-consistent: V(A-B) = V(A) - V(A and B), V(A or B) = V(A) + V(B) - V(A and B).
const both = Manifold.intersection(cube, ball).volume();
const residual = Math.max(
  Math.abs(result.volume() - (cube.volume() - both)),
  Math.abs(cube.add(ball).volume() - (cube.volume() + ball.volume() - both)),
);

const hash = createHash('sha256')
  .update(Buffer.from(vertices.buffer, vertices.byteOffset, vertices.byteLength))
  .update(Buffer.from(triangles.buffer, triangles.byteOffset, triangles.byteLength))
  .digest('hex');
const metrics = {
  manifoldVersion: '3.5.5',
  status: String(result.status()),
  isEmpty: result.isEmpty(),
  genus: result.genus(),
  vertexCount: result.numVert(),
  triangleCount: result.numTri(),
  independentSignedVolume: Number(signedVolume.toFixed(6)),
  manifoldVolume: Number(result.volume().toFixed(6)),
  analyticVolume: Number(analyticVolume.toFixed(6)),
  inclusionExclusionResidual: Number(residual.toExponential(2)),
  volumeErrorPercent: Number(((Math.abs(signedVolume - analyticVolume) / analyticVolume) * 100).toFixed(3)),
  unpairedEdges,
  repeatedEdges,
  meshSha256: hash,
};
mkdirSync('output', { recursive: true });
writeFileSync('output/metrics.json', JSON.stringify(metrics, null, 2) + '\n');
writeFileSync('output/mesh.json', JSON.stringify({ stride, vertices: Array.from(vertices), triangles: Array.from(triangles) }));
console.log(JSON.stringify(metrics));
if (unpairedEdges || repeatedEdges) throw new Error('mesh is not edge-manifold');
if (residual > 1e-9) throw new Error(`Boolean volumes inconsistent by ${residual}`);
if (metrics.volumeErrorPercent > 2) throw new Error(`volume off analytic by ${metrics.volumeErrorPercent}% (faceting explains about 1.4%)`);
if (Math.abs(signedVolume - result.volume()) > 1e-6) throw new Error('independent volume disagrees with Manifold');
