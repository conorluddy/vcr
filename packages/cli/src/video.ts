import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// A video lives at projects/<project>/videos/<video>/ (plugin PRD §7) and is named <project>/<video>.

// === TYPES ===

export interface VideoLocation {
  /** `<project>/<video>` */
  videoId: string;
  directory: string;
}

// === PUBLIC API ===

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Every projects/<project>/videos/<video>/ directory in the workspace, sorted by id. Read-only. */
export function listVideoDirectories(workspaceRoot: string): VideoLocation[] {
  const projectsRoot = join(workspaceRoot, "projects");
  return subdirectories(projectsRoot).flatMap((project) =>
    subdirectories(join(projectsRoot, project, "videos")).map((video) => ({ videoId: `${project}/${video}`, directory: join(projectsRoot, project, "videos", video) })),
  );
}

// === PRIVATE HELPERS ===

function subdirectories(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((entry) => !entry.startsWith(".") && statSync(join(directory, entry)).isDirectory()).sort();
}
