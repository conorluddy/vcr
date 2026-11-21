import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import type { InspirationFacts, InspirationKind } from "./inspiration-record.js";
import { fail, ok, type Result } from "./result.types.js";

// Measured facts for an inspiration item (ADR 0012): what a tool can read off the file with no
// judgement. Images and videos go through catalogued free software (ADR 0009); fonts are read
// directly from their sfnt tables. A missing tool is a warning and no facts, never a failed intake.

// === TYPES ===

/** Runs a tool and returns its stdout; a tool that is not installed fails with TOOL_MISSING. */
export type ToolRunner = (command: string, args: string[]) => Promise<Result<string>>;

export interface Measurement {
  facts?: InspirationFacts;
  factsBy?: { tool: string; version: string };
  /** Videos only: true when the contact sheet was written. */
  hasContactSheet?: boolean;
  warnings: string[];
}

export interface MeasureOptions {
  /** Stamps facts VCR reads itself (fonts). */
  harnessVersion: string;
  /** Where a video's contact sheet is written. */
  contactSheetPath?: string;
  run?: ToolRunner;
}

// === PUBLIC API ===

export const MAX_DOMINANT_COLOURS = 6;
const CONTACT_SHEET = { columns: 4, rows: 3, tileWidth: 320 } as const;

export async function measureFacts(kind: InspirationKind, filePath: string, options: MeasureOptions): Promise<Measurement> {
  const run = options.run ?? runTool;
  if (kind === "image") return measureImage(filePath, run);
  if (kind === "video") return measureVideo(filePath, options.contactSheetPath, run);
  if (kind === "font") {
    const facts = parseFontFacts(readFileSync(filePath));
    return facts.ok ? { facts: facts.value, factsBy: { tool: "vcr", version: options.harnessVersion }, warnings: [] } : { warnings: [facts.error.message] };
  }
  return { warnings: [] };
}

/** `magick identify -format "%w %h"` → dimensions. */
export function parseImageSize(output: string): { width: number; height: number } | undefined {
  const match = /^\s*(\d+)\s+(\d+)/.exec(output);
  return match ? { width: Number(match[1]), height: Number(match[2]) } : undefined;
}

/** `magick … -colors n -format %c histogram:info:-` → colours with their share of pixels, largest first. */
export function parseColourHistogram(output: string): Array<{ hex: string; share: number }> {
  const counted = [...output.matchAll(/^\s*(\d+):.*?#([0-9A-Fa-f]{6})/gm)].map((match) => ({ count: Number(match[1]), hex: `#${match[2]!.toUpperCase()}` }));
  const total = counted.reduce((sum, colour) => sum + colour.count, 0);
  if (total === 0) return [];
  return counted
    .sort((left, right) => right.count - left.count)
    .slice(0, MAX_DOMINANT_COLOURS)
    .map(({ hex, count }) => ({ hex, share: Math.round((count / total) * 1000) / 1000 }));
}

/** `ffprobe -print_format json -show_streams -show_format` → the first video stream's facts. */
export function parseVideoProbe(output: string): Result<InspirationFacts> {
  let probe: { streams?: Array<Record<string, unknown>>; format?: { duration?: string } };
  try {
    probe = JSON.parse(output) as typeof probe;
  } catch {
    return fail("UNREADABLE_PROBE", "ffprobe did not return JSON, so no video facts were recorded.");
  }
  const streams = probe.streams ?? [];
  const video = streams.find((stream) => stream["codec_type"] === "video");
  if (!video) return fail("UNREADABLE_PROBE", "ffprobe found no video stream, so no video facts were recorded.");
  const facts: InspirationFacts = { has_audio: streams.some((stream) => stream["codec_type"] === "audio") };
  if (typeof video["width"] === "number" && typeof video["height"] === "number") Object.assign(facts, { width: video["width"], height: video["height"] });
  const duration = Number(probe.format?.duration ?? video["duration"]);
  if (Number.isFinite(duration) && duration >= 0) facts.duration_s = Math.round(duration * 1000) / 1000;
  const fps = parseRate(video["avg_frame_rate"]) ?? parseRate(video["r_frame_rate"]);
  if (fps !== undefined) facts.fps = fps;
  return ok(facts);
}

/** First line of `<tool> -version` / `--version` → the version token after the tool's name. */
export function parseToolVersion(output: string): string {
  return /(?:ImageMagick|version)\s+(\S+)/.exec(output)?.[1] ?? "unknown";
}

/**
 * Reads family, subfamily, weight class, italic and the embedded licence string from a TrueType or
 * OpenType font's `name` and `OS/2` tables. WOFF and WOFF2 are compressed containers and give no facts.
 */
export function parseFontFacts(font: Buffer): Result<InspirationFacts> {
  if (font.length < 12) return fail("UNREADABLE_FONT", "The file is too short to be a font, so no font facts were recorded.");
  const signature = font.toString("latin1", 0, 4);
  if (signature === "wOF2" || signature === "wOFF") return fail("UNREADABLE_FONT", `${signature === "wOF2" ? "WOFF2" : "WOFF"} is a compressed container, so no font facts were recorded; add the TTF or OTF to get them.`);
  const fontOffset = signature === "ttcf" ? font.readUInt32BE(12) : 0;
  const isSfnt = signature === "ttcf" || signature === "OTTO" || signature === "true" || font.readUInt32BE(0) === 0x00010000;
  if (!isSfnt) return fail("UNREADABLE_FONT", "The file is not a TrueType or OpenType font, so no font facts were recorded.");
  try {
    const tables = readTableDirectory(font, fontOffset);
    const names = tables.name ? readNames(font, tables.name) : new Map<number, string>();
    const facts: InspirationFacts = {};
    const family = names.get(NAME_ID.typographicFamily) ?? names.get(NAME_ID.family);
    const subfamily = names.get(NAME_ID.typographicSubfamily) ?? names.get(NAME_ID.subfamily);
    const licence = names.get(NAME_ID.licence) ?? names.get(NAME_ID.licenceUrl);
    if (family) facts.family = family;
    if (subfamily) facts.subfamily = subfamily;
    if (licence) facts.licence = licence.length > MAX_LICENCE_CHARACTERS ? `${licence.slice(0, MAX_LICENCE_CHARACTERS - 1)}…` : licence;
    if (tables.os2 !== undefined && tables.os2 + OS2.fsSelection + 2 <= font.length) {
      facts.weight_class = font.readUInt16BE(tables.os2 + OS2.weightClass);
      facts.italic = (font.readUInt16BE(tables.os2 + OS2.fsSelection) & 1) === 1;
    }
    return Object.keys(facts).length > 0 ? ok(facts) : fail("UNREADABLE_FONT", "The font has no name or OS/2 table, so no font facts were recorded.");
  } catch {
    return fail("UNREADABLE_FONT", "The font's tables could not be read, so no font facts were recorded.");
  }
}

// === PRIVATE HELPERS ===

const execFileAsync = promisify(execFile);
const NAME_ID = { family: 1, subfamily: 2, licence: 13, licenceUrl: 14, typographicFamily: 16, typographicSubfamily: 17 } as const;
const OS2 = { weightClass: 4, fsSelection: 62 } as const;
const MAX_LICENCE_CHARACTERS = 400;
const WINDOWS_PLATFORM = 3;
const UNICODE_PLATFORM = 0;
const WINDOWS_ENGLISH_US = 0x409;

const runTool: ToolRunner = async (command, args) => {
  try {
    const { stdout } = await execFileAsync(command, args, { timeout: 120_000, maxBuffer: 16 * 1024 * 1024 });
    return ok(stdout);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") return fail("TOOL_MISSING", `${command} is not installed`);
    return fail("TOOL_FAILED", `${command} failed: ${(cause instanceof Error ? cause.message : String(cause)).split("\n")[0]}`);
  }
};

async function measureImage(filePath: string, run: ToolRunner): Promise<Measurement> {
  // [0] reads the first frame, so an animated GIF or a multi-page file is one image.
  const firstFrame = `${filePath}[0]`;
  const size = await run("magick", ["identify", "-format", "%w %h\n", firstFrame]);
  if (!size.ok) return { warnings: [noFacts("image", size.error, "ImageMagick (`magick`)")] };
  const dimensions = parseImageSize(size.value);
  if (!dimensions) return { warnings: ["magick identify printed no dimensions, so no image facts were recorded."] };
  const warnings: string[] = [];
  const facts: InspirationFacts = { ...dimensions };
  const histogram = await run("magick", [firstFrame, "-background", "white", "-alpha", "remove", "-alpha", "off", "-resize", "200x200>", "+dither", "-colors", String(MAX_DOMINANT_COLOURS), "-depth", "8", "-format", "%c", "histogram:info:-"]);
  const colours = histogram.ok ? parseColourHistogram(histogram.value) : [];
  if (colours.length > 0) facts.dominant_colours = colours;
  else warnings.push(`Dominant colours were not measured${histogram.ok ? "" : `: ${histogram.error.message}`}.`);
  const version = await run("magick", ["--version"]);
  return { facts, factsBy: { tool: "imagemagick", version: version.ok ? parseToolVersion(version.value) : "unknown" }, warnings };
}

async function measureVideo(filePath: string, contactSheetPath: string | undefined, run: ToolRunner): Promise<Measurement> {
  const probe = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", filePath]);
  if (!probe.ok) return { warnings: [noFacts("video", probe.error, "FFmpeg (`ffprobe`)")] };
  const facts = parseVideoProbe(probe.value);
  if (!facts.ok) return { warnings: [facts.error.message] };
  const version = await run("ffprobe", ["-version"]);
  const measurement: Measurement = { facts: facts.value, factsBy: { tool: "ffmpeg-ffprobe", version: version.ok ? parseToolVersion(version.value) : "unknown" }, warnings: [] };
  const durationS = facts.value.duration_s ?? 0;
  if (!contactSheetPath) return measurement;
  if (durationS <= 0) return { ...measurement, warnings: ["The video's duration is unknown, so no contact sheet was written."] };
  const tiles = CONTACT_SHEET.columns * CONTACT_SHEET.rows;
  const sheet = await run("ffmpeg", ["-v", "error", "-y", "-i", filePath, "-vf", `fps=${tiles}/${durationS},scale=${CONTACT_SHEET.tileWidth}:-2,tile=${CONTACT_SHEET.columns}x${CONTACT_SHEET.rows}`, "-frames:v", "1", "-update", "1", contactSheetPath]);
  if (sheet.ok) return { ...measurement, hasContactSheet: true };
  return { ...measurement, warnings: [`No contact sheet was written: ${sheet.error.message}.`] };
}

function noFacts(kind: string, error: { code: string; message: string }, toolName: string): string {
  if (error.code === "TOOL_MISSING") return `${toolName} is not installed, so no ${kind} facts were measured. The item was added; install it (see \`vcr doctor\`) and add the file again to measure.`;
  return `No ${kind} facts were measured: ${error.message}.`;
}

/** `30000/1001` → 29.97; `0/0` (a still or unknown rate) → undefined. */
function parseRate(rate: unknown): number | undefined {
  const match = typeof rate === "string" ? /^(\d+)\/(\d+)$/.exec(rate) : null;
  if (!match || Number(match[2]) === 0 || Number(match[1]) === 0) return undefined;
  return Math.round((Number(match[1]) / Number(match[2])) * 1000) / 1000;
}

function readTableDirectory(font: Buffer, fontOffset: number): { name?: number; os2?: number } {
  const tableCount = font.readUInt16BE(fontOffset + 4);
  const tables: { name?: number; os2?: number } = {};
  for (let index = 0; index < tableCount; index += 1) {
    const record = fontOffset + 12 + index * 16;
    const tag = font.toString("latin1", record, record + 4);
    if (tag === "name") tables.name = font.readUInt32BE(record + 8);
    if (tag === "OS/2") tables.os2 = font.readUInt32BE(record + 8);
  }
  return tables;
}

/** Name ID → string, preferring Windows US English, then any Unicode record, then Macintosh. */
function readNames(font: Buffer, nameTable: number): Map<number, string> {
  const count = font.readUInt16BE(nameTable + 2);
  const storage = nameTable + font.readUInt16BE(nameTable + 4);
  const best = new Map<number, { rank: number; value: string }>();
  for (let index = 0; index < count; index += 1) {
    const record = nameTable + 6 + index * 12;
    const platform = font.readUInt16BE(record);
    const language = font.readUInt16BE(record + 4);
    const nameId = font.readUInt16BE(record + 6);
    const start = storage + font.readUInt16BE(record + 10);
    const bytes = font.subarray(start, start + font.readUInt16BE(record + 8));
    const isUnicode = platform === WINDOWS_PLATFORM || platform === UNICODE_PLATFORM;
    const rank = platform === WINDOWS_PLATFORM && language === WINDOWS_ENGLISH_US ? 3 : isUnicode ? 2 : 1;
    const value = (isUnicode ? decodeUtf16BigEndian(bytes) : bytes.toString("latin1")).trim();
    if (value && rank > (best.get(nameId)?.rank ?? 0)) best.set(nameId, { rank, value });
  }
  return new Map([...best].map(([nameId, { value }]) => [nameId, value]));
}

function decodeUtf16BigEndian(bytes: Buffer): string {
  return new TextDecoder("utf-16be").decode(bytes);
}
