// Hyphenate German and English strings with Hyphenopoly, then wrap each to a narrow measure
// with and without the inserted soft hyphens. Facts go to output/metrics.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import hyphenopoly from 'hyphenopoly';

const SOFT_HYPHEN = '­';
const MEASURE_COLUMNS = 14;
const samples = [
  { language: 'de', text: 'Donaudampfschifffahrtsgesellschaft und Geschwindigkeitsbegrenzung' },
  { language: 'en-us', text: 'Internationalization of typographical hyphenation' },
  { language: 'en-us', text: 'short words stay as they are' },
];

const hyphenator = hyphenopoly.config({
  hyphen: SOFT_HYPHEN,
  loader: (file, patternDirectory) => readFile(new URL(file, patternDirectory)),
  require: ['de', 'en-us'],
});

// Greedy wrap by character count. A soft hyphen is a break point that prints "-" when used.
// Each piece is appended to the line when it fits; otherwise the line ends and the piece starts the next.
function wrap(text, columns) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const pieces = word.split(SOFT_HYPHEN);
    pieces.forEach((piece, index) => {
      const isFirstPiece = index === 0;
      const isLastPiece = index === pieces.length - 1;
      const separator = isFirstPiece && line !== '' ? ' ' : '';
      // reserve a column for the hyphen the break will print
      const needed = (line + separator + piece).length + (isLastPiece ? 0 : 1);
      if (line !== '' && needed > columns) {
        lines.push(isFirstPiece ? line : `${line}-`);
        line = piece;
      } else line += separator + piece;
    });
  }
  if (line) lines.push(line);
  return lines;
}

const results = [];
for (const { language, text } of samples) {
  const hyphenated = (await hyphenator.get(language))(text);
  const plainLines = wrap(text, MEASURE_COLUMNS);
  const hyphenatedLines = wrap(hyphenated, MEASURE_COLUMNS);
  results.push({
    language,
    hyphenated: hyphenated.replaceAll(SOFT_HYPHEN, '·'),
    roundTrips: hyphenated.replaceAll(SOFT_HYPHEN, '') === text,
    softHyphenCount: hyphenated.split(SOFT_HYPHEN).length - 1,
    plainLines,
    plainOverflowLines: plainLines.filter((line) => line.length > MEASURE_COLUMNS).length,
    hyphenatedLines,
    hyphenatedOverflowLines: hyphenatedLines.filter((line) => line.length > MEASURE_COLUMNS).length,
  });
}

mkdirSync('output', { recursive: true });
writeFileSync('output/metrics.json', `${JSON.stringify({ measureColumns: MEASURE_COLUMNS, results }, null, 2)}\n`);
for (const r of results) console.log(r.language, r.hyphenated, '\n  plain:', r.plainLines, '\n  hyph :', r.hyphenatedLines);
