import { listExtraFamilies } from "./readTokenFile";
import type { ThemedValue, TokenFile, TypeStyle } from "./tokenFile.types";

// === PUBLIC API ===

/**
 * Compiles tokens.json into tokens.css laid out as the artifact page compiles it (format.md, "tokens.css as
 * compiled"), so the repository, tests and local previews see exactly what the published system serves.
 */
export function compileTokensCss(tokenFile: TokenFile): string {
  const [firstTheme, ...laterThemes] = tokenFile.color.themes;
  if (!firstTheme) {
    throw new Error("tokens.json: color.themes is empty; expected at least one theme (dark first).");
  }
  const themed = [...tokenFile.color.tokens, ...tokenFile.shadow.tokens];
  const blocks = [
    `/* ${tokenFile.name} — generated from tokens.json */`,
    declarationBlock(
      `:root, [data-theme="${firstTheme.id}"]`,
      themed.map((token) => [token.name, valueForTheme(token.value, firstTheme.id, firstTheme.id)]),
    ),
    ...laterThemes.map((theme) =>
      declarationBlock(
        `[data-theme="${theme.id}"]`,
        themed.map((token) => [token.name, valueForTheme(token.value, theme.id, firstTheme.id)]),
      ),
    ),
    declarationBlock(":root", [...plainDeclarations(tokenFile), ...familyDeclarations(tokenFile)]),
    ...tokenFile.type.groups.flatMap((group) =>
      group.styles.map((style) => typeStyleRule(style, style.family ?? group.family)),
    ),
  ];
  return `${blocks.join("\n\n")}\n`;
}

/** Resolves a value for one theme; a missing theme inherits the first theme's value, as the page does. */
export function valueForTheme(value: ThemedValue, themeId: string, firstThemeId: string): string {
  const raw = typeof value === "string" ? value : (value[themeId] ?? value[firstThemeId]);
  if (raw === undefined) {
    throw new Error(
      `tokens.json: no value for theme "${themeId}" or "${firstThemeId}" in ${JSON.stringify(value)}.`,
    );
  }
  return raw.replace(/^\{(.+)\}$/, "var(--$1)");
}

// === PRIVATE HELPERS ===

function plainDeclarations(tokenFile: TokenFile): Array<[string, string]> {
  const spacingAndRadius = [...tokenFile.spacing.tokens, ...tokenFile.radius.tokens];
  const extras = listExtraFamilies(tokenFile).flatMap(([, family]) => family.tokens);
  return [...spacingAndRadius, ...extras].map((token) => [token.name, token.value]);
}

function familyDeclarations(tokenFile: TokenFile): Array<[string, string]> {
  return Object.entries(tokenFile.type.families).map(([key, stack]) => [`font-${key}`, stack]);
}

function declarationBlock(selector: string, declarations: Array<[string, string]>): string {
  const lines = declarations.map(([name, value]) => `  --${name}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

function typeStyleRule(style: TypeStyle, familyKey: string): string {
  const declarations = [
    `font-family: var(--font-${familyKey})`,
    `font-size: ${style.fontSize}`,
    `line-height: ${style.lineHeight}`,
    `font-weight: ${style.fontWeight}`,
    ...(style.letterSpacing ? [`letter-spacing: ${style.letterSpacing}`] : []),
  ];
  return `.${style.name} { ${declarations.join("; ")}; }`;
}
