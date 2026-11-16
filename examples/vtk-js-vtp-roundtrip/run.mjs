import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points.js';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray.js';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData.js';
import vtkXMLPolyDataWriter from '@kitware/vtk.js/IO/XML/XMLPolyDataWriter.js';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(process.argv[2]);
const pointsExpected = [0, 0, -1, 2, 0, -1, 2, 3, 4, 0, 3, 4];
const cellsExpected = [3, 0, 1, 2, 3, 0, 2, 3];
const pointSet = vtkPoints.newInstance();
pointSet.setData(Float32Array.from(pointsExpected), 3);
const polygons = vtkCellArray.newInstance({ values: Uint32Array.from(cellsExpected) });
const input = vtkPolyData.newInstance();
input.setPoints(pointSet);
input.setPolys(polygons);
assert.equal(input.getNumberOfPoints(), 4);
assert.equal(input.getNumberOfPolys(), 2);

const writer = vtkXMLPolyDataWriter.newInstance({ format: 'ascii' });
const xml = writer.write(input);
assert.match(xml, /<VTKFile[^>]*type="PolyData"/);
assert.match(xml, /<PolyData>/);
await writeFile(path.join(output, 'mesh.vtp'), xml);
const bytes = await readFile(path.join(output, 'mesh.vtp'));
const reader = vtkXMLPolyDataReader.newInstance();
assert.equal(reader.parseAsArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)), true);
const result = reader.getOutputData(0);
assert.ok(result);

const points = Array.from(result.getPoints().getData(), Number);
const cells = Array.from(result.getPolys().getData(), Number);
const bounds = Array.from(result.getBounds(), Number);
assert.equal(result.getNumberOfPoints(), 4);
assert.equal(result.getNumberOfPolys(), 2);
assert.deepEqual(points, pointsExpected);
assert.deepEqual(cells, cellsExpected);
const expectedBounds = [0, 2, 0, 3, -1, 4];
assert.equal(bounds.length, expectedBounds.length);
for (let i = 0; i < bounds.length; i += 1) assert.ok(Math.abs(bounds[i] - expectedBounds[i]) <= 1e-6);
const geometry = { points, cells, bounds };
const geometrySha256 = createHash('sha256').update(JSON.stringify(geometry)).digest('hex');
const { version: vtkJsVersion } = JSON.parse(await readFile(path.join(here, 'node_modules/@kitware/vtk.js/package.json'), 'utf8'));
const metrics = {
  vtkJsVersion,
  nodeVersion: process.version,
  inputPolyData: true,
  writerFormat: 'ascii VTP',
  readerResult: 'success',
  pointCount: result.getNumberOfPoints(),
  polygonCount: result.getNumberOfPolys(),
  ...geometry,
  geometrySha256,
};
await writeFile(path.join(output, 'metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
console.log(JSON.stringify(metrics, null, 2));
