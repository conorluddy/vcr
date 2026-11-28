import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { SOURCE_ROOT } from "./paths";

// === TYPES ===

export interface ComponentEntry {
  readonly name: string;
  /** The artifact's table section, e.g. "Actions". */
  readonly group: string;
  readonly directory: string;
  readonly previewPath: string;
  readonly readmePath: string;
  readonly previewHeightPx: number;
}

// === PUBLIC API ===

/** Folder name → section title, in the order the artifact shows them. */
export const COMPONENT_GROUPS: ReadonlyArray<readonly [folder: string, title: string]> = [
  ["actions", "Actions"],
  ["display", "Display"],
  ["inputs", "Inputs"],
  ["review", "Review"],
  ["surfaces", "Surfaces"],
];

/** Every `src/<group>/<Component>/<Component>.tsx`, with its preview and README, in display order. */
export function discoverComponents(sourceRoot: string = SOURCE_ROOT): ComponentEntry[] {
  return COMPONENT_GROUPS.flatMap(([folder, group]) =>
    readdirSync(join(sourceRoot, folder))
      .filter((name) => statSync(join(sourceRoot, folder, name)).isDirectory())
      .sort()
      .map((name) => describeComponent(join(sourceRoot, folder, name), name, group)),
  );
}

// === PRIVATE HELPERS ===

function describeComponent(directory: string, name: string, group: string): ComponentEntry {
  const previewPath = join(directory, `${name}.preview.tsx`);
  const readmePath = join(directory, "README.md");
  for (const requiredPath of [
    join(directory, `${name}.tsx`),
    join(directory, `${name}.types.ts`),
    previewPath,
    readmePath,
  ]) {
    if (!existsSync(requiredPath)) {
      throw new Error(
        `discoverComponents: ${name} is missing ${requiredPath}; every component needs .tsx, .types.ts, .preview.tsx and README.md.`,
      );
    }
  }
  return { name, group, directory, previewPath, readmePath, previewHeightPx: readPreviewHeight(previewPath) };
}

function readPreviewHeight(previewPath: string): number {
  const match = /^\/\/ @dsCard height=(\d+)/.exec(readFileSync(previewPath, "utf8"));
  if (!match?.[1]) {
    throw new Error(`discoverComponents: ${previewPath} must start with "// @dsCard height=<px>".`);
  }
  return Number(match[1]);
}
