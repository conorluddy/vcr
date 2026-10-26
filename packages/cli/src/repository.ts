import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fail, ok, type Result } from "./result.types.js";

// === PUBLIC API ===

/** Walks up from this file until it finds the workspace root (the directory holding `catalog/`). */
export function findRepositoryRoot(startDirectory = dirname(fileURLToPath(import.meta.url))): string {
  let current = resolve(startDirectory);
  while (!existsSync(join(current, "catalog"))) {
    const parent = dirname(current);
    if (parent === current) throw new Error("Cannot find repository root: no ancestor directory contains catalog/");
    current = parent;
  }
  return current;
}

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
