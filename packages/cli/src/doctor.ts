import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { hostname, platform, release, arch } from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// === TYPES ===

export interface Probe {
  tool_id: string;
  command: string;
  args: string[];
  /** First capture group is the version. */
  versionPattern: RegExp;
  /** Absolute fallback when the tool is an app bundle rather than on PATH. */
  fallbackPath?: string;
}

export type ProbeStatus = "installed" | "missing" | "error";

export interface ProbeResult {
  tool_id: string;
  status: ProbeStatus;
  executable: string | null;
  version: string | null;
  detail?: string | undefined;
}

export interface EnvironmentRecord {
  schema_version: "1.0.0";
  hostname: string;
  os: { platform: string; release: string; arch: string };
  checked_at: string;
  tools: ProbeResult[];
}

// === PUBLIC API ===

export const DEFAULT_PROBES: Probe[] = [
  { tool_id: "ffmpeg-ffprobe", command: "ffmpeg", args: ["-version"], versionPattern: /ffmpeg version (\S+)/ },
  { tool_id: "imagemagick", command: "magick", args: ["--version"], versionPattern: /ImageMagick (\S+)/ },
  { tool_id: "resvg", command: "resvg", args: ["--version"], versionPattern: /(\d+\.\d+\.\d+)/ },
  { tool_id: "svgo", command: "svgo", args: ["--version"], versionPattern: /(\d+\.\d+\.\d+)/ },
  { tool_id: "gifski", command: "gifski", args: ["--version"], versionPattern: /(\d+\.\d+\.\d+)/ },
  { tool_id: "inkscape", command: "inkscape", args: ["--version"], versionPattern: /Inkscape (\S+)/ },
  { tool_id: "graphviz", command: "dot", args: ["-V"], versionPattern: /version (\S+)/ },
  { tool_id: "manim-community", command: "manim", args: ["--version"], versionPattern: /v?(\d+\.\d+\.\d+)/ },
  { tool_id: "blender", command: "blender", args: ["--version"], versionPattern: /Blender (\S+)/, fallbackPath: "/Applications/Blender.app/Contents/MacOS/Blender" },
  { tool_id: "node", command: "node", args: ["--version"], versionPattern: /v(\S+)/ },
  { tool_id: "python", command: "python3", args: ["--version"], versionPattern: /Python (\S+)/ },
];

export async function runDoctor(probes: Probe[] = DEFAULT_PROBES): Promise<EnvironmentRecord> {
  const tools = await Promise.all(probes.map(runProbe));
  return {
    schema_version: "1.0.0",
    hostname: hostname(),
    os: { platform: platform(), release: release(), arch: arch() },
    checked_at: new Date().toISOString(),
    tools,
  };
}

/** Parses tool stdout/stderr into a probe result; exported so it can be tested against fixture output. */
export function parseProbeOutput(probe: Probe, executable: string, output: string): ProbeResult {
  const match = probe.versionPattern.exec(output);
  if (!match?.[1]) return { tool_id: probe.tool_id, status: "error", executable, version: null, detail: `could not parse version from: ${output.slice(0, 80)}` };
  return { tool_id: probe.tool_id, status: "installed", executable, version: match[1] };
}

export function formatDoctorTable(record: EnvironmentRecord): string {
  const rows = record.tools.map((tool) => `${tool.status.padEnd(10)} ${tool.tool_id.padEnd(18)} ${tool.version ?? "-"}  ${tool.executable ?? tool.detail ?? ""}`);
  return [`${record.hostname} ${record.os.platform} ${record.os.release} ${record.os.arch}`, ...rows].join("\n");
}

// === PRIVATE HELPERS ===

async function runProbe(probe: Probe): Promise<ProbeResult> {
  const executable = await resolveExecutable(probe);
  if (!executable) return { tool_id: probe.tool_id, status: "missing", executable: null, version: null };
  try {
    const { stdout, stderr } = await execFileAsync(executable, probe.args, { timeout: 15_000 });
    return parseProbeOutput(probe, executable, `${stdout}\n${stderr}`);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { tool_id: probe.tool_id, status: "error", executable, version: null, detail: message.split("\n")[0] };
  }
}

async function resolveExecutable(probe: Probe): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("which", [probe.command]);
    const found = stdout.trim();
    if (found) return found;
  } catch {
    // not on PATH; fall through to the bundle path
  }
  return probe.fallbackPath && existsSync(probe.fallbackPath) ? probe.fallbackPath : null;
}
