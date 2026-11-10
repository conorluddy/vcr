import { openScenePage, settleFrame } from "@vcr/capture";
import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { prepareBrowserRuntime, runtimeDirectory } from "./capture.js";
import type { Roots } from "./roots.js";

export async function previewStill(roots: Roots, workspace: string, sceneFile: string, width: number, height: number, fps: number, at?: string, marker?: string) {
  if ((at === undefined) === (marker === undefined)) throw new Error("Specify exactly one of --at or --marker");
  if (![width, height, fps].every(n => Number.isFinite(n) && n > 0)) throw new Error("Positive width, height and fps required");
  const browser = prepareBrowserRuntime(roots);
  if (!browser.ok) throw new Error(browser.error.message);
  const scene = await openScenePage({ sceneFile, width, height, captureMode: "screenshot", ...browser.value });
  try {
    const requested = at !== undefined ? Number(at) : await scene.page.evaluate((id) => {
      const markers = (window as unknown as { __scene: { markers?: Array<number | { id: string; t: number }> } }).__scene.markers ?? [];
      const matches = markers.filter((m): m is { id: string; t: number } => typeof m !== "number" && m.id === id);
      if (matches.length !== 1) throw new Error("Marker must match exactly once");
      return matches[0]!.t;
    }, marker!);
    const frame = Math.round(requested * fps);
    if (!Number.isFinite(requested) || requested < 0 || requested >= scene.duration || frame >= Math.round(scene.duration * fps)) throw new Error("Selection outside scene duration");
    await scene.page.evaluate(t => (window as unknown as { __scene: { seek(t: number): void } }).__scene.seek(t), frame / fps);
    await settleFrame(scene.page);
    const png = await scene.page.screenshot({ type: "png" });
    const directory = join(workspace, "output", "previews", randomUUID());
    mkdirSync(directory, { recursive: true });
    const image = join(directory, "still.png");
    const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");
    const metadata = { kind: "still", sceneFile, source_sha256: hash(readFileSync(sceneFile)), source_hash_scope: "entry file only", marker, requested_time: requested, frame, time: frame / fps, width, height, fps, capture_mode: "screenshot", workspace, runtime: runtimeDirectory(roots), serving_root: dirname(sceneFile), png_sha256: hash(png), motion_verified: false, full_scene_verified: false };
    writeFileSync(image, png);
    const sidecar = join(directory, "still.json");
    writeFileSync(sidecar, JSON.stringify(metadata, null, 2) + "\n");
    return { image, sidecar, ...metadata };
  } finally { await scene.close(); }
}
