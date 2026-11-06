import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
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

/** Writes through a temp file and a rename, so a reader never sees half a file (PRD §6.4 writes). */
export function writeFileAtomic(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporaryPath, content);
  renameSync(temporaryPath, filePath);
}

export function writeJsonAtomic(filePath: string, value: unknown): void {
  writeFileAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
