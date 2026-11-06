import { latestManifest, readVideoReview, videoState, type Severity, type VideoState } from "./review.js";
import { listVideoDirectories } from "./video.js";

// `vcr status --brief`: what a session-start hook or skill reads first, kept under 1 KB (PRD §6.6 step 4).

// === TYPES ===

export interface VideoStatus {
  video_id: string;
  state: VideoState;
  latest_render: string | null;
  open: Record<Severity, number>;
  addressed: number;
}

export interface BriefStatus {
  harness_version: string;
  workspace: string | null;
  video_count: number;
  /** The videos needing attention first, at most BRIEF_VIDEO_LIMIT. */
  videos: VideoStatus[];
  warnings: string[];
}

export const BRIEF_VIDEO_LIMIT = 8;
const STATE_PRIORITY: Record<VideoState, number> = { changes_requested: 0, in_review: 1, draft: 2, approved: 3 };

// === PUBLIC API ===

export function briefStatus(workspaceRoot: string | null, harnessVersion: string, warnings: string[] = []): BriefStatus {
  if (!workspaceRoot) return { harness_version: harnessVersion, workspace: null, video_count: 0, videos: [], warnings };
  const videos = listVideoDirectories(workspaceRoot).map(({ videoId, directory }) => videoStatus(videoId, readVideoReview(directory, workspaceRoot)));
  videos.sort((left, right) => STATE_PRIORITY[left.state] - STATE_PRIORITY[right.state] || openCount(right) - openCount(left) || left.video_id.localeCompare(right.video_id));
  return { harness_version: harnessVersion, workspace: workspaceRoot, video_count: videos.length, videos: videos.slice(0, BRIEF_VIDEO_LIMIT), warnings };
}

export function formatBriefStatus(status: BriefStatus): string {
  if (!status.workspace) return `vcr ${status.harness_version}; no workspace (run vcr workspace init)`;
  const lines = [`vcr ${status.harness_version}; ${status.video_count} video${status.video_count === 1 ? "" : "s"}`];
  for (const video of status.videos) {
    const open = (["blocker", "major", "minor", "note"] as const).filter((severity) => video.open[severity] > 0).map((severity) => `${video.open[severity]} ${severity}`);
    const counts = [open.length > 0 ? `open ${open.join(", ")}` : "", video.addressed > 0 ? `${video.addressed} addressed` : ""].filter(Boolean).join("; ");
    lines.push(`${video.video_id}  ${video.state}${counts ? `  ${counts}` : ""}`);
  }
  if (status.video_count > status.videos.length) lines.push(`+${status.video_count - status.videos.length} more; vcr findings list <video> for detail`);
  lines.push(...status.warnings.map((warning) => `warning: ${warning}`));
  return lines.join("\n");
}

// === PRIVATE HELPERS ===

function videoStatus(videoId: string, review: ReturnType<typeof readVideoReview>): VideoStatus {
  const open: Record<Severity, number> = { blocker: 0, major: 0, minor: 0, note: 0 };
  let addressed = 0;
  for (const { finding } of review.findings) {
    if (finding.status === "open") open[finding.severity] += 1;
    if (finding.status === "addressed") addressed += 1;
  }
  return { video_id: videoId, state: videoState(review), latest_render: latestManifest(review)?.render_id ?? null, open, addressed };
}

function openCount(video: VideoStatus): number {
  return Object.values(video.open).reduce((sum, count) => sum + count, 0);
}
