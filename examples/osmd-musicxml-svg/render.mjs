// MusicXML to SVG with OpenSheetMusicDisplay in Node: jsdom supplies the DOM, no browser.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="score"></div></body></html>', { pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.XMLSerializer = dom.window.XMLSerializer;

// jsdom has no canvas; VexFlow only needs a 2D context for text measurement.
const measuringCanvas = createCanvas(1, 1);
dom.window.HTMLCanvasElement.prototype.getContext = (type) => measuringCanvas.getContext(type);

const container = document.getElementById('score');
Object.defineProperty(container, 'offsetWidth', { value: 900 });
Object.defineProperty(container, 'clientWidth', { value: 900 });

const { default: osmdModule } = await import('opensheetmusicdisplay');
const { OpenSheetMusicDisplay } = osmdModule;
const osmd = new OpenSheetMusicDisplay(container, { backend: 'svg', autoResize: false, drawTitle: true });
await osmd.load(readFileSync('score.musicxml', 'utf8'));
osmd.render();

const svg = container.querySelector('svg');
if (!svg) throw new Error('OSMD produced no <svg>');
svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
mkdirSync('output', { recursive: true });
writeFileSync('output/score.svg', `<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML}\n`);
