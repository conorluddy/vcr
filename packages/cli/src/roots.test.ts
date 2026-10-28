import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { requireDevMode, requireWorkspace, resolveRoots, type Roots } from "./roots.js";

/** A scratch tree: a fake harness (just `catalog/`) and a separate product directory with a nested subdirectory. */
function createScratchTree() {
  const base = mkdtempSync(join(tmpdir(), "vcr-roots-"));
  const harness = join(base, "harness");
  const product = join(base, "product");
  mkdirSync(join(harness, "catalog"), { recursive: true });
  mkdirSync(join(product, "videos/launch"), { recursive: true });
  return { base, harness, product, nested: join(product, "videos/launch") };
}

function resolveOrThrow(...args: Parameters<typeof resolveRoots>): Roots {
  const roots = resolveRoots(...args);
  if (!roots.ok) throw new Error(roots.error.message);
  return roots.value;
}

describe("resolveRoots", () => {
  test("finds the harness by walking up from the CLI directory", () => {
    const { harness } = createScratchTree();
    mkdirSync(join(harness, "cli"));
    expect(resolveOrThrow({ cwd: harness, env: {}, cliDirectory: join(harness, "cli") }).harness).toBe(harness);
  });

  test("VCR_HARNESS overrides the walk", () => {
    const { harness, product } = createScratchTree();
    expect(resolveOrThrow({ cwd: product, env: { VCR_HARNESS: harness }, cliDirectory: product }).harness).toBe(harness);
  });

  test("a VCR_HARNESS without catalog/ fails with HARNESS_NOT_FOUND", () => {
    const { product } = createScratchTree();
    expect(resolveRoots({ cwd: product, env: { VCR_HARNESS: product } })).toMatchObject({ ok: false, error: { code: "HARNESS_NOT_FOUND" } });
  });

  test("the workspace is the nearest ancestor of cwd holding vcr.json", () => {
    const { harness, product, nested } = createScratchTree();
    writeFileSync(join(product, "vcr.json"), "{}");
    const roots = resolveOrThrow({ cwd: nested, env: { VCR_HARNESS: harness } });
    expect(roots).toMatchObject({ workspace: product, isDevMode: false });
  });

  test("--workspace beats VCR_WORKSPACE beats the ancestor walk", () => {
    const { harness, product, nested, base } = createScratchTree();
    writeFileSync(join(product, "vcr.json"), "{}");
    const env = { VCR_HARNESS: harness, VCR_WORKSPACE: join(base, "from-env") };
    expect(resolveOrThrow({ cwd: nested, env }).workspace).toBe(join(base, "from-env"));
    expect(resolveOrThrow({ cwd: nested, env, workspaceFlag: "../.." }).workspace).toBe(product);
  });

  test("outside any workspace the workspace is null and requireWorkspace names the fix", () => {
    const { harness, product } = createScratchTree();
    const roots = resolveOrThrow({ cwd: product, env: { VCR_HARNESS: harness } });
    expect(roots.workspace).toBeNull();
    expect(requireWorkspace(roots)).toMatchObject({ ok: false, error: { code: "WORKSPACE_NOT_FOUND", message: expect.stringContaining("vcr workspace init") } });
  });

  test("VCR_HOME sets the machine root", () => {
    const { harness, base } = createScratchTree();
    expect(resolveOrThrow({ cwd: base, env: { VCR_HARNESS: harness, VCR_HOME: join(base, "home") } }).machine).toBe(join(base, "home"));
  });

  test("dev mode only when the workspace is the harness", () => {
    const { harness, product } = createScratchTree();
    writeFileSync(join(harness, "vcr.json"), "{}");
    const devRoots = resolveOrThrow({ cwd: harness, env: { VCR_HARNESS: harness } });
    expect(devRoots.isDevMode).toBe(true);
    expect(requireDevMode(devRoots, "catalog build").ok).toBe(true);
    const userRoots = resolveOrThrow({ cwd: product, env: { VCR_HARNESS: harness } });
    expect(requireDevMode(userRoots, "catalog build")).toMatchObject({ ok: false, error: { code: "MAINTAINER_ONLY" } });
  });
});
