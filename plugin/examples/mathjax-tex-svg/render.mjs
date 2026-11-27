// TeX to path-only SVG with MathJax 4 in Node: lite DOM, no browser, no fonts.
import { mkdirSync, writeFileSync } from 'node:fs';
import { mathjax } from '@mathjax/src/mjs/mathjax.js';
import { TeX } from '@mathjax/src/mjs/input/tex.js';
import { SVG } from '@mathjax/src/mjs/output/svg.js';
import { liteAdaptor } from '@mathjax/src/mjs/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from '@mathjax/src/mjs/handlers/html.js';
import '@mathjax/src/mjs/input/tex/base/BaseConfiguration.js';
import '@mathjax/src/mjs/input/tex/ams/AmsConfiguration.js';

export const equationTex = String.raw`\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}`;

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const document = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'] }),
  OutputJax: new SVG({ fontCache: 'local' }),
});

const node = document.convert(equationTex, { display: true });
const svg = adaptor.innerHTML(node);
mkdirSync('output', { recursive: true });
writeFileSync('output/equation.svg', `<?xml version="1.0" encoding="UTF-8"?>\n${svg}\n`);
