// Predeclared checks on output/lines.json; writes output/metrics.json (facts only, no media).
import { readFileSync, writeFileSync } from 'node:fs';
import { pseudoLocalizeString } from 'pseudo-localization';

const { missingGlyphs, lines } = JSON.parse(readFileSync('output/lines.json', 'utf8'));
const pick = (title, variant) => lines.find((line) => line.title === title && line.variant === variant);
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

const titles = [...new Set(lines.map((line) => line.title))];
const metrics = { boxWidthPx: 760, missingGlyphs, titles: {} };
for (const title of titles) {
  const original = pick(title, 'original');
  const accented = pick(title, 'accented');
  const bidi = pick(title, 'bidi');
  expect(pseudoLocalizeString(title) === accented.text, `${title}: string transform not repeatable`);
  expect(accented.characterCount >= original.characterCount * 1.25, `${title}: accented did not lengthen text by 25%`);
  expect(accented.inkWidthPx >= original.inkWidthPx * 1.25, `${title}: accented ink did not widen by 25%`);
  expect(!original.overflowsBox, `${title}: original unexpectedly overflows`);
  expect(/^‮.*‬$/u.test(bidi.text), `${title}: bidi text not wrapped in RLO..PDF`);
  expect([...bidi.text].length === [...title].length + 2, `${title}: bidi changed the character count beyond the two controls`);
  metrics.titles[title] = {
    originalCharacters: original.characterCount,
    accentedCharacters: accented.characterCount,
    accentedText: accented.text,
    accentedOverflowsBox: accented.overflowsBox,
  };
}
expect(pick(titles[0], 'accented').overflowsBox === false, 'shortest title should still fit the box');
expect(pick(titles.at(-1), 'accented').overflowsBox === true, 'longest accented title should overflow the box (the detection claim)');
expect(missingGlyphs.length > 0, 'expected the pseudo-localised text to expose glyphs missing from JetBrains Mono Bold');
if (failures.length) throw new Error(`checks failed:\n${failures.join('\n')}`);
writeFileSync('output/metrics.json', `${JSON.stringify(metrics, null, 2)}\n`);
