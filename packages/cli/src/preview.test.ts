import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { captureFrames } from "@vcr/capture";
import { expect, test } from "vitest";
import { parsePreviewOptions, runPreview, selectPreviewFrames } from "./preview.js";
import type { Roots } from "./roots.js";

const delivery = { width: 160, height: 96, fps: 30000 / 1001 };
const flags = { width: String(delivery.width), height: String(delivery.height), fps: String(delivery.fps) };
const selections = { times: [0, 2.51 / delivery.fps, 2.8 / delivery.fps], markerIds: ["B03"], neighbors: 1, fps: delivery.fps };

test("rounds on the delivery grid, clips neighbors, and retains overlapping selections", () => {
  const result = selectPreviewFrames(selections, 5 / delivery.fps, [0.1, { id: "B03", t: 4 / delivery.fps }]);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  expect(result.value.map(({ frame }) => frame)).toEqual([0, 1, 2, 3, 4]);
  expect(result.value[3]).toEqual({
    frame: 3,
    time: 3 / delivery.fps,
    path: "frames/frame-0003.png",
    selections: [
      { requestedTime: selections.times[1], offsetFrames: 0 },
      { requestedTime: selections.times[2], offsetFrames: 0 },
      { requestedTime: 4 / delivery.fps, markerId: "B03", offsetFrames: -1 },
    ],
  });
});

test.each([5, 4.9])("rejects time at or rounding beyond the exclusive end (%s frames)", (frame) => {
  expect(selectPreviewFrames({ ...selections, times: [frame / delivery.fps], markerIds: [] }, 5 / delivery.fps, undefined))
    .toMatchObject({ ok: false, error: { code: "PREVIEW_TIME_OUT_OF_RANGE" } });
});

test.each([
  { markers: [0.1], code: "MARKER_NOT_FOUND" },
  { markers: [{ id: "b03", t: 0.1 }], code: "MARKER_NOT_FOUND" },
  { markers: [{ id: "B03", t: 0.1 }, { id: "B03", t: 0.11 }], code: "AMBIGUOUS_MARKER" },
  { markers: [{ id: "B03", t: "0.1" }], code: "INVALID_MARKER" },
])("reports $code for $markers", ({ markers, code }) => {
  expect(selectPreviewFrames(selections, 1, markers)).toMatchObject({ ok: false, error: { code } });
});

test.each([
  {}, { at: "0,,1" }, { at: "-0.1" }, { at: "Infinity" }, { marker: "B03," },
  { at: "0", neighbors: "-1" }, { at: "0", neighbors: "1.5" }, { at: "0", width: "1.2" },
  { at: "0", "serve-root": "/vcr-missing-directory" },
])("rejects malformed options %j", (options) => {
  expect(parsePreviewOptions("scene.html", { ...flags, ...options })).toMatchObject({ ok: false, error: { code: "INVALID_ARGUMENT" } });
});

test("previews a nested scene with shared assets at the same pixels as full capture", async () => {
  const workspace = mkdtempSync(join(tmpdir(), "vcr-preview-test-"));
  const previousTemp = process.env["TMPDIR"];
  try {
    const sceneFile = join(workspace, "scenes", "nested", "test #1.html");
    mkdirSync(dirname(sceneFile), { recursive: true });
    writeFileSync(join(workspace, "vcr.json"), "{}");
    writeFileSync(join(workspace, "shared.js"), 'export const background = "#8438f8";');
    writeFileSync(sceneFile, `<!doctype html><meta charset="utf-8">
      <style>body { margin: 0; } #box { width: 20px; height: 20px; background: orange; }</style>
      <div id="box"></div><script type="module">
        import { background } from "../../shared.js";
        document.body.style.background = background;
        window.__scene = {
          duration: 0.4, markers: [0.02, { id: "B03", t: 0.25 }],
          seek(t) { requestAnimationFrame(() => box.style.transform = "translateX(" + t * 200 + "px)"); },
        };
      </script>`);
    const roots: Roots = {
      harness: workspace, workspace, machine: join(workspace, ".vcr"), machineSource: "VCR_HOME",
      isDevMode: true, isCodexSandbox: Boolean(process.env["CODEX_SANDBOX"]),
    };
    const options = { ...delivery, sceneFile, serveRoot: workspace, times: [0.095], markerIds: ["B03"], neighbors: 1 };

    expect(await runPreview(roots, { ...options, markerIds: ["missing"] })).toMatchObject({ error: { code: "MARKER_NOT_FOUND" } });
    expect(existsSync(join(workspace, "output", "previews"))).toBe(false);

    const preview = await runPreview(roots, options);
    if (!preview.ok) throw new Error(preview.error.message);
    const { outputDirectory, contactSheet, reportPath, frames } = preview.value;
    expect(frames.map(({ frame }) => frame)).toEqual([2, 3, 4, 6, 7, 8]);
    expect(readdirSync(join(workspace, "output", "previews"))).toEqual([basename(outputDirectory)]);
    const full = join(workspace, "output", "full");
    await captureFrames({ ...delivery, sceneFile, serveRoot: workspace, outputDirectory: full, captureMode: "screenshot", chromiumArgs: roots.isCodexSandbox ? ["--single-process"] : [] });
    for (const { path } of frames) {
      const png = readFileSync(join(outputDirectory, path));
      expect(png.equals(readFileSync(join(full, path.slice("frames/".length))))).toBe(true);
      expect(png.readUInt32BE(16)).toBe(delivery.width);
      expect(png.readUInt32BE(20)).toBe(delivery.height);
    }
    expect(readFileSync(contactSheet).readUInt32BE(16)).toBe(1500);
    expect(JSON.parse(readFileSync(reportPath, "utf8"))).toMatchObject({
      source: "scenes/nested/test #1.html", contactSheet: "contact-sheet.png", frames,
    });
    expect(existsSync(join(workspace, "review"))).toBe(false);
    expect(existsSync(join(outputDirectory, "manifest.json"))).toBe(false);

    const brokenScene = join(dirname(sceneFile), "broken.html");
    writeFileSync(brokenScene, readFileSync(sceneFile, "utf8").replace("seek(t) {", 'seek(t) { if (t > 0.05) throw Error("seek failed");'));
    const failed = await runPreview(roots, { ...options, sceneFile: brokenScene, times: [0, 0.095], markerIds: [], neighbors: 0 });
    expect(failed).toMatchObject({ error: { code: "PREVIEW_FAILED", message: expect.stringContaining("seek failed") } });
    expect(readdirSync(join(workspace, "output", "previews"))).toEqual([basename(outputDirectory)]);
  } finally {
    if (previousTemp === undefined) delete process.env["TMPDIR"];
    else process.env["TMPDIR"] = previousTemp;
    rmSync(workspace, { recursive: true, force: true });
  }
}, 30_000);
