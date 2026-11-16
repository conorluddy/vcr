import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import satori from "satori";

const svg = await readFile(new URL("./output/layout.svg", import.meta.url), "utf8");
const rects = [...svg.matchAll(/<rect\b([^>]*)\/>/g)].map((match) => match[1]);
const hasRect = (text) => rects.some((rect) => text.split(" ").every((part) => rect.includes(part)));
const expected = [
  'x="0" y="0" width="360" height="220" fill="#102030"',
  'x="20" y="20" width="80" height="60" fill="#ff0000"',
  'x="112" y="20" width="120" height="100" fill="#00ff00"',
];
for (const shape of expected) if (!hasRect(shape)) throw new Error(`Missing expected layout rectangle: ${shape}`);
if (!svg.startsWith('<svg width="320" height="180" viewBox="0 0 320 180"')) throw new Error("Unexpected SVG canvas dimensions");
if (/<text\b/.test(svg)) throw new Error("Fixture unexpectedly includes text/font output");
const result = {
  version: JSON.parse(await readFile(new URL("./node_modules/satori/package.json", import.meta.url), "utf8")).version,
  canvas: "320x180",
  fontless: true,
  rectangles: ["background 0,0 360x220 #102030", "red 20,20 80x60", "green 112,20 120x100"],
  svg_sha256: createHash("sha256").update(svg).digest("hex"),
};
await writeFile(new URL("./output/metrics.json", import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
