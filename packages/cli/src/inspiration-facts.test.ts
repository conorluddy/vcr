import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { measureFacts, parseColourHistogram, parseFontFacts, parseImageSize, parseToolVersion, parseVideoProbe, type ToolRunner } from "./inspiration-facts.js";
import { fail, ok } from "./result.types.js";
import { harnessRoot } from "./test-workspace.js";

// Tool output below was captured from ImageMagick 7.1.2 and FFmpeg 9.0.2 on fixture files.
const HISTOGRAM = "          2064: (11,31,58) #0B1F3A srgb(11,31,58)\n          1008: (242,163,58) #F2A33A srgb(242,163,58)\n";
const GREY_HISTOGRAM = "       100: (17) #111111 gray(17)\n       300: (255,255,255,255) #FFFFFFFF white\n";
const PROBE = JSON.stringify({
  streams: [
    { index: 0, codec_type: "video", width: 160, height: 120, r_frame_rate: "30/1", avg_frame_rate: "30000/1001", duration: "2.000000" },
    { index: 1, codec_type: "audio", r_frame_rate: "0/0", avg_frame_rate: "0/0" },
  ],
  format: { duration: "2.021333" },
});
const options = { harnessVersion: "0.1.0" };
const missingTool: ToolRunner = async (command) => fail("TOOL_MISSING", `${command} is not installed`);

function scriptedTools(outputs: Record<string, string>): { run: ToolRunner; calls: string[][] } {
  const calls: string[][] = [];
  const run: ToolRunner = async (command, args) => {
    calls.push([command, ...args]);
    const key = Object.keys(outputs).find((candidate) => [command, ...args].join(" ").includes(candidate));
    return key === undefined ? fail("TOOL_FAILED", `${command} failed`) : ok(outputs[key]!);
  };
  return { run, calls };
}

describe("measured facts", () => {
  test("image size and dominant colours parse from ImageMagick output", () => {
    expect(parseImageSize("64 48\n")).toEqual({ width: 64, height: 48 });
    expect(parseColourHistogram(HISTOGRAM)).toEqual([{ hex: "#0B1F3A", share: 0.672 }, { hex: "#F2A33A", share: 0.328 }]);
  });

  test("grey and alpha histogram lines still give six-digit colours, largest first", () => {
    expect(parseColourHistogram(GREY_HISTOGRAM)).toEqual([{ hex: "#FFFFFF", share: 0.75 }, { hex: "#111111", share: 0.25 }]);
    expect(parseColourHistogram("nothing here")).toEqual([]);
  });

  test("video facts parse from ffprobe JSON, with a fractional frame rate", () => {
    expect(parseVideoProbe(PROBE)).toEqual({ ok: true, value: { has_audio: true, width: 160, height: 120, duration_s: 2.021, fps: 29.97 } });
    expect(parseVideoProbe(JSON.stringify({ streams: [{ codec_type: "audio" }] }))).toMatchObject({ ok: false });
    expect(parseVideoProbe("not json")).toMatchObject({ ok: false });
  });

  test("tool versions parse from their first line", () => {
    expect(parseToolVersion("Version: ImageMagick 7.1.2-35 Q16-HDRI aarch64")).toBe("7.1.2-35");
    expect(parseToolVersion("ffprobe version 9.0.2 Copyright (c) 2007-2026")).toBe("9.0.2");
  });

  test("an image is measured with the tool and version stamped", async () => {
    const { run } = scriptedTools({ identify: "64 48\n", "histogram:info:-": HISTOGRAM, "--version": "Version: ImageMagick 7.1.2-35 Q16" });
    expect(await measureFacts("image", "/tmp/poster.png", { ...options, run })).toEqual({
      facts: { width: 64, height: 48, dominant_colours: [{ hex: "#0B1F3A", share: 0.672 }, { hex: "#F2A33A", share: 0.328 }] },
      factsBy: { tool: "imagemagick", version: "7.1.2-35" },
      warnings: [],
    });
  });

  test("a video is probed and its contact sheet requested as one tiled frame", async () => {
    const { run, calls } = scriptedTools({ "-show_streams": PROBE, "-version": "ffprobe version 9.0.2", "tile=": "" });
    const measured = await measureFacts("video", "/tmp/clip.mp4", { ...options, contactSheetPath: "/tmp/sheet.png", run });
    expect(measured).toMatchObject({ facts: { duration_s: 2.021, fps: 29.97 }, factsBy: { tool: "ffmpeg-ffprobe", version: "9.0.2" }, hasContactSheet: true, warnings: [] });
    expect(calls.find((call) => call[0] === "ffmpeg")).toEqual(expect.arrayContaining(["fps=12/2.021,scale=320:-2,tile=4x3", "/tmp/sheet.png"]));
  });

  test("a missing tool yields a warning and no facts", async () => {
    for (const kind of ["image", "video"] as const) {
      const measured = await measureFacts(kind, "/tmp/x", { ...options, run: missingTool });
      expect(measured.facts).toBeUndefined();
      expect(measured.warnings).toEqual([expect.stringContaining("is not installed, so no")]);
    }
  });

  test("the font reader reads name and OS/2 tables from a real TrueType file", () => {
    const font = readFileSync(join(harnessRoot(), "examples/canvas2d-capture/fonts/JetBrainsMono-Bold.ttf"));
    expect(parseFontFacts(font)).toEqual({ ok: true, value: { family: "JetBrains Mono", subfamily: "Bold", licence: expect.stringContaining("SIL Open Font License"), weight_class: 700, italic: false } });
  });

  test("a font is stamped as read by vcr itself; WOFF2 and non-fonts give a warning and no facts", async () => {
    const fontPath = join(harnessRoot(), "examples/canvas2d-capture/fonts/JetBrainsMono-Bold.ttf");
    expect(await measureFacts("font", fontPath, options)).toMatchObject({ facts: { family: "JetBrains Mono" }, factsBy: { tool: "vcr", version: "0.1.0" }, warnings: [] });
    const directory = mkdtempSync(join(tmpdir(), "vcr-fonts-"));
    writeFileSync(join(directory, "a.woff2"), Buffer.concat([Buffer.from("wOF2"), Buffer.alloc(64)]));
    writeFileSync(join(directory, "b.ttf"), "this is not a font at all");
    expect(await measureFacts("font", join(directory, "a.woff2"), options)).toEqual({ warnings: [expect.stringContaining("WOFF2 is a compressed container")] });
    expect(await measureFacts("font", join(directory, "b.ttf"), options)).toEqual({ warnings: [expect.stringContaining("not a TrueType or OpenType font")] });
  });

  test("a truncated font does not throw", () => {
    const font = readFileSync(join(harnessRoot(), "examples/canvas2d-capture/fonts/JetBrainsMono-Bold.ttf"));
    expect(parseFontFacts(font.subarray(0, 200))).toMatchObject({ ok: false, error: { code: "UNREADABLE_FONT" } });
  });
});
