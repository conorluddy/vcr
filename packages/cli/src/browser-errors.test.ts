import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { captureFrames } from "@vcr/capture";
import { lintScenes } from "@vcr/lint";
import { runCapture } from "./capture.js";
import { runLint } from "./lint.js";
import type { Roots } from "./roots.js";

vi.mock("@vcr/capture", () => ({ captureFrames: vi.fn() }));
vi.mock("@vcr/lint", () => ({ lintScenes: vi.fn(), loadSafeZone: vi.fn() }));
const directories: string[] = [];
afterEach(() => { vi.resetAllMocks(); for (const path of directories.splice(0)) rmSync(path, { recursive: true, force: true }); });

it.each(["capture", "lint"] as const)("returns %s readiness diagnostics through the CLI result", async (command) => {
  const root = mkdtempSync(join(tmpdir(), "vcr-browser-error-"));
  directories.push(root);
  const sceneFile = join(root, "scene.html");
  writeFileSync(sceneFile, "<html></html>");
  const roots: Roots = { harness: root, workspace: root, machine: root, machineSource: "VCR_HOME", isCodexSandbox: false, isDevMode: true };
  const message = `Scene readiness failed; serving root: ${root}; HTTP 404: /missing.woff2`;
  vi.mocked(captureFrames).mockRejectedValue(new Error(message));
  vi.mocked(lintScenes).mockRejectedValue(new Error(message));
  const result = command === "capture"
    ? await runCapture(roots, { sceneFile, outputDirectory: join(root, "output"), width: 128, height: 128, fps: 30, verifyDeterminism: false })
    : await runLint(roots, { target: sceneFile, safeZoneName: "none", width: 128, height: 128, times: undefined, useMarkers: false, samples: 1, fps: 30 });
  expect(result).toMatchObject({ ok: false, error: { code: command === "capture" ? "CAPTURE_FAILED" : "LINT_FAILED", message } });
});
