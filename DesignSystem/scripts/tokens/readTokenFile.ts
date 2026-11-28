import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { type PlainToken, RESERVED_KEYS, type TokenFamily, type TokenFile } from "./tokenFile.types";

// === PUBLIC API ===

export const TOKEN_FILE_PATH = fileURLToPath(new URL("../../tokens/tokens.json", import.meta.url));

export function readTokenFile(path: string = TOKEN_FILE_PATH): TokenFile {
  return JSON.parse(readFileSync(path, "utf8")) as TokenFile;
}

/** The extra `{ tokens: [...] }` families (font-size, tracking, size…), keyed by family name, in file order. */
export function listExtraFamilies(tokenFile: TokenFile): Array<[string, TokenFamily<PlainToken>]> {
  return Object.entries(tokenFile)
    .filter(([key]) => !RESERVED_KEYS.has(key))
    .filter((entry): entry is [string, TokenFamily<PlainToken>] => isTokenFamily(entry[1]));
}

// === PRIVATE HELPERS ===

function isTokenFamily(value: unknown): value is TokenFamily<PlainToken> {
  return typeof value === "object" && value !== null && Array.isArray((value as { tokens?: unknown }).tokens);
}
