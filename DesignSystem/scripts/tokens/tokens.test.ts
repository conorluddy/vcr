// @vitest-environment node
import { describe, expect, test } from "vitest";
import { compileTokensCss, valueForTheme } from "./compileTokensCss";
import { contrastRatio } from "./contrastRatio";
import { listExtraFamilies, readTokenFile } from "./readTokenFile";
import type { ColorToken } from "./tokenFile.types";

const tokenFile = readTokenFile();
const themeIds = tokenFile.color.themes.map((theme) => theme.id);
const firstThemeId = themeIds[0] ?? "dark";
const colorByName = new Map(tokenFile.color.tokens.map((token) => [token.name, token]));

const NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const COLOR_VALUE_PATTERN =
  /^(#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|rgba?\([\d.,\s]+\)|\{[A-Za-z0-9_.-]+\})$/;

describe("tokens.json follows the grammar the artifact page reads", () => {
  test("every token name is valid and used once across families", () => {
    const names = [
      ...tokenFile.color.tokens,
      ...tokenFile.spacing.tokens,
      ...tokenFile.radius.tokens,
      ...tokenFile.shadow.tokens,
      ...listExtraFamilies(tokenFile).flatMap(([, family]) => family.tokens),
    ].map((token) => token.name);
    expect(names.filter((name) => !NAME_PATTERN.test(name))).toEqual([]);
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([]);
  });

  test("every token carries a vcr- prefix and a usage note", () => {
    const tokens = [
      ...tokenFile.color.tokens,
      ...tokenFile.spacing.tokens,
      ...tokenFile.radius.tokens,
      ...tokenFile.shadow.tokens,
      ...listExtraFamilies(tokenFile).flatMap(([, family]) => family.tokens),
    ];
    expect(tokens.filter((token) => !token.name.startsWith("vcr-")).map((token) => token.name)).toEqual([]);
    expect(tokens.filter((token) => token.usage.trim() === "").map((token) => token.name)).toEqual([]);
  });

  test("colour values are hex, rgb() or an alias of an existing token, in every theme", () => {
    const problems = tokenFile.color.tokens.flatMap((token) =>
      themeIds.flatMap((themeId) => {
        const value = rawValue(token, themeId);
        if (!COLOR_VALUE_PATTERN.test(value)) {
          return [`${token.name}/${themeId}: "${value}" is not a value the page reads`];
        }
        const alias = /^\{(.+)\}$/.exec(value)?.[1];
        if (alias && (alias === token.name || !colorByName.has(alias))) {
          return [`${token.name}/${themeId}: alias {${alias}} does not resolve`];
        }
        return [];
      }),
    );
    expect(problems).toEqual([]);
  });

  test("the extra families stay within the page's limit of twelve", () => {
    expect(listExtraFamilies(tokenFile).length).toBeLessThanOrEqual(12);
  });

  test("every type style uses a size from the font-size scale the components read", () => {
    const scale = new Set(
      listExtraFamilies(tokenFile)
        .filter(([family]) => family === "font-size")
        .flatMap(([, family]) => family.tokens.map((token) => token.value)),
    );
    const offScale = tokenFile.type.groups
      .flatMap((group) => group.styles)
      .filter((style) => !scale.has(style.fontSize))
      .map((style) => `${style.name}: ${style.fontSize}`);
    expect(offScale).toEqual([]);
  });
});

describe("text stays legible in every theme", () => {
  const readableText = [
    "vcr-text-primary",
    "vcr-text-strong",
    "vcr-text-body",
    "vcr-text-secondary",
    "vcr-text-tertiary",
    "vcr-text-quiet",
    "vcr-text-segment-unselected",
  ];

  test.each(themeIds)("text tokens hold 4.5:1 on the ground in %s", (themeId) => {
    const failures = readableText
      .map((name) => ({
        name,
        ratio: contrastRatio(resolveHex(name, themeId), resolveHex("vcr-ground", themeId)),
      }))
      .filter((result) => result.ratio < 4.5)
      .map((result) => `${result.name} ${result.ratio.toFixed(2)}:1`);
    expect(failures).toEqual([]);
  });

  test.each(themeIds)("text on bone holds 4.5:1 in %s", (themeId) => {
    expect(
      contrastRatio(resolveHex("vcr-text-on-bone", themeId), resolveHex("vcr-bone", themeId)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  test.each(themeIds)("an empty rating star holds 3:1 on the ground in %s", (themeId) => {
    expect(
      contrastRatio(resolveHex("vcr-star-off", themeId), resolveHex("vcr-ground", themeId)),
    ).toBeGreaterThanOrEqual(3);
  });
});

describe("compileTokensCss", () => {
  const css = compileTokensCss(tokenFile);

  test("starts with the line the page uses to recognise a generated file", () => {
    expect(css.split("\n")[0]).toBe("/* VCRStudio — generated from tokens.json */");
  });

  test("puts the first theme on :root and gives later themes their own block", () => {
    expect(css).toContain(':root, [data-theme="dark"] {');
    expect(css).toContain('[data-theme="light"] {');
  });

  test("turns aliases into var() references", () => {
    expect(css).toContain("--vcr-text-primary: var(--vcr-bone);");
  });

  test("lets a token without a light value inherit the dark one", () => {
    expect(valueForTheme({ dark: "#000000" }, "light", "dark")).toBe("#000000");
  });

  test("emits font families as --font-<key> and one class per type style", () => {
    expect(css).toContain('--font-vcr-mono: "Fragment Mono", ui-monospace, monospace;');
    expect(css).toMatch(/\.vcr-mono-label \{ font-family: var\(--font-vcr-mono\); font-size: 9px;/);
  });
});

// === PRIVATE HELPERS ===

function rawValue(token: ColorToken, themeId: string): string {
  return typeof token.value === "string"
    ? token.value
    : (token.value[themeId] ?? token.value[firstThemeId] ?? "");
}

function resolveHex(name: string, themeId: string, depth = 0): string {
  const token = colorByName.get(name);
  if (!token || depth > 16) {
    throw new Error(`resolveHex: cannot resolve "${name}" in ${themeId}`);
  }
  const value = rawValue(token, themeId);
  const alias = /^\{(.+)\}$/.exec(value)?.[1];
  return alias ? resolveHex(alias, themeId, depth + 1) : value;
}
