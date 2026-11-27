// Penrose trio to SVG in Node: compile, optimise with a fixed variation string, serialise.
import { mkdirSync, writeFileSync } from 'node:fs';
import 'global-jsdom/register';
import { compile, optimize, toSVG } from '@penrose/core';

const variation = process.env.VARIATION ?? 'VcrFixedVariation1';
const outputPath = process.env.OUTPUT ?? 'output/venn.svg';

const domain = `type Set
predicate Intersecting(Set, Set)
predicate Disjoint(Set, Set)`;

const substance = `Set A, B, C
Intersecting(A, B)
Intersecting(B, C)
Disjoint(A, C)
AutoLabel All`;

const style = `canvas {
  width = 400
  height = 300
}
forall Set s {
  shape s.icon = Circle {
    r: 70
    fillColor: rgba(0.2, 0.4, 0.8, 0.35)
    strokeColor: rgba(0.1, 0.2, 0.5, 1)
    strokeWidth: 2
  }
  shape s.text = Equation {
    string: s.label
    center: s.icon.center
    fontSize: "22px"
  }
  encourage norm(s.icon.center) == 0
}
forall Set a; Set b where Intersecting(a, b) {
  ensure overlapping(a.icon, b.icon, 30)
}
forall Set a; Set b where Disjoint(a, b) {
  ensure disjoint(a.icon, b.icon, 10)
}`;

const compiled = await compile({ domain, substance, style, variation });
if (compiled.isErr()) throw new Error(`compile failed: ${JSON.stringify(compiled.error)}`);
const optimised = optimize(compiled.value);
if (optimised.isErr()) throw new Error(`optimize failed: ${JSON.stringify(optimised.error)}`);
const svg = await toSVG(optimised.value, async () => undefined, 'venn');
mkdirSync('output', { recursive: true });
writeFileSync(outputPath, `${svg.outerHTML}\n`);
