// === TYPES ===
// The shape of tokens/tokens.json, as the Design System artifact page reads it (format.md, "tokens.json grammar").

export type ThemeId = string;

/** A plain value applies to every theme; a per-theme value may alias another token as "{name}". */
export type ThemedValue = string | Readonly<Record<ThemeId, string>>;

export interface Theme {
  readonly id: ThemeId;
  readonly name: string;
}

export interface ColorToken {
  readonly name: string;
  readonly value: ThemedValue;
  readonly usage: string;
}

export interface PlainToken {
  readonly name: string;
  readonly value: string;
  readonly usage: string;
}

export interface ShadowToken {
  readonly name: string;
  readonly value: ThemedValue;
  readonly usage: string;
}

export interface TypeStyle {
  readonly name: string;
  readonly fontSize: string;
  readonly lineHeight: number | string;
  readonly fontWeight: number;
  readonly letterSpacing?: string;
  readonly family?: string;
  readonly sample?: string;
  readonly usage: string;
}

export interface TypeGroup {
  readonly name: string;
  readonly family: string;
  readonly styles: readonly TypeStyle[];
}

export interface TokenFamily<TToken> {
  readonly note?: string;
  readonly tokens: readonly TToken[];
}

export interface TokenFile {
  readonly name: string;
  readonly version: number;
  readonly color: { readonly themes: readonly Theme[]; readonly tokens: readonly ColorToken[] };
  readonly type: {
    readonly fonts: readonly unknown[];
    readonly families: Readonly<Record<string, string>>;
    readonly groups: readonly TypeGroup[];
  };
  readonly spacing: TokenFamily<PlainToken>;
  readonly radius: TokenFamily<PlainToken>;
  readonly shadow: TokenFamily<ShadowToken>;
  /** Further families (font-size, tracking, size, duration…) the page shows as their own sections. */
  readonly [family: string]: unknown;
}

/** Families other than color, type, spacing, radius and shadow, in file order. */
export const RESERVED_KEYS: ReadonlySet<string> = new Set([
  "name",
  "version",
  "meta",
  "color",
  "type",
  "spacing",
  "radius",
  "shadow",
]);
