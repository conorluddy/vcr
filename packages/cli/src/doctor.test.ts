import { describe, expect, test } from "vitest";
import { DEFAULT_PROBES, parseProbeOutput } from "./doctor.js";

const probe = (toolId: string) => DEFAULT_PROBES.find((candidate) => candidate.tool_id === toolId)!;

describe("parseProbeOutput", () => {
  test("extracts ffmpeg version from its banner", () => {
    const result = parseProbeOutput(probe("ffmpeg-ffprobe"), "/opt/homebrew/bin/ffmpeg", "ffmpeg version 8.0.1 Copyright (c) 2000-2025");
    expect(result).toMatchObject({ status: "installed", version: "8.0.1", executable: "/opt/homebrew/bin/ffmpeg" });
  });

  test("extracts Blender version from app bundle output", () => {
    const result = parseProbeOutput(probe("blender"), "/Applications/Blender.app/Contents/MacOS/Blender", "Blender 4.4.0\n\tbuild date: 2025-03-31");
    expect(result.version).toBe("4.4.0");
  });

  test("reports error status when output has no version", () => {
    const result = parseProbeOutput(probe("resvg"), "/usr/bin/resvg", "usage: resvg [OPTIONS]");
    expect(result.status).toBe("error");
    expect(result.detail).toContain("could not parse version");
  });
});
