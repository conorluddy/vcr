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

/** How `vcr lint` checks this example's scene; printed as a next step before capture. */
export interface ExampleLintSpec {
  safe_zone: string;
  markers?: boolean;
}

type ExampleManifest = { capture?: ExampleCaptureSpec; lint?: ExampleLintSpec; run?: string };

export interface CreateExampleOutcome {
  directory: string;
  /** False when the example already existed; nothing was written. */
  isCreated: boolean;
  /** Commands to run next, in order, relative to the workspace. */
  nextSteps: string[];
}

const GENERATED_FILES = new Set(["node_modules", "output", ".cache"]);
/** Browser examples reproduce through `pnpm capture` and `@vcr/capture`; scaffolds use `vcr capture` instead. Native examples' run.sh is standalone and kept. */
const BROWSER_HARNESS_FILES = new Set(["capture.ts", "run.sh", "expected"]);

// === PUBLIC API ===

/** Copies an example's sources into `<workspace>/examples/<id>` with a standalone package.json. Never overwrites. */
export function createExample(harnessRoot: string, workspaceRoot: string, exampleId: string, cliInvocation: string): Result<CreateExampleOutcome> {
  const source = join(harnessRoot, "examples", exampleId);
  if (!existsSync(join(source, "example.json"))) return fail("EXAMPLE_NOT_FOUND", `No example "${exampleId}" in ${join(harnessRoot, "examples")}. List them with \`vcr tools examples <tool-id>\`.`);
  const directory = join(workspaceRoot, "examples", exampleId);
  const manifest = JSON.parse(readFileSync(join(source, "example.json"), "utf8")) as ExampleManifest;
  const relativeDirectory = `examples/${exampleId}`;
  const nextSteps = buildNextSteps(relativeDirectory, existsSync(join(source, "package.json")), manifest, cliInvocation);
  if (existsSync(directory)) return ok({ directory, isCreated: false, nextSteps });

  const isHarnessOnly = (name: string) => GENERATED_FILES.has(name) || name.endsWith(".test.ts") || (manifest.capture !== undefined && BROWSER_HARNESS_FILES.has(name));
  cpSync(source, directory, { recursive: true, filter: (path) => !isHarnessOnly(basename(path)) });
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

function buildNextSteps(relativeDirectory: string, hasPackage: boolean, manifest: ExampleManifest, cliInvocation: string): string[] {
  const { capture, lint, run } = manifest;
  const steps: string[] = [];
  if (hasPackage) steps.push(`npm install --prefix ${relativeDirectory}`);
  if (!capture && run) steps.push(`(cd ${relativeDirectory} && ${run})`);
  if (capture) {
    steps.push(`${cliInvocation} setup capture`);
    if (lint) steps.push(`${cliInvocation} lint ${relativeDirectory}/${capture.scene} --safe-zone ${lint.safe_zone}${lint.markers ? " --markers" : ""}`);
    steps.push(`${cliInvocation} capture ${relativeDirectory}/${capture.scene} --width ${capture.width} --height ${capture.height} --fps ${capture.fps} --verify`);
  }
  return steps;
}
