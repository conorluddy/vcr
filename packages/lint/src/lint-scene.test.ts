// Drives real Chromium through @vcr/capture, so it doubles as an integration test of openScenePage.
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { lintScene } from "./lint-scene.js";
import { loadSafeZone } from "./safe-zones.js";

const repositoryRoot = resolve(import.meta.dirname, "../../..");
const scene = (example: string) => join(repositoryRoot, "examples", example, "scene.html");

describe("lint a browser scene", () => {
  test("the lint-overflow fixture yields exactly the rail crossing and the clipped box", async () => {
    const tiktok = loadSafeZone(repositoryRoot, "tiktok");
    if (!tiktok.ok) throw new Error(tiktok.error.message);
    const outcome = await lintScene({ sceneFile: scene("lint-overflow"), width: 1080, height: 1920, safeZone: tiktok.value, samples: 4, fps: 30 }, "lint-overflow");
    expect(outcome.findings.map((finding) => [finding.rule, finding.selector]).sort()).toEqual([["TYPO-SAFE", "#rail-title"], ["overflow", "#overflow-box"]]);
    expect(outcome.findings.find((finding) => finding.rule === "TYPO-SAFE")?.verified).toBe(false);
    expect(outcome.unableToAssess).toBeNull();
  }, 30_000);

  test("markers choose the sample times", async () => {
    const outcome = await lintScene({ sceneFile: scene("lint-overflow"), width: 1080, height: 1920, safeZone: null, useMarkers: true, samples: 8, fps: 30 }, "lint-overflow");
    expect(outcome.times).toEqual([0.5, 0.95]);
  }, 30_000);

  test("a clean scene yields no findings", async () => {
    const outcome = await lintScene({ sceneFile: scene("browser-capture"), width: 1920, height: 1080, safeZone: null, samples: 8, fps: 30 }, "browser-capture");
    expect(outcome.findings).toEqual([]);
  }, 30_000);

  test("a canvas scene without textBounds is unable to assess, never a pass", async () => {
    const outcome = await lintScene({ sceneFile: scene("canvas2d-capture"), width: 1280, height: 720, safeZone: null, samples: 2, fps: 30 }, "canvas2d-capture");
    expect(outcome.findings).toEqual([]);
    expect(outcome.unableToAssess?.reason).toMatch(/textBounds/);
  }, 30_000);
});
