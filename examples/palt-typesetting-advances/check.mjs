// Predeclared checks, written before the first run. A failure stays a failure; never loosen a threshold.
import { readFileSync } from 'node:fs';

const m = JSON.parse(readFileSync('output/metrics.json', 'utf8'));
const checks = {
  'font licence is OFL-1.1': m.fontLicense === 'OFL-1.1',
  'library licence is MIT': m.libraryLicense === 'MIT',
  'render is identical across Typesetter instances': m.renderIdenticalAcrossInstances,
  'PNG is identical across two pages': m.pngIdenticalAcrossPages,
  'Noto Sans JP loaded (not fallback)': m.loadedFaces >= 1,
  'palt narrows the line by at least 5%': m.onWidthPx <= m.offWidthPx * 0.95,
  'palt never widens a character': m.widenedCount === 0,
  'palt narrows the punctuation 、 。 「': ['、', '。', '「'].every((character) => m.narrowedCharacters.includes(character)),
  'library inserts thin spaces between Japanese and Latin': m.thinSpaceCount >= 2,
  'palt still narrows the typeset output': m.typesetOnWidthPx < m.typesetOffWidthPx,
};
// Checks recorded as KNOWN FAIL on the first run (2026-11-27): the exit code flags any change from that record.
const knownFails = new Set([
  'palt never widens a character', // observed: 3 characters widen by up to 0.7px
  'palt narrows the punctuation 、 。 「', // observed: 「 is already half-width without palt (Chromium text-spacing-trim)
]);
let unexpected = 0;
for (const [name, ok] of Object.entries(checks)) {
  const known = knownFails.has(name);
  console.log(`${ok ? 'PASS' : known ? 'KNOWN FAIL' : 'FAIL'}: ${name}`);
  if (ok === known) unexpected += 1;
}
if (unexpected) {
  console.error(`${unexpected} check(s) differ from the recorded result`);
  process.exit(1);
}
