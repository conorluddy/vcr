import fs from 'node:fs';
import opentype from 'opentype.js';

const path = 'output/fixture.ttf';
const font = opentype.parse(fs.readFileSync(path));
const glyph = font.charToGlyph('A');
const commands = glyph.getPath(0, 0, 1000).commands.map(({type, x, y}) => [type, x, y].filter((v) => v !== undefined));
const result = {
  family: font.names.windows.fontFamily.en,
  unitsPerEm: font.unitsPerEm,
  glyphIndex: glyph.index,
  advanceWidth: glyph.advanceWidth,
  pathCommands: commands,
};
if (result.family !== 'VCR Fixture' || result.unitsPerEm !== 1000 || glyph.index !== 1 || glyph.advanceWidth !== 1000 || commands.map((c) => c[0]).join(',') !== 'M,L,L,L') throw new Error(JSON.stringify(result));
console.log(JSON.stringify(result, null, 2));
