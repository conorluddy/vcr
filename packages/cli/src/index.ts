#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { applyCaptureSetup, formatCaptureSetupPlan, planCaptureSetup, runCapture } from "./capture.js";
import { writeCatalogIndex } from "./catalog.js";
import { formatDoctorTable, runDoctor } from "./doctor.js";
import { createExample } from "./examples.js";
import { logEvent, startTimer } from "./log.js";
import { buildPlugin, pluginDiagnostics, readHarnessVersion } from "./plugin.js";
import { requireDevMode, requireWorkspace, resolveRoots, type Roots } from "./roots.js";
import { filterTools, findTool, formatExamplesForTool, formatToolCard, formatToolTable, loadExamples, loadTools, readToolGuide } from "./tools.js";
import { hasErrors, validateRepository, validateWorkspace } from "./validate.js";
import { ensureWorkspace } from "./workspace.js";

const USAGE = `vcr <command>

  status                        Show the harness, workspace and machine roots
  workspace init                Make this directory (or --workspace) a VCR workspace; idempotent
  validate                      Validate the workspace (in the harness repository: everything)
  tools list [--capability x] [--tier x] [--category x]   Tier 0: one line per tool
  tools info <id> [--full]      Tier 1 card; --full appends the tier 2 guide
  tools examples <id>           Tier 3: runnable examples that demonstrate the tool
  example create <id>           Copy an example's sources into <workspace>/examples/<id> and print next steps
  setup capture [--yes]         Plan (or with --yes, install) Playwright and Chromium into <VCR_HOME>/runtime
  capture <scene.html> --width n --height n --fps n [--out dir] [--verify]
                                Capture a browser scene frame by frame; frames and report.json go to --out
  doctor [--record]             Probe local tools and write <VCR_HOME>/environment/<hostname>.json
                                --record also writes environment/ (harness repository only)
  catalog build [--check]       Regenerate catalog/tools.json and catalog/INDEX.md (harness repository only)
  plugin build                  Assemble plugin/ for Claude Code and Codex (harness repository only)

Flags: --json for machine-readable output; --workspace <dir> to select a workspace.
Roots: VCR_HARNESS, VCR_WORKSPACE, VCR_HOME (default ~/.vcr).`;


// === ENTRY ===

const argv = process.argv.slice(2);
const parsed = parseArguments(argv);
const { flags, positional } = parsed;
const elapsed = startTimer();
const resolvedRoots = resolveRoots({ cwd: process.cwd(), env: process.env, workspaceFlag: text(flags["workspace"]) });

const exitCode = resolvedRoots.ok ? await dispatch(positional, flags, resolvedRoots.value) : failWith(resolvedRoots.error, flags["json"] === true);
logEvent("command.finished", { command: positional.join(" ") || "help", duration_ms: elapsed(), exit_code: exitCode });
process.exit(exitCode);

// === COMMANDS ===

async function dispatch(args: string[], options: Record<string, string | true>, roots: Roots): Promise<number> {
  const [command, subcommand, target] = args;
  const asJson = options["json"] === true;
  if (parsed.error) {
    print(asJson ? { error: { code: "INVALID_ARGUMENT", message: parsed.error } } : `${parsed.error}\n\n${USAGE}`);
    return 2;
  }

  const repositoryRoot = roots.harness;
  const harnessVersion = readHarnessVersion(roots.harness);
  if (!harnessVersion.ok) return failWith(harnessVersion.error, asJson);

  if (command === "status") {
    print(asJson ? { ...roots, harness_version: harnessVersion.value } : formatRoots(roots, harnessVersion.value));
    return 0;
  }

  if (command === "workspace" && subcommand === "init") {
    const target = roots.workspace ?? process.cwd();
    const outcome = ensureWorkspace(target, harnessVersion.value);
    print(asJson ? outcome : outcome.changes.length > 0 ? `initialised ${target}: wrote ${outcome.changes.join(", ")}` : `${target} is already a workspace; nothing changed`);
    return 0;
  }

  if (command === "validate") {
    let report;
    if (roots.isDevMode) {
      report = validateRepository(repositoryRoot);
      report.diagnostics.push(...pluginDiagnostics(repositoryRoot));
    }
    else {
      const workspace = requireWorkspace(roots);
      if (!workspace.ok) return failWith(workspace.error, asJson);
      report = validateWorkspace(repositoryRoot, workspace.value);
    }
    if (asJson) print(report);
    else {
      for (const diagnostic of report.diagnostics) {
        print(`${diagnostic.severity.toUpperCase()} ${diagnostic.file}${diagnostic.path}: ${diagnostic.message}${diagnostic.suggestion ? ` (${diagnostic.suggestion})` : ""}`);
      }
      print(`${report.filesChecked} files checked, ${report.diagnostics.length} diagnostics`);
    }
    return hasErrors(report) ? 1 : 0;
  }

  if (command === "tools") {
    const tools = loadTools(repositoryRoot);
    if (!tools.ok) return failWith(tools.error, asJson);
    if (subcommand === "list") {
      const matching = filterTools(tools.value, { capability: text(options["capability"]), tier: text(options["tier"]), category: text(options["category"]) });
      print(asJson ? matching : formatToolTable(matching));
      return 0;
    }
    const examples = loadExamples(repositoryRoot);
    if (!examples.ok) return failWith(examples.error, asJson);
    if (subcommand === "info" && target) {
      const tool = findTool(tools.value, target);
      if (!tool.ok) return failWith(tool.error, asJson);
      if (asJson) {
        print(tool.value);
        return 0;
      }
      const card = formatToolCard(tool.value, examples.value, repositoryRoot);
      if (options["full"] !== true) {
        print(card);
        return 0;
      }
      const guide = readToolGuide(tool.value, repositoryRoot);
      if (!guide.ok) return failWith(guide.error, asJson);
      print(`${card}\n\n---\n\n${guide.value}`);
      return 0;
    }
    if (subcommand === "examples" && target) {
      const tool = findTool(tools.value, target);
      if (!tool.ok) return failWith(tool.error, asJson);
      const own = examples.value.filter((example) => example.tools.includes(tool.value.id));
      print(asJson ? own : formatExamplesForTool(tool.value, examples.value));
      return 0;
    }
  }

  if (command === "example" && subcommand === "create" && target) {
    const workspace = requireWorkspace(roots);
    if (!workspace.ok) return failWith(workspace.error, asJson);
    const outcome = createExample(repositoryRoot, workspace.value, target, cliInvocation(roots));
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const { directory, isCreated, nextSteps } = outcome.value;
    print(asJson ? outcome.value : `${isCreated ? "created" : "already exists, nothing written:"} ${directory}\n\nnext, from ${workspace.value}:\n${nextSteps.map((step) => `  ${step}`).join("\n")}`);
    return 0;
  }

  if (command === "setup" && subcommand === "capture") {
    const plan = planCaptureSetup(roots);
    const shouldApply = options["yes"] === true && plan.steps.length > 0;
    if (!shouldApply) {
      print(asJson ? plan : formatCaptureSetupPlan(plan, false));
      return 0;
    }
    const applied = applyCaptureSetup(plan, roots.isCodexSandbox);
    if (!applied.ok) return failWith(applied.error, asJson);
    print(asJson ? { applied: applied.value, remaining: planCaptureSetup(roots).steps } : formatCaptureSetupPlan(applied.value, true));
    return 0;
  }

  if (command === "capture" && subcommand) {
    const dimensions = { width: Number(options["width"]), height: Number(options["height"]), fps: Number(options["fps"]) };
    if (!Object.values(dimensions).every((value) => Number.isFinite(value) && value > 0)) {
      return failWith({ code: "INVALID_ARGUMENT", message: "capture needs positive --width, --height and --fps" }, asJson, 2);
    }
    const sceneFile = resolve(subcommand);
    const outputDirectory = resolve(text(options["out"]) ?? join(dirname(sceneFile), "output"));
    const report = await runCapture(roots, { sceneFile, outputDirectory, verifyDeterminism: options["verify"] === true, ...dimensions });
    if (!report.ok) return failWith(report.error, asJson);
    const { frames, frames_per_second, shuffled_matches_sequential } = report.value;
    print(asJson ? { outputDirectory, frames, frames_per_second, shuffled_matches_sequential } : `captured ${frames} frames to ${outputDirectory}/frames (${frames_per_second} fps)${shuffled_matches_sequential === null ? "" : `; shuffled matches sequential: ${shuffled_matches_sequential}`}`);
    return shuffled_matches_sequential === false ? 1 : 0;
  }

  if (command === "catalog" && subcommand === "build") {
    const checkOnly = options["check"] === true;
    const devMode = requireDevMode(roots, "catalog build");
    if (!checkOnly && !devMode.ok) return failWith(devMode.error, asJson);
    const outcome = writeCatalogIndex(repositoryRoot, checkOnly);
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const { recordCount, wasStale, staleFiles } = outcome.value;
    print(asJson ? outcome.value : `${recordCount} records; ${wasStale ? `${checkOnly ? "stale" : "rewrote"}: ${staleFiles.join(", ")}` : "index up to date"}`);
    return checkOnly && wasStale ? 1 : 0;
  }

  if (command === "plugin" && subcommand === "build") {
    const devMode = requireDevMode(roots, "plugin build");
    if (!devMode.ok) return failWith(devMode.error, asJson);
    const outcome = buildPlugin(repositoryRoot);
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const { directory, version, fileCount, totalBytes } = outcome.value;
    print(asJson ? outcome.value : `built ${directory} v${version}: ${fileCount} files, ${(totalBytes / 1024).toFixed(0)} KB`);
    return 0;
  }

  if (command === "doctor") {
    const shouldRecord = options["record"] === true;
    const devMode = requireDevMode(roots, "doctor --record");
    if (shouldRecord && !devMode.ok) return failWith(devMode.error, asJson);
    const record = await runDoctor();
    const outputDirectories = [join(roots.machine, "environment"), ...(shouldRecord ? [join(repositoryRoot, "environment")] : [])];
    const writtenPaths = outputDirectories.map((directory) => writeEnvironmentRecord(directory, record));
    print(asJson ? record : `${formatDoctorTable(record)}\n\nwritten ${writtenPaths.join(", ")}`);
    return 0;
  }

  print(USAGE);
  return command ? 2 : 0;
}

// === HELPERS ===

function parseArguments(args: string[]): { flags: Record<string, string | true>; positional: string[]; error?: string } {
  const flags: Record<string, string | true> = {};
  const positional: string[] = [];
  const booleanFlags = new Set(["json", "full", "check", "record", "yes", "verify"]);
  const valueFlags = new Set(["capability", "tier", "category", "workspace", "width", "height", "fps", "out"]);
  let error: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (!argument.startsWith("--")) { positional.push(argument); continue; }
    const name = argument.slice(2);
    if (booleanFlags.has(name)) flags[name] = true;
    else if (valueFlags.has(name)) {
      const next = args[index + 1];
      if (!next || next.startsWith("--")) error ??= `--${name} requires a value`;
      else { flags[name] = next; index += 1; }
    } else error ??= `Unknown option ${argument}`;
  }
  return { flags, positional, ...(error ? { error } : {}) };
}

/** How a human or skill should call this CLI again: the bundle path when installed, the pnpm script in the repository. */
function cliInvocation(roots: Roots): string {
  return roots.isDevMode ? "pnpm vcr" : `node ${process.argv[1]}`;
}

function writeEnvironmentRecord(directory: string, record: { hostname: string }): string {
  mkdirSync(directory, { recursive: true });
  const outputPath = join(directory, `${record.hostname}.json`);
  writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`);
  return outputPath;
}

function formatRoots(roots: Roots, harnessVersion: string): string {
  return [
    `harness    ${roots.harness}`,
    `workspace  ${roots.workspace ?? "none (run vcr workspace init)"}`,
    `machine    ${roots.machine}`,
    `machine    from ${roots.machineSource}${roots.isCodexSandbox ? " (Codex sandbox: capture uses --single-process)" : ""}`,
    `mode       ${roots.isDevMode ? "dev (harness repository)" : "user"}`,
    `version    ${harnessVersion}`,
  ].join("\n");
}

function text(value: string | true | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function print(value: unknown): void {
  process.stdout.write(`${typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n`);
}

function failWith(error: { code: string; message: string }, asJson: boolean, exitCode = 1): number {
  print(asJson ? { error } : `${error.code}: ${error.message}`);
  return exitCode;
}
