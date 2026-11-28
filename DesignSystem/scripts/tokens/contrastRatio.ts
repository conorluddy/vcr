// === PUBLIC API ===

/** WCAG 2 contrast ratio between two opaque sRGB hex colours. */
export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const [lighter, darker] = [relativeLuminance(foregroundHex), relativeLuminance(backgroundHex)].sort(
    (a, b) => b - a,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

// === PRIVATE HELPERS ===

function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) {
    throw new Error(`contrastRatio: expected #rrggbb, got "${hex}".`);
  }
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(match[1]?.slice(offset, offset + 2) ?? "0", 16) / 255,
  );
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
