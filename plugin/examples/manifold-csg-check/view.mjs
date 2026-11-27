// Flat-shaded painter's-algorithm SVG of output/mesh.json, so the mesh can be looked at.
import { readFileSync, writeFileSync } from 'node:fs';

const { stride, vertices, triangles } = JSON.parse(readFileSync('output/mesh.json', 'utf8'));
const yaw = 0.7;
const pitch = 0.5;
const scale = 150;
const light = [0.4, 0.5, 0.77];

function rotate([x, y, z]) {
  const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
  const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
  return [x1, y1 * Math.cos(pitch) - z * Math.sin(pitch), y1 * Math.sin(pitch) + z * Math.cos(pitch)];
}

const faces = [];
for (let t = 0; t < triangles.length; t += 3) {
  const [a, b, c] = [0, 1, 2].map((k) => {
    const i = triangles[t + k] * stride;
    return rotate([vertices[i], vertices[i + 1], vertices[i + 2]]);
  });
  const u = b.map((v, i) => v - a[i]);
  const w = c.map((v, i) => v - a[i]);
  const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  const length = Math.hypot(...n) || 1;
  const shade = Math.max(0, (n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / length);
  if (n[1] > 0) continue; // back face: camera looks along +y after rotation
  faces.push({ depth: (a[1] + b[1] + c[1]) / 3, points: [a, b, c], shade });
}
faces.sort((p, q) => q.depth - p.depth);
const polygons = faces.map(({ points, shade }) => {
  const level = Math.round(60 + 190 * shade);
  const coordinates = points.map(([x, , z]) => `${(300 + x * scale).toFixed(1)},${(300 - z * scale).toFixed(1)}`).join(' ');
  return `<polygon points="${coordinates}" fill="rgb(${level},${level},${Math.min(255, level + 20)})" stroke="rgb(${level},${level},${level})" stroke-width="0.4"/>`;
});
writeFileSync('output/view.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#1c1c22"/>${polygons.join('')}</svg>`);
