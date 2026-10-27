import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { renderVideo } from "./render.js";

let root: string;
let here: string;
const old = {
  rendered_at: "2026-01-01T00:00:00.000Z",
  environment: { node: "old-node" },
  recipe: { width: 100, height: 100, fps: 30 },
  scenes: { background: { start_s: 0, end_s: 20, frames: 600, first_hash: "original" } },
};
const capture = vi.fn(async () => ({ width: 100, height: 100, fps: 30, duration_s: 4, frames: 120, wall_ms: 100, frames_per_second: 1200, hashes: ["new"], shuffled_matches_sequential: null, mismatched_frames: [] }));
beforeEach(() => {
  capture.mockClear();
  root = mkdtempSync(join(tmpdir(), "vcr-render-test-"));
  here = join(root, "videos/demo");
  mkdirSync(here, { recursive: true });
  for (const name of ["gsap", "three", "p5"]) {
    mkdirSync(join(root, "node_modules", name), { recursive: true });
    writeFileSync(join(root, "node_modules", name, "package.json"), '{"version":"test"}');
  }
  writeFileSync(join(here, "video.json"), JSON.stringify({ parameters: { design: { width: 100, height: 100 }, motion: { fps: 30, scenes: { background: [0, 20], title: [0, 4] } } } }));
  writeFileSync(join(here, "render-manifest.json"), JSON.stringify(old));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));
const readManifest = () => JSON.parse(readFileSync(join(here, "render-manifest.json"), "utf8"));

test("partial capture preserves other scenes and archives the previous manifest", async () => {
  await renderVideo(here, "title", capture);
  const manifest = readManifest();
  expect(capture).toHaveBeenCalledOnce();
  expect(manifest.scenes.background).toMatchObject({ ...old.scenes.background, environment: old.environment, captured_at: old.rendered_at });
  expect(manifest.scenes.title.first_hash).toBe("new");
  expect(manifest.status).toBe("captured");
  expect(manifest.outputs).toEqual(["output/frames/background", "output/frames/title"]);
  expect(JSON.parse(readFileSync(join(here, manifest.previous_manifest), "utf8"))).toEqual(old);
  expect(readdirSync(join(here, "output/manifests"))).toHaveLength(1);
});

test("unknown selector fails without capture or manifest writes", async () => {
  await expect(renderVideo(here, "typo", capture)).rejects.toThrow("Unknown scene");
  expect(capture).not.toHaveBeenCalled();
  expect(readManifest()).toEqual(old);
  expect(existsSync(join(here, "output"))).toBe(false);
});

test("partial capture cannot mix frame rates", async () => {
  writeFileSync(join(here, "render-manifest.json"), JSON.stringify({ ...old, recipe: { ...old.recipe, fps: 24 } }));
  await expect(renderVideo(here, "title", capture)).rejects.toThrow("FPS changed");
  expect(capture).not.toHaveBeenCalled();
  expect(readManifest().recipe.fps).toBe(24);
});

test("failed capture preserves existing evidence", async () => {
  capture.mockRejectedValueOnce(new Error("capture failed"));
  await expect(renderVideo(here, "title", capture)).rejects.toThrow("capture failed");
  expect(readManifest()).toEqual(old);
});

test("a selected capture without other evidence remains partial", async () => {
  rmSync(join(here, "render-manifest.json"));
  await renderVideo(here, "title", capture);
  expect(readManifest().status).toBe("partial");
});
