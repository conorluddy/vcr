import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fail, ok, type Result } from "./result.types.js";

// === PUBLIC API ===

export function readJsonFile<T = unknown>(filePath: string): Result<T> {
  try {
    return ok(JSON.parse(readFileSync(filePath, "utf8")) as T);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return fail("INVALID_JSON", `${filePath}: ${message}`);
  }
}

/** Recursively lists files whose basename matches, skipping ignored directories. */
export function listFilesNamed(rootDirectory: string, fileName: string): string[] {
  if (!existsSync(rootDirectory)) return [];
  const ignoredDirectories = new Set(["node_modules", ".git", "dist", "output", ".cache"]);
  const found: string[] = [];
  const walk = (directory: string): void => {
    for (const entry of readdirSync(directory)) {
      const fullPath = join(directory, entry);
      if (statSync(fullPath).isDirectory()) {
        if (!ignoredDirectories.has(entry)) walk(fullPath);
      } else if (entry === fileName) {
        found.push(fullPath);
      }
    }
  };
  walk(rootDirectory);
  return found.sort();
}

export function listJsonFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => join(directory, entry))
    .sort();
}
