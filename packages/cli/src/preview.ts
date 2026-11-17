import { mkdirSync, mkdtempSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { captureSceneFrame, frameFilename, openScenePage, type OpenScenePage } from "@vcr/capture";
import { prepareBrowserRuntime } from "./capture.js";
import { fail, ok, type Result } from "./result.types.js";
import { requireWorkspace, type Roots } from "./roots.js";

interface PreviewOptions {
  sceneFile: string;
  serveRoot: string | undefined;
  width: number;
  height: number;
  fps: number;
  times: number[];
  markerIds: string[];
  neighbors: number;
}

interface Selection {
  requestedTime: number;
  markerId?: string;
  offsetFrames: number;
}

interface PreviewFrame {
  frame: number;
  time: number;
  path: string;
  selections: Selection[];
}

interface PreviewReport {
  source: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  frames: PreviewFrame[];
  contactSheet: string;
}

export function parsePreviewOptions(scene: string | undefined, flags: Record<string, string | true>): Result<PreviewOptions> {
  if (!scene || extname(scene).toLowerCase() !== ".html") return fail("INVALID_ARGUMENT", "preview needs a local scene.html.");
  const width = Number(flags["width"]);
  const height = Number(flags["height"]);
  const fps = Number(flags["fps"]);
  if (width <= 0 || height <= 0 || !Number.isSafeInteger(width) || !Number.isSafeInteger(height) || fps <= 0 || !Number.isFinite(fps)) {
    return fail("INVALID_ARGUMENT", "preview needs positive integer --width and --height and positive --fps.");
  }
  const times = typeof flags["at"] === "string" ? flags["at"].split(",").map((part) => part.trim()) : [];
  if (times.some((time) => !time || !Number.isFinite(Number(time)) || Number(time) < 0)) {
    return fail("INVALID_ARGUMENT", "--at takes comma-separated non-negative timestamps in seconds, e.g. --at 10,18.25.");
  }
  const markerIds = typeof flags["marker"] === "string" ? flags["marker"].split(",").map((part) => part.trim()) : [];
  if (markerIds.some((id) => !id)) return fail("INVALID_ARGUMENT", "--marker takes comma-separated marker IDs, e.g. --marker B03,B05.");
  if (!times.length && !markerIds.length) return fail("INVALID_ARGUMENT", "preview needs --at, --marker, or both.");
  const neighbors = Number(flags["neighbors"] ?? 0);
  if (!Number.isSafeInteger(neighbors) || neighbors < 0 || (typeof flags["neighbors"] === "string" && !flags["neighbors"].trim())) {
    return fail("INVALID_ARGUMENT", "--neighbors takes a whole number of frames, 0 or greater.");
  }

  const sceneFile = resolve(scene);
  const serveRoot = typeof flags["serve-root"] === "string" ? resolve(flags["serve-root"]) : undefined;
  if (serveRoot) {
    const fromRoot = relative(serveRoot, sceneFile);
    try {
      if (isAbsolute(fromRoot) || fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || !statSync(serveRoot, { throwIfNoEntry: false })?.isDirectory()) {
        return fail("INVALID_ARGUMENT", "--serve-root must be a directory that contains the scene.");
      }
    } catch (cause) {
      return fail("INVALID_ARGUMENT", `Cannot inspect --serve-root: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  }
  return ok({ sceneFile, serveRoot, width, height, fps, times: times.map(Number), markerIds, neighbors });
}

export function selectPreviewFrames(options: Pick<PreviewOptions, "times" | "markerIds" | "fps" | "neighbors">, duration: number, markers: unknown): Result<PreviewFrame[]> {
  const { times, markerIds, fps, neighbors } = options;
  const totalFrames = Math.round(duration * fps);
  if (!Number.isFinite(duration) || !Number.isSafeInteger(totalFrames) || totalFrames < 1) {
    return fail("INVALID_SCENE_DURATION", "The scene duration and FPS must yield at least one frame and a finite, safe frame count.");
  }
  const selections: Omit<Selection, "offsetFrames">[] = [...new Set(times)].map((requestedTime) => ({ requestedTime }));
  const declaredMarkers: unknown[] = Array.isArray(markers) ? markers : [];
  for (const markerId of new Set(markerIds)) {
    const matches = declaredMarkers.filter((marker): marker is { id: string; t?: unknown } =>
      typeof marker === "object" && marker !== null && "id" in marker && marker.id === markerId);
    if (matches.length === 0) return fail("MARKER_NOT_FOUND", `The scene has no marker named "${markerId}". See window.__scene.markers or pass --at.`);
    if (matches.length > 1) return fail("AMBIGUOUS_MARKER", `The scene declares "${markerId}" more than once. Use unique marker IDs.`);
    const requestedTime = matches[0]!.t;
    if (typeof requestedTime !== "number" || !Number.isFinite(requestedTime)) {
      return fail("INVALID_MARKER", `Marker "${markerId}" needs a finite timestamp in seconds.`);
    }
    selections.push({ requestedTime, markerId });
  }

  const frames = new Map<number, PreviewFrame>();
  for (const selection of selections) {
    const { requestedTime, markerId } = selection;
    const center = Math.round(requestedTime * fps);
    if (requestedTime < 0 || requestedTime >= duration || center >= totalFrames) {
      const label = markerId ? `Marker "${markerId}" at ${requestedTime}s` : `Timestamp ${requestedTime}s`;
      return fail("PREVIEW_TIME_OUT_OF_RANGE", `${label} is outside the scene's delivery frame range. Last frame: ${totalFrames - 1} at ${(totalFrames - 1) / fps}s.`);
    }
    const first = Math.max(0, center - neighbors);
    const last = Math.min(totalFrames - 1, center + neighbors);
    for (let frame = first; frame <= last; frame += 1) {
      let entry = frames.get(frame);
      if (!entry) {
        entry = { frame, time: frame / fps, path: `frames/${frameFilename(frame)}`, selections: [] };
        frames.set(frame, entry);
      }
      entry.selections.push({ ...selection, offsetFrames: frame - center });
    }
  }
  return ok([...frames.values()].sort((a, b) => a.frame - b.frame));
}

export async function runPreview(roots: Roots, options: PreviewOptions): Promise<Result<PreviewReport & { outputDirectory: string; reportPath: string }>> {
  const { sceneFile, width, height, fps } = options;
  const parent = join(roots.workspace ?? dirname(sceneFile), "output", "previews");
  let staging: string | undefined;
  try {
    if (!statSync(sceneFile, { throwIfNoEntry: false })?.isFile()) return fail("SCENE_NOT_FOUND", `${sceneFile} does not exist or is not a file.`);
    if (roots.workspace) {
      const workspace = requireWorkspace(roots);
      if (!workspace.ok) return workspace;
    }
    const browser = prepareBrowserRuntime(roots);
    if (!browser.ok) return browser;
    const scene = await openScenePage({ ...options, ...browser.value });
    let report: PreviewReport;
    try {
      const markers = options.markerIds.length
        ? await scene.page.evaluate(() => (window as unknown as { __scene: { markers?: unknown } }).__scene.markers)
        : undefined;
      const frames = selectPreviewFrames(options, scene.duration, markers);
      if (!frames.ok) return frames;

      mkdirSync(parent, { recursive: true });
      staging = mkdtempSync(join(parent, ".preview-"));
      const source = roots.workspace ? relative(roots.workspace, sceneFile) : sceneFile;
      report = { source, width, height, fps, duration: scene.duration, frames: frames.value, contactSheet: "contact-sheet.png" };
      mkdirSync(join(staging, "frames"));
      for (const entry of report.frames) {
        const png = await captureSceneFrame(scene, entry.frame, fps);
        writeFileSync(join(staging, entry.path), png);
      }
      await writeContactSheet(scene, staging, report);
      writeFileSync(join(staging, "preview.json"), `${JSON.stringify(report, null, 2)}\n`);
    } finally {
      await scene.close();
    }
    const outputDirectory = join(parent, basename(staging).slice(1));
    renameSync(staging, outputDirectory);
    staging = undefined;
    return ok({ ...report, outputDirectory, reportPath: join(outputDirectory, "preview.json"), contactSheet: join(outputDirectory, report.contactSheet) });
  } catch (cause) {
    return fail("PREVIEW_FAILED", cause instanceof Error ? cause.message : String(cause));
  } finally {
    if (staging) rmSync(staging, { recursive: true, force: true });
  }
}

async function writeContactSheet(scene: OpenScenePage, directory: string, report: PreviewReport): Promise<void> {
  const page = scene.page;
  await page.goto("about:blank");
  await page.setViewportSize({ width: 1500, height: 480 });
  const frameUrl = "https://vcr-preview.invalid/";
  const tiles = report.frames.map((entry) => {
    const markers = entry.selections.flatMap(({ markerId, offsetFrames }) => {
      if (!markerId) return [];
      if (!offsetFrames) return [markerId];
      return [`${markerId} (${offsetFrames > 0 ? "+" : ""}${offsetFrames}f)`];
    });
    return { url: frameUrl + entry.path, label: [`Frame ${entry.frame}`, `${entry.time.toFixed(3)} s`, ...markers].join(" · ") };
  });
  const files = new Map(report.frames.map(({ path }) => [frameUrl + path, join(directory, path)]));
  await page.route(`${frameUrl}**`, (route) => {
    const path = files.get(route.request().url());
    return path ? route.fulfill({ path, contentType: "image/png" }) : route.abort();
  });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; background: #16181b; color: #fff; font: 18px system-ui, sans-serif; overflow-wrap: anywhere; }
    header { margin-bottom: 18px; font-size: 22px; font-weight: 600; }
    main { display: grid; gap: 16px; grid-template-columns: repeat(${Math.min(4, tiles.length)}, minmax(0, 1fr)); }
    figure { margin: 0; background: #25292f; align-self: start; }
    img { display: block; width: 100%; height: auto; max-height: 650px; object-fit: contain; background: #30343b; }
    figcaption { padding: 10px 12px; }
  </style><header></header><main></main>`);
  await page.evaluate(async ({ source, tiles }) => {
    document.querySelector("header")!.textContent = source;
    const grid = document.querySelector("main")!;
    const images = tiles.map(({ url, label }) => {
      const tile = document.createElement("figure");
      const image = document.createElement("img");
      image.src = url;
      const caption = document.createElement("figcaption");
      caption.textContent = label;
      tile.append(image, caption);
      grid.append(tile);
      return image.decode();
    });
    await Promise.all(images);
    await document.fonts.ready;
  }, { source: report.source, tiles });
  await page.screenshot({ path: join(directory, report.contactSheet), fullPage: true });
}
