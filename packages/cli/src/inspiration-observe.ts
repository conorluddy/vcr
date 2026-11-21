import { relative } from "node:path";
import { findInspiration, recordPath, type Mutation } from "./inspiration.js";
import { INSPIRATION_ASPECTS, type InspirationAspect, type InspirationItem, type InspirationObservation } from "./inspiration-record.js";
import { writeJsonAtomic } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";

// The only path by which a model writes into an inspiration record (ADR 0012): it appends one
// judged observation, stamped with agent, model and date, and can touch nothing a person stated.

// === TYPES ===

/** What the analyst supplies; `at` is set here. */
export interface ObservationDraft {
  aspect: string;
  observed: string;
  inferred?: string | undefined;
  span?: string | undefined;
  agent: string;
  model: string;
}

// === PUBLIC API ===

export const DEFAULT_ANALYST_AGENT = "inspiration-analyst";
export const OBSERVATION_LIMITS = { observed: 400, inferred: 300 } as const;
/** Short enough to stop a placeholder, which cannot be retracted; far below any real description. */
export const MIN_OBSERVATION_CHARACTERS = 20;
/** Aspects whose claims about a video are claims about time, so they must cite the span inspected (VREF-TEMPORAL-SPAN). */
const TEMPORAL_ASPECTS: InspirationAspect[] = ["motion", "pacing"];
const SPAN_PATTERN = /^t=(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/;

/**
 * Appends one observation. Idempotent on content: the same aspect, text, span and model twice
 * writes nothing. Stated fields, the file and facts are carried over untouched.
 */
export function observeInspiration(workspaceRoot: string, id: string, draft: ObservationDraft, now: Date): Result<Mutation<InspirationItem>> {
  const found = findInspiration(workspaceRoot, id);
  if (!found.ok) return found;
  const item = found.value;
  if (!(INSPIRATION_ASPECTS as readonly string[]).includes(draft.aspect)) return fail("INVALID_ARGUMENT", `--aspect is one of ${INSPIRATION_ASPECTS.join(", ")}.`);
  const aspect = draft.aspect as InspirationAspect;
  const lengthError = lengthErrorFor("observed", draft.observed) ?? (draft.inferred === undefined ? undefined : lengthErrorFor("inferred", draft.inferred));
  if (lengthError) return fail("INVALID_ARGUMENT", lengthError);
  if (draft.model.trim() === "" || draft.agent.trim() === "") return fail("INVALID_ARGUMENT", "--model names the model that made the observation and cannot be empty; the caller tells an analyst which model it runs as.");
  if (draft.span !== undefined) {
    const span = SPAN_PATTERN.exec(draft.span);
    if (!span || Number(span[2]) < Number(span[1])) return fail("INVALID_ARGUMENT", "--span is the inspected time span in seconds, as t=<start>,<end>, e.g. t=0,2.5.");
    if (item.kind !== "video") return fail("INVALID_ARGUMENT", `--span is for a video; ${id} is ${item.kind === "image" ? "an image" : `a ${item.kind} item`}.`);
  } else if (item.kind === "video" && TEMPORAL_ASPECTS.includes(aspect)) {
    return fail("INVALID_ARGUMENT", `A ${aspect} observation on a video needs --span t=<start>,<end>: the span actually inspected, never a cover frame alone (VREF-TEMPORAL-SPAN).`);
  }

  const observation: InspirationObservation = {
    aspect,
    observed: draft.observed.trim(),
    ...(draft.inferred !== undefined ? { inferred: draft.inferred.trim() } : {}),
    ...(draft.span !== undefined ? { span: draft.span } : {}),
    by: { agent: draft.agent.trim(), model: draft.model.trim() },
    at: now.toISOString(),
  };
  const existing = item.observations ?? [];
  if (existing.some((candidate) => contentKey(candidate) === contentKey(observation))) return ok({ data: item, changes: [], warnings: [] });
  const updated: InspirationItem = { ...item, observations: [...existing, observation] };
  writeJsonAtomic(recordPath(workspaceRoot, id), updated);
  const warnings = item.note === undefined ? [`${id} still has no note. An observation is a model's reading and does not stand in for what the person likes; ask them.`] : [];
  return ok({ data: updated, changes: [relative(workspaceRoot, recordPath(workspaceRoot, id))], warnings });
}

/**
 * Removes one observation by its position in the record (1-based, as `show` numbers them). Callers
 * gate this behind a human terminal: a model may add a reading but never delete one.
 */
export function retractObservation(workspaceRoot: string, id: string, position: number): Result<Mutation<InspirationItem>> {
  const found = findInspiration(workspaceRoot, id);
  if (!found.ok) return found;
  const existing = found.value.observations ?? [];
  if (!Number.isInteger(position) || position < 1 || position > existing.length) {
    return fail("NOT_FOUND", existing.length === 0 ? `${id} has no observations to retract.` : `${id} has observations 1 to ${existing.length}; \`vcr inspiration show ${id}\` numbers them.`);
  }
  const remaining = existing.filter((_, index) => index !== position - 1);
  const { observations: _observations, ...withoutObservations } = found.value;
  const updated: InspirationItem = remaining.length > 0 ? { ...found.value, observations: remaining } : withoutObservations;
  writeJsonAtomic(recordPath(workspaceRoot, id), updated);
  return ok({ data: updated, changes: [relative(workspaceRoot, recordPath(workspaceRoot, id))], warnings: [] });
}

// === PRIVATE HELPERS ===

function lengthErrorFor(field: keyof typeof OBSERVATION_LIMITS, value: string): string | undefined {
  const length = value.trim().length;
  if (length < MIN_OBSERVATION_CHARACTERS) return `--${field} is ${length} characters; an observation describes what is there in at least ${MIN_OBSERVATION_CHARACTERS}. Only a person can retract an observation, so try the command with --help, not a placeholder.`;
  if (length > OBSERVATION_LIMITS[field]) return `--${field} is ${length} characters; the limit is ${OBSERVATION_LIMITS[field]}. Tighten the sentence; do not split one observation into several.`;
  return undefined;
}

/** Everything but the timestamp: who said what about which aspect. */
function contentKey(observation: InspirationObservation): string {
  return JSON.stringify([observation.aspect, observation.observed, observation.inferred ?? null, observation.span ?? null, observation.by.agent, observation.by.model]);
}
