import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { readJsonFile, writeJsonAtomic } from "./repository.js";
import { fail, ok, type Result } from "./result.types.js";
import { REVIEW_PATHS } from "./review.js";
import { WORKSPACE_MARKER } from "./roots.js";
import type { WorkspaceMarker } from "./workspace.js";

// A video lives at projects/<project>/videos/<video>/ (plugin PRD §7) and is named <project>/<video>.

// === TYPES ===

export interface VideoLocation {
  /** `<project>/<video>` */
  videoId: string;
  directory: string;
}

export interface EnsureVideoOutcome {
  videoId: string;
  directory: string;
  /** Workspace-relative paths written or created; empty when the video already existed. */
  changes: string[];
}

interface ProjectDocument {
  id: string;
  videos: string[];
  [field: string]: unknown;
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

/**
 * Idempotently registers `<project>/<video>`: the project in vcr.json, the video in project.json
 * (created with private defaults when absent), and the video's review directories.
 */
export function ensureVideo(workspaceRoot: string, videoId: string): Result<EnsureVideoOutcome> {
  const parts = parseVideoId(videoId);
  if (!parts.ok) return parts;
  const { project, video } = parts.value;
  const changes: string[] = [];

  const markerPath = join(workspaceRoot, WORKSPACE_MARKER);
  const marker = readJsonFile<WorkspaceMarker>(markerPath);
  if (!marker.ok) return marker;
  if (!marker.value.projects.includes(project)) {
    writeJsonAtomic(markerPath, { ...marker.value, projects: [...marker.value.projects, project].sort() });
    changes.push(WORKSPACE_MARKER);
  }

  const projectPath = join(workspaceRoot, "projects", project, "project.json");
  const existing = existsSync(projectPath) ? readJsonFile<ProjectDocument>(projectPath) : ok(newProject(project));
  if (!existing.ok) return existing;
  if (!existsSync(projectPath) || !existing.value.videos.includes(video)) {
    writeJsonAtomic(projectPath, { ...existing.value, videos: [...new Set([...existing.value.videos, video])].sort() });
    changes.push(`projects/${project}/project.json`);
  }

  const directory = videoDirectory(workspaceRoot, videoId);
  for (const relativePath of [REVIEW_PATHS.renders, REVIEW_PATHS.findings, REVIEW_PATHS.approvals]) {
    const path = join(directory, relativePath);
    if (existsSync(path)) continue;
    mkdirSync(path, { recursive: true });
    changes.push(`projects/${project}/videos/${video}/${relativePath}/`);
  }
  return ok({ videoId, directory, changes });
}

/** The directory of an existing video, or VIDEO_NOT_FOUND naming the ones that exist. */
export function resolveVideo(workspaceRoot: string, videoId: string): Result<VideoLocation> {
  const parts = parseVideoId(videoId);
  if (!parts.ok) return parts;
  const directory = videoDirectory(workspaceRoot, videoId);
  if (existsSync(directory)) return ok({ videoId, directory });
  const known = listVideoDirectories(workspaceRoot).map((location) => location.videoId);
  return fail("VIDEO_NOT_FOUND", `No video ${videoId} in ${workspaceRoot}. ${known.length > 0 ? `Videos: ${known.join(", ")}.` : "There are no videos yet."} Run \`vcr video init ${videoId}\` to create it.`);
}

export function videoDirectory(workspaceRoot: string, videoId: string): string {
  const [project, video] = videoId.split("/");
  return join(workspaceRoot, "projects", project!, "videos", video!);
}

// === PRIVATE HELPERS ===

function parseVideoId(videoId: string): Result<{ project: string; video: string }> {
  const [project, video, ...rest] = videoId.split("/");
  if (!project || !video || rest.length > 0 || !SLUG_PATTERN.test(project) || !SLUG_PATTERN.test(video)) {
    return fail("INVALID_ARGUMENT", `"${videoId}" is not a video id. Use <project>/<video>, both lowercase kebab-case, e.g. demo/teaser.`);
  }
  return ok({ project, video });
}

function newProject(project: string): ProjectDocument {
  return { schema_version: "1.0.0", id: project, title: project, reuse_scope: "private", dependency_policy: "unpinned", assets_manifest: "assets.json", videos: [] };
}

function subdirectories(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).filter((entry) => !entry.startsWith(".") && statSync(join(directory, entry)).isDirectory()).sort();
}
