// Pseudo-localise three titles, draw each variant as one SVG line, rasterise with resvg and
// measure ink width. Writes output/*.svg, *.png and output/lines.json.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pseudoLocalizeString } from 'pseudo-localization';

const boxWidthPx = 760;
const fontSizePx = 40;
const titles = ['Buy now', 'Summer Sale: 50% off', 'Free shipping on every order'];
const variants = {
  original: (text) => text,
  accented: (text) => pseudoLocalizeString(text),
  bidi: (text) => pseudoLocalizeString(text, { strategy: 'bidi' }),
};

mkdirSync('output', { recursive: true });
const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const lines = [];
const missingGlyphs = new Set();

for (const [titleIndex, title] of titles.entries()) {
  for (const [variantName, transform] of Object.entries(variants)) {
    const text = transform(title);
    const stem = `output/t${titleIndex}-${variantName}`;
    // The canvas is wider than the box so overflow is measured, not clipped.
    writeFileSync(`${stem}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="80" viewBox="0 0 1400 80"><rect width="1400" height="80" fill="white"/><rect width="${boxWidthPx + 20}" height="80" fill="#eef"/><text x="20" y="55" font-family="JetBrains Mono" font-weight="700" font-size="${fontSizePx}" fill="black" xml:space="preserve">${escapeXml(text)}</text></svg>`);
    const resvg = spawnSync('resvg', ['--skip-system-fonts', '--use-font-file', 'fonts/JetBrainsMono-Bold.ttf', '--font-family', 'JetBrains Mono', `${stem}.svg`, `${stem}.png`], { encoding: 'utf8' });
    if (resvg.status !== 0) throw new Error(`resvg failed: ${resvg.stderr}`);
    // resvg names each character the font cannot draw; those render as tofu boxes.
    for (const [, codePoint] of resvg.stderr.matchAll(/U\+([0-9A-F]+) character/g)) missingGlyphs.add(codePoint);
    // Ink = pixels darker than the pale box fill, so the box edge is not counted.
    const inkWidthPx = Number(execFileSync('magick', [`${stem}.png`, '-colorspace', 'Gray', '-threshold', '50%', '-negate', '-trim', '-format', '%w', 'info:']).toString());
    lines.push({ title, variant: variantName, text, characterCount: [...text].length, inkWidthPx, overflowsBox: inkWidthPx + 20 > boxWidthPx });
  }
}
writeFileSync('output/lines.json', `${JSON.stringify({ missingGlyphs: [...missingGlyphs].sort(), lines }, null, 2)}\n`);
