import type { SeriesBrief } from "./brief.js";
import type { Diagnostic } from "./validate.js";
import type { Finding, Severity } from "./review.js";

// Plan checks (references/story KB §9.1) on a video's beat sheet, before anything renders. Each check
// cites the render-stage rule that owns its threshold (story README, open decision 1); none holds a
// number of its own. Pure: sheet, series brief and thresholds in; finding records out, never written.

// === TYPES ===

export type BeatRole = "hook" | "promise" | "payoff" | "rest" | "cta";

export interface Beat {
  id: string;
  role?: BeatRole;
  purpose: string;
  must_show: string[];
  on_screen_text: string | null;
  vo: string | null;
  duration_s: number;
  transition_in: string;
  transition_out: string;
  sound_cues?: Array<{ t: number; cue: string }>;
  mandatories?: string[];
  claims?: string[];
  board_frames?: string[];
  aspects?: string[];
  notes?: string;
}

export interface BeatSheet {
  schema_version: string;
  video_id: string;
  fps: number;
  target_s: number;
  mechanism?: string;
  beats: Beat[];
}

/** A finding on a plan rather than a render: no render, scene or frame; the plan's hash and the beat instead. */
export type PlanFinding = Pick<Finding, "rule_id" | "kind" | "severity_basis" | "confidence" | "evidence" | "severity" | "text" | "author"> & {
  plan_sha256: string;
  beat_id?: string;
};

export interface ReadTimeModel {
  min_hold_s: number;
  per_word_s: number;
  base_s: number;
}

export interface PlanThresholds {
  narrationMaxWpm: number;
  hookWindowS: number;
  promiseWindowS: number;
  readTime: ReadTimeModel;
}

export interface PlanMarker {
  t: number;
  id: string;
  role?: BeatRole;
}

// === THRESHOLDS ===

export const BEAT_SHEET_FILE = "beats.json";

/**
 * Owner thresholds that have no rules.json yet, keyed by the owning rule. They move to the owners'
 * rules.json with #148. TYPO-HOLD is read from references/typography/rules.json instead.
 */
export const PLAN_THRESHOLDS = {
  // references/sound-design KB §13: 130–175 wpm for explainers; 175 is the ceiling.
  "SOUND-NARRATION-WPM": { max_wpm: 175 },
  // references/pacing-editor KB §12: proposition complete by 3.0 s.
  "PACE-HOOK-02": { window_s: 3.0 },
  // references/pacing-editor KB §12: hook established by 6.0 s.
  "PACE-HOOK-03": { window_s: 6.0 },
} as const;

export function defaultPlanThresholds(readTime: ReadTimeModel): PlanThresholds {
  return {
    narrationMaxWpm: PLAN_THRESHOLDS["SOUND-NARRATION-WPM"].max_wpm,
    promiseWindowS: PLAN_THRESHOLDS["PACE-HOOK-02"].window_s,
    hookWindowS: PLAN_THRESHOLDS["PACE-HOOK-03"].window_s,
    readTime,
  };
}

// === PUBLIC API ===

/** Every plan check, in table order. An empty array is a clean plan. */
export function checkPlan(sheet: BeatSheet, seriesBrief: SeriesBrief | undefined, thresholds: PlanThresholds, planSha256: string): PlanFinding[] {
  const finding = (rule: string, severity: Severity, text: string, evidence: NonNullable<Finding["evidence"]>, beatId?: string): PlanFinding => ({
    rule_id: rule,
    kind: "measured",
    severity,
    severity_basis: "measured_rule",
    confidence: { value: 1, basis: "deterministic" },
    evidence,
    text,
    author: { kind: "agent", name: "vcr-plan" },
    plan_sha256: planSha256,
    ...(beatId ? { beat_id: beatId } : {}),
  });
  return [
    ...beatSumFindings(sheet, finding),
    ...wordBudgetFindings(sheet, thresholds.narrationMaxWpm, finding),
    ...readTimeFindings(sheet, thresholds.readTime, finding),
    ...mandatoryMapFindings(sheet, seriesBrief, finding),
    ...voAirFindings(sheet, finding),
    ...hookWindowFindings(sheet, thresholds, finding),
  ];
}

/** Named markers for `window.__scene.markers`: each beat's last frame (one frame before it ends), per the scene contract. */
export function planMarkers(sheet: BeatSheet): PlanMarker[] {
  let endFrame = 0;
  return sheet.beats.map((beat) => {
    endFrame += Math.round(beat.duration_s * sheet.fps);
    const t = Number(((endFrame - 1) / sheet.fps).toFixed(6));
    return { t, id: beat.id, ...(beat.role ? { role: beat.role } : {}) };
  });
}

/** Rules across the sheet, its folder and the video brief that the schema cannot express. */
export function beatSheetDiagnostics(sheet: BeatSheet, videoId: string, deliverableFps: number[] | undefined, file: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const error = (path: string, message: string, suggestion: string) => diagnostics.push({ severity: "error", file, path, message, suggestion });
  if (sheet.video_id !== videoId) error("/video_id", `video_id ${sheet.video_id} does not match its directory (${videoId})`, "Keep beats.json in projects/<project>/videos/<video>/ with that id.");
  const seen = new Set<string>();
  sheet.beats.forEach((beat, index) => {
    if (seen.has(beat.id)) error(`/beats/${index}/id`, `duplicate beat id ${beat.id} (STORY-BEAT-FIELDS)`, "Beat ids are stable and unique: they become scene marker ids.");
    seen.add(beat.id);
  });
  if (deliverableFps && deliverableFps.length > 0 && !deliverableFps.includes(sheet.fps)) error("/fps", `fps ${sheet.fps} is not a deliverable rate in brief.md (${deliverableFps.join(", ")})`, "Plan at the rate the video is delivered at.");
  return diagnostics;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// === CHECKS ===

type MakeFinding = (rule: string, severity: Severity, text: string, evidence: NonNullable<Finding["evidence"]>, beatId?: string) => PlanFinding;

function beatSumFindings(sheet: BeatSheet, finding: MakeFinding): PlanFinding[] {
  const plannedFrames = sheet.beats.reduce((sum, beat) => sum + Math.round(beat.duration_s * sheet.fps), 0);
  const targetFrames = Math.round(sheet.target_s * sheet.fps);
  if (plannedFrames === targetFrames) return [];
  return [finding("STORY-BEAT-SUM", "major", `Beats sum to ${plannedFrames} frames; the target is ${targetFrames} (${sheet.target_s} s at ${sheet.fps} fps). Threshold owner: the brief and PACE-DUR-01.`, { metric: "planned_frames", value: plannedFrames, threshold: targetFrames })];
}

function wordBudgetFindings(sheet: BeatSheet, maxWpm: number, finding: MakeFinding): PlanFinding[] {
  const voiced = sheet.beats.filter((beat) => beat.vo !== null);
  const findings = voiced.flatMap((beat) => {
    const words = countWords(beat.vo!);
    const budget = Math.floor((beat.duration_s * maxWpm) / 60);
    return words > budget ? [finding("STORY-WORD-BUDGET", "major", `${beat.id}: ${words} words of VO in ${beat.duration_s} s; the budget is ${budget} at ${maxWpm} wpm (SOUND-NARRATION-WPM).`, { metric: "vo_words", value: words, threshold: budget }, beat.id)] : [];
  });
  const totalWords = voiced.reduce((sum, beat) => sum + countWords(beat.vo!), 0);
  const totalBudget = Math.floor((voiced.reduce((sum, beat) => sum + beat.duration_s, 0) * maxWpm) / 60);
  if (totalWords > totalBudget) findings.push(finding("STORY-WORD-BUDGET", "major", `${totalWords} words of VO across the voiced beats; the budget is ${totalBudget} at ${maxWpm} wpm (SOUND-NARRATION-WPM).`, { metric: "vo_words_total", value: totalWords, threshold: totalBudget }));
  return findings;
}

function readTimeFindings(sheet: BeatSheet, model: ReadTimeModel, finding: MakeFinding): PlanFinding[] {
  return sheet.beats.flatMap((beat) => {
    if (beat.on_screen_text === null) return [];
    const words = countWords(beat.on_screen_text);
    const required = Math.max(model.min_hold_s, model.per_word_s * words + model.base_s);
    if (beat.duration_s >= required) return [];
    return [finding("STORY-TEXT-READTIME", "major", `${beat.id}: ${words} words on screen for ${beat.duration_s} s; TYPO-HOLD needs ${required.toFixed(2)} s.`, { metric: "beat_duration_s", value: beat.duration_s, threshold: Number(required.toFixed(3)) }, beat.id)];
  });
}

function mandatoryMapFindings(sheet: BeatSheet, seriesBrief: SeriesBrief | undefined, finding: MakeFinding): PlanFinding[] {
  const mapped = new Set(sheet.beats.flatMap((beat) => beat.mandatories ?? []));
  return (seriesBrief?.mandatories ?? [])
    .filter((mandatory) => !mapped.has(mandatory.id))
    .map((mandatory) => finding("STORY-MANDATORY-MAP", "blocker", `Mandatory ${mandatory.id} ("${mandatory.rule}") is in no beat (BRIEF-MANDATORY-PASS).`, { metric: "mandatory_beats", value: 0, threshold: 1 }));
}

function voAirFindings(sheet: BeatSheet, finding: MakeFinding): PlanFinding[] {
  const isNarrated = sheet.beats.some((beat) => beat.vo !== null);
  const airBeats = sheet.beats.filter((beat) => beat.vo === null).length;
  if (!isNarrated || airBeats > 0) return [];
  return [finding("STORY-VO-AIR", "note", "Every beat carries VO; give the viewer at least one beat of air (vo: null).", { metric: "vo_free_beats", value: 0, threshold: 1 })];
}

function hookWindowFindings(sheet: BeatSheet, thresholds: PlanThresholds, finding: MakeFinding): PlanFinding[] {
  const starts = beatStarts(sheet);
  const windows: Array<[BeatRole, number, string]> = [["promise", thresholds.promiseWindowS, "PACE-HOOK-02"], ["hook", thresholds.hookWindowS, "PACE-HOOK-03"]];
  return windows.flatMap(([role, windowS, owner]) => {
    const index = sheet.beats.findIndex((beat) => beat.role === role);
    if (index === -1 || starts[index]! <= windowS) return [];
    const beat = sheet.beats[index]!;
    return [finding("STORY-HOOK-WINDOW", "minor", `${beat.id}: the first ${role} beat starts at ${starts[index]} s; ${owner} wants it by ${windowS} s (advisory: feeds and ads).`, { metric: `${role}_start_s`, value: starts[index], threshold: windowS }, beat.id)];
  });
}

function beatStarts(sheet: BeatSheet): number[] {
  let frame = 0;
  return sheet.beats.map((beat) => {
    const start = Number((frame / sheet.fps).toFixed(6));
    frame += Math.round(beat.duration_s * sheet.fps);
    return start;
  });
}
