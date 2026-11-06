// Safe-zone presets live in references/typography/rules.json (canonical, see the KB §14). Read at
// runtime from the harness root so the repository and the installed plugin resolve the same file.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SafeZone } from "./lint.types.js";

// === TYPES ===

export const TYPOGRAPHY_RULES_PATH = "references/typography/rules.json";

/** Structurally the CLI's Result, so the CLI can pass failures straight through. */
export type SafeZoneResult = { ok: true; value: SafeZone } | { ok: false; error: { code: string; message: string; retryable: boolean } };

// === PUBLIC API ===

export function loadSafeZone(harnessRoot: string, name: string): SafeZoneResult {
  const presets = readSafeZones(harnessRoot);
  if (typeof presets === "string") return { ok: false, error: { code: "TYPOGRAPHY_RULES_UNREADABLE", message: `Cannot read safe zones from ${join(harnessRoot, TYPOGRAPHY_RULES_PATH)}: ${presets}`, retryable: false } };
  const preset = presets[name];
  if (!preset) return { ok: false, error: { code: "UNKNOWN_SAFE_ZONE", message: `No safe-zone preset "${name}". Use one of: ${Object.keys(presets).join(", ")}, or none.`, retryable: false } };
  return { ok: true, value: { name, ...preset } };
}

// === PRIVATE HELPERS ===

/** The presets, or a message saying why they could not be read. */
function readSafeZones(harnessRoot: string): Record<string, Omit<SafeZone, "name">> | string {
  try {
    const data = JSON.parse(readFileSync(join(harnessRoot, TYPOGRAPHY_RULES_PATH), "utf8")) as { safe_zones?: Record<string, Omit<SafeZone, "name">> };
    return data.safe_zones ?? "the file has no safe_zones";
  } catch (cause) {
    return cause instanceof Error ? cause.message : String(cause);
  }
}
