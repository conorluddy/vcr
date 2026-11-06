// Method from the field notes (#46, #59): seek to each sample, let it settle, then measure layout in the page.
import { relative } from "node:path";
import { openScenePage, settleFrame } from "@vcr/capture";
import { findingsForSample, mergeFindings, OVERFLOW_TOLERANCE_PX, sampleTimes } from "./findings.js";
import type { LintFinding, LintOptions, LintReport, PageMeasurement, UnableToAssess } from "./lint.types.js";
import { measurePage } from "./measure-page.js";

// === PUBLIC API ===

/** Lints each scene in turn, one browser per scene. `displayRoot` shortens scene paths in the report. */
export async function lintScenes(sceneFiles: string[], options: Omit<LintOptions, "sceneFile">, displayRoot: string): Promise<LintReport> {
  const report: LintReport = { scenes: [], samples: {}, findings: [], unableToAssess: [] };
  for (const sceneFile of sceneFiles) {
    const scene = relative(displayRoot, sceneFile) || sceneFile;
    const outcome = await lintScene({ ...options, sceneFile }, scene);
    report.scenes.push(scene);
    report.samples[scene] = outcome.times;
    report.findings.push(...outcome.findings);
    if (outcome.unableToAssess) report.unableToAssess.push(outcome.unableToAssess);
  }
  return report;
}

export async function lintScene(options: LintOptions, scene: string): Promise<{ times: number[]; findings: LintFinding[]; unableToAssess: UnableToAssess | null }> {
  const opened = await openScenePage({
    sceneFile: options.sceneFile,
    width: options.width,
    height: options.height,
    playwrightRuntimeDirectory: options.playwrightRuntimeDirectory,
    chromiumArgs: options.chromiumArgs,
  });
  try {
    const { page, duration } = opened;
    // esbuild (tsx, the plugin bundle) may wrap named functions in __name(); the page has no such helper.
    await page.evaluate("globalThis.__name ??= (target) => target");
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const markers = options.useMarkers ? await readMarkers(page) : undefined;
    if (options.useMarkers && (!markers || markers.length === 0)) throw new Error(`${scene}: --markers needs window.__scene.markers, an array of times in seconds`);
    const times = sampleTimes(duration, options.fps, options.samples, options.times, markers);

    const findings: LintFinding[] = [];
    let sawText = false;
    let measurement: PageMeasurement | undefined;
    for (const t of times) {
      await page.evaluate((seconds) => (window as unknown as { __scene: { seek(t: number): void } }).__scene.seek(seconds), t);
      await settleFrame(page);
      measurement = await page.evaluate(measurePage, { overflowTolerancePx: OVERFLOW_TOLERANCE_PX });
      if (measurement.textBoundsError) throw new Error(`${scene} at ${t}s: ${measurement.textBoundsError}`);
      sawText ||= measurement.texts.length > 0 || measurement.sceneTextBounds !== null;
      findings.push(...findingsForSample(measurement, { scene, t, width: options.width, height: options.height, safeZone: options.safeZone }).map((finding) => ({ ...finding, frame: Math.round(t * options.fps) })));
    }
    const isCanvasWithoutText = measurement?.hasCanvas === true && !sawText;
    const unableToAssess = isCanvasWithoutText ? { scene, reason: "canvas scene with no DOM text and no window.__scene.textBounds(); text placement was not checked. Add textBounds() or review frames by eye." } : null;
    return { times, findings: mergeFindings(findings), unableToAssess };
  } finally {
    await opened.close();
  }
}

// === PRIVATE HELPERS ===

async function readMarkers(page: Awaited<ReturnType<typeof openScenePage>>["page"]): Promise<number[] | undefined> {
  const markers = await page.evaluate(() => (window as unknown as { __scene: { markers?: unknown } }).__scene.markers);
  if (!Array.isArray(markers) || !markers.every((marker) => Number.isFinite(marker))) return undefined;
  return markers as number[];
}
