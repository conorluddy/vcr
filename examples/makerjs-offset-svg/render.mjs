// Parametric 2D line work: two shapes unioned, then outlined (offset) outward,
// exported to SVG and DXF with fixed precision. No animation; geometry is a pure function of the constants.
import { mkdirSync, writeFileSync } from 'node:fs';
import makerjs from 'makerjs';

const offsetMm = 3;

function buildPlate() {
  const plate = new makerjs.models.RoundRectangle(80, 40, 8);
  const boss = makerjs.model.move(new makerjs.models.Ellipse(14, 14), [64, 4]);
  const hole = makerjs.model.move(new makerjs.models.Ellipse(6, 6), [20, 20]);
  const merged = makerjs.model.combineUnion(plate, boss);
  return { models: { merged, hole } };
}

const plate = buildPlate();
const outlined = makerjs.model.outline(buildPlate(), offsetMm);
const options = { accuracy: 0.001, units: makerjs.unitType.Millimeter };

mkdirSync('output', { recursive: true });
writeFileSync('output/plate.svg', makerjs.exporter.toSVG(plate, { ...options, stroke: '#111', strokeWidth: '0.5mm', fill: 'none' }));
writeFileSync('output/outline.svg', makerjs.exporter.toSVG(outlined, { ...options, stroke: '#c2410c', strokeWidth: '0.5mm', fill: 'none' }));
writeFileSync('output/outline.dxf', makerjs.exporter.toDXF(outlined));
