import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fail, ok, type Result } from "./result.types.js";

// === TYPES ===

/** How to capture an example's browser scene; mirrors `example.json#capture`. */
export interface ExampleCaptureSpec {
  scene: string;
  width: number;
  height: number;
  fps: number;
}

export interface CreateExampleOutcome {
  directory: string;
  /** False when the example already existed; nothing was written. */
  isCreated: boolean;
  /** Commands to run next, in order, relative to the workspace. */
  nextSteps: string[];
}

/** Repository-only plumbing: scripts that import workspace packages or assert recorded fixture output. */
const HARNESS_ONLY_FILES = new Set(["node_modules", "output", ".cache", "capture.ts", "run.sh", "expected"]);

// === PUBLIC API ===

/** Copies an example's sources into `<workspace>/examples/<id>` with a standalone package.json. Never overwrites. */
export function createExample(harnessRoot: string, workspaceRoot: string, exampleId: string, cliInvocation: string): Result<CreateExampleOutcome> {
  const source = join(harnessRoot, "examples", exampleId);
  if (!existsSync(join(source, "example.json"))) return fail("EXAMPLE_NOT_FOUND", `No example "${exampleId}" in ${join(harnessRoot, "examples")}. List them with \`vcr tools examples <tool-id>\`.`);
  const directory = join(workspaceRoot, "examples", exampleId);
  const manifest = JSON.parse(readFileSync(join(source, "example.json"), "utf8")) as { capture?: ExampleCaptureSpec; run?: string };
  const relativeDirectory = `examples/${exampleId}`;
  const nextSteps = buildNextSteps(relativeDirectory, existsSync(join(source, "package.json")), manifest.capture, cliInvocation);
  if (existsSync(directory)) return ok({ directory, isCreated: false, nextSteps });

  cpSync(source, directory, { recursive: true, filter: (path) => !HARNESS_ONLY_FILES.has(basename(path)) });
  if (existsSync(join(source, "package.json"))) writeStandalonePackage(join(source, "package.json"), join(directory, "package.json"));
  return ok({ directory, isCreated: true, nextSteps });
}

// === PRIVATE HELPERS ===

/** Keeps runtime dependencies (three, gsap, p5) and drops workspace links and repository scripts. */
function writeStandalonePackage(sourcePath: string, targetPath: string): void {
  const original = JSON.parse(readFileSync(sourcePath, "utf8")) as { name: string; dependencies?: Record<string, string> };
  const standalone = { name: original.name.replace(/^@vcr\//, ""), private: true, type: "module", dependencies: original.dependencies ?? {} };
  writeFileSync(targetPath, `${JSON.stringify(standalone, null, 2)}\n`);
}

function buildNextSteps(relativeDirectory: string, hasPackage: boolean, capture: ExampleCaptureSpec | undefined, cliInvocation: string): string[] {
  const steps: string[] = [];
  if (hasPackage) steps.push(`npm install --prefix ${relativeDirectory}`);
  if (capture) {
    steps.push(`${cliInvocation} setup capture`);
    steps.push(`${cliInvocation} capture ${relativeDirectory}/${capture.scene} --width ${capture.width} --height ${capture.height} --fps ${capture.fps} --verify`);
  }
  return steps;
}
