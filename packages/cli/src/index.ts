#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { applyCaptureSetup, formatCaptureSetupPlan, planCaptureSetup, runCapture } from "./capture.js";
import { COMMANDS, findCommand, findCommandGroup, formatCommandHelp, formatGlobalUsage, GLOBAL_FLAGS } from "./commands.js";
import { buildCatalogIndex, writeCatalogIndex } from "./catalog.js";
import { writeTypographyTable } from "./typography-rules.js";
import { filterPillarRules, findPillarRule, formatPillarRule, formatPillarRuleList, loadPillarRules, loadPillars, readKnowledgeBaseSection, renderReferencesIndex, writeReferencesIndex } from "./references.js";
import { DEFAULT_LINT_SAMPLES, formatLintReport, parseSampleTimes, runLint } from "./lint.js";
import { disclosureReport, formatDisclosureReport } from "./disclosure.js";
import { formatDoctorTable, runDoctor } from "./doctor.js";
import { loadMachineRecord } from "./evidence.js";
import { createExample } from "./examples.js";
import { logEvent, startTimer } from "./log.js";
import { buildPlugin, pluginDiagnostics, readHarnessVersion } from "./plugin.js";
import { requireDevMode, requireWorkspace, resolveRoots, type Roots } from "./roots.js";
import { filterTools, findTool, formatExamplesForTool, formatToolCard, formatToolTable, loadExamples, loadTools, readToolGuide } from "./tools.js";
import { hasErrors, validateRepository, validateWorkspace } from "./validate.js";
import { ensureWorkspace } from "./workspace.js";
import { ensureVideo, resolveVideo } from "./video.js";
import { stagingDirectoryFor, writeRender } from "./render-manifest.js";
import { runFindingsCommand, runReviewDecision } from "./review-commands.js";
import type { TerminalIo } from "./approvals.js";
import { createInterface } from "node:readline/promises";


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
  if (options["help"] === true) return printHelp(args, asJson);
  if (parsed.error) {
    print(asJson ? { error: { code: "INVALID_ARGUMENT", message: parsed.error, retryable: false } } : `${parsed.error}\n\n${formatGlobalUsage()}`);
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

  if (command === "video" && subcommand === "init" && target) {
    const workspace = requireWorkspace(roots);
    if (!workspace.ok) return failWith(workspace.error, asJson);
    const outcome = ensureVideo(workspace.value, target);
    if (!outcome.ok) return failWith(outcome.error, asJson, 2);
    print(asJson ? outcome.value : outcome.value.changes.length > 0 ? `created ${outcome.value.videoId}: ${outcome.value.changes.join(", ")}` : `${outcome.value.videoId} already exists; nothing changed`);
    return 0;
  }

  if ((command === "findings" || command === "review") && subcommand && target) {
    const workspace = requireWorkspace(roots);
    if (!workspace.ok) return failWith(workspace.error, asJson);
    const outcome = command === "findings"
      ? runFindingsCommand(workspace.value, subcommand, target, args[3], options, new Date())
      : await runReviewDecision(workspace.value, subcommand, target, args[3], options, terminalIo(), new Date());
    if (!outcome.ok) return failWith(outcome.error, asJson, outcome.error.code === "INVALID_ARGUMENT" ? 2 : 1);
    print(asJson ? outcome.value.json : outcome.value.text);
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
      const card = formatToolCard(tool.value, examples.value, repositoryRoot, loadMachineRecord(roots.machine), { cwd: process.cwd(), stopAt: roots.workspace ?? undefined });
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
    const videoId = text(options["video"]);
    if (videoId && options["out"] !== undefined) return failWith({ code: "INVALID_ARGUMENT", message: "--out and --video do not combine: a video's render always goes to output/<video>/<render_id>/" }, asJson, 2);
    const workspace = videoId ? requireWorkspace(roots) : undefined;
    if (workspace && !workspace.ok) return failWith(workspace.error, asJson);
    const video = workspace?.ok && videoId ? resolveVideo(workspace.value, videoId) : undefined;
    if (video && !video.ok) return failWith(video.error, asJson);
    const startedAt = new Date();
    const outputDirectory = video?.ok && workspace?.ok ? stagingDirectoryFor(workspace.value, video.value.videoId, startedAt) : resolve(text(options["out"]) ?? join(dirname(sceneFile), "output"));
    const report = await runCapture(roots, { sceneFile, outputDirectory, verifyDeterminism: options["verify"] === true, ...dimensions });
    if (!report.ok) return failWith(report.error, asJson);
    const render = video?.ok && workspace?.ok
      ? writeRender({ workspaceRoot: workspace.value, videoId: video.value.videoId, videoDirectory: video.value.directory, sceneFile, stagingDirectory: outputDirectory, report: report.value, createdAt: startedAt, machineRecord: loadMachineRecord(roots.machine) })
      : undefined;
    const { frames, frames_per_second, shuffled_matches_sequential, mismatched_frames } = report.value;
    if (shuffled_matches_sequential === false) {
      const firstMismatches = mismatched_frames.slice(0, 5).join(", ") + (mismatched_frames.length > 5 ? ", …" : "");
      process.stderr.write(`${mismatched_frames.length} frames differ between sequential and shuffled order (${firstMismatches}). If the DOM matches in both orders, suspect compositor layering (pin animated elements with will-change); if not, the scene carries state between seeks. See references/determinism.md in the start skill.\n`);
    }
    const writtenTo = render?.renderDirectory ?? outputDirectory;
    const renderFields = render ? { render_id: render.manifest.render_id, video_id: render.manifest.video_id, manifest: render.retainedManifestPath, manifest_sha256: render.manifestSha256 } : {};
    const renderLine = render ? `\nrender ${render.manifest.render_id} of ${render.manifest.video_id}; manifest retained at ${render.retainedManifestPath}` : "";
    print(asJson ? { outputDirectory: writtenTo, frames, frames_per_second, shuffled_matches_sequential, mismatched_frames, ...renderFields } : `captured ${frames} frames to ${writtenTo}/frames (${frames_per_second} fps)${shuffled_matches_sequential === null ? "" : `; shuffled matches sequential: ${shuffled_matches_sequential}`}${renderLine}`);
    return shuffled_matches_sequential === false ? 1 : 0;
  }

  if (command === "lint" && subcommand) {
    const safeZoneName = text(options["safe-zone"]);
    if (!safeZoneName) return failWith({ code: "INVALID_ARGUMENT", message: "lint needs --safe-zone <preset|none>; presets are in references/typography/rules.json" }, asJson, 2);
    const times = parseSampleTimes(text(options["at"]));
    if (!times.ok) return failWith(times.error, asJson, 2);
    const numbers = { width: optionalPositive(options["width"]), height: optionalPositive(options["height"]), samples: optionalPositive(options["samples"]) ?? DEFAULT_LINT_SAMPLES, fps: optionalPositive(options["fps"]) ?? 30 };
    if (Object.values(numbers).some(Number.isNaN)) return failWith({ code: "INVALID_ARGUMENT", message: "lint's --width, --height, --samples and --fps must be positive numbers" }, asJson, 2);
    const report = await runLint(roots, { target: subcommand, safeZoneName, times: times.value, useMarkers: options["markers"] === true, ...numbers });
    if (!report.ok) return failWith(report.error, asJson);
    print(asJson ? report.value : formatLintReport(report.value));
    return report.value.findings.length > 0 ? 1 : 0;
  }

  if (command === "refs" || command === "rules") {
    const pillars = loadPillars(repositoryRoot);
    if (!pillars.ok) return failWith(pillars.error, asJson);
    const rules = loadPillarRules(repositoryRoot, pillars.value);
    if (command === "refs" && subcommand === "list") {
      print(asJson ? pillars.value.map((pillar) => ({ ...pillar, ruleCount: rules.filter((rule) => rule.pillar === pillar.slug).length })) : renderReferencesIndex(pillars.value, rules).trimEnd());
      return 0;
    }
    if (command === "refs" && subcommand === "section" && target && args[3]) {
      const section = readKnowledgeBaseSection(repositoryRoot, pillars.value, target, args[3]);
      if (!section.ok) return failWith(section.error, asJson);
      print(asJson ? { pillar: target, section: args[3], markdown: section.value } : section.value);
      return 0;
    }
    if (command === "rules" && subcommand === "info" && target) {
      const rule = findPillarRule(rules, target);
      if (!rule.ok) return failWith(rule.error, asJson);
      print(asJson ? rule.value : formatPillarRule(rule.value));
      return 0;
    }
    if (command === "rules" && subcommand === "list") {
      const limit = optionalPositive(options["limit"]) ?? 50;
      const offset = options["offset"] === undefined ? 0 : Number(options["offset"]);
      if (Number.isNaN(limit) || !Number.isInteger(offset) || offset < 0) return failWith({ code: "INVALID_ARGUMENT", message: "--limit must be a positive number and --offset a whole number of 0 or more." }, asJson, 2);
      const matching = filterPillarRules(rules, { pillar: text(options["pillar"]), tier: text(options["tier"]), appliesTo: text(options["applies-to"]) });
      const page = matching.slice(offset, offset + limit);
      print(asJson ? { total: matching.length, offset, limit, rules: page } : formatPillarRuleList(page, matching.length, offset));
      return 0;
    }
  }

  if (command === "catalog" && subcommand === "build") {
    const checkOnly = options["check"] === true;
    const devMode = requireDevMode(roots, "catalog build");
    if (!checkOnly && !devMode.ok) return failWith(devMode.error, asJson);
    const outcome = writeCatalogIndex(repositoryRoot, checkOnly);
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const table = writeTypographyTable(repositoryRoot, checkOnly);
    if (!table.ok) return failWith(table.error, asJson);
    const referencesIndex = writeReferencesIndex(repositoryRoot, checkOnly);
    if (!referencesIndex.ok) return failWith(referencesIndex.error, asJson);
    const { recordCount } = outcome.value;
    const staleFiles = [...outcome.value.staleFiles, ...table.value.staleFiles, ...referencesIndex.value.staleFiles];
    const wasStale = staleFiles.length > 0;
    const built = buildCatalogIndex(repositoryRoot);
    const manifests = loadExamples(repositoryRoot);
    const disclosure = built.ok && manifests.ok ? disclosureReport(repositoryRoot, built.value, manifests.value) : undefined;
    const summary = `${recordCount} records; ${wasStale ? `${checkOnly ? "stale" : "rewrote"}: ${staleFiles.join(", ")}` : "index up to date"}`;
    print(asJson ? { ...outcome.value, wasStale, staleFiles, disclosure } : disclosure ? `${summary}\n${formatDisclosureReport(disclosure)}` : summary);
    return checkOnly && wasStale ? 1 : 0;
  }

  if (command === "plugin" && subcommand === "build") {
    const devMode = requireDevMode(roots, "plugin build");
    if (!devMode.ok) return failWith(devMode.error, asJson);
    const outcome = buildPlugin(repositoryRoot);
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const { directory, version, fileCount, totalBytes, pillarBytes } = outcome.value;
    const pillarKilobytes = Object.values(pillarBytes).reduce((sum, bytes) => sum + bytes, 0) / 1024;
    print(asJson ? outcome.value : `built ${directory} v${version}: ${fileCount} files, ${(totalBytes / 1024).toFixed(0)} KB (pillar references ${pillarKilobytes.toFixed(0)} KB across ${Object.keys(pillarBytes).length}; --json for each)`);
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

  print(formatGlobalUsage());
  return command ? 2 : 0;
}

/** `--help` always exits 0: the command's own help, a group's commands, or global usage. */
function printHelp(args: string[], asJson: boolean): number {
  const command = findCommand(args);
  const group = findCommandGroup(args[0]);
  if (command) print(asJson ? command : formatCommandHelp(command));
  else if (group.length > 0) print(asJson ? group : group.map(formatCommandHelp).join("\n\n---\n\n"));
  else print(asJson ? { commands: COMMANDS, global_flags: GLOBAL_FLAGS } : formatGlobalUsage());
  return 0;
}

// === HELPERS ===

function parseArguments(args: string[]): { flags: Record<string, string | true>; positional: string[]; error?: string } {
  const flags: Record<string, string | true> = {};
  const positional: string[] = [];
  const allFlags = [...GLOBAL_FLAGS, ...COMMANDS.flatMap((command) => command.flags)];
  const booleanFlags = new Set(allFlags.filter((flag) => !flag.value).map((flag) => flag.name));
  const valueFlags = new Set(allFlags.filter((flag) => flag.value).map((flag) => flag.name));
  let error: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (argument === "-h") { flags["help"] = true; continue; }
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

/** A numeric flag: undefined when absent, NaN when present but not a positive number. */
function optionalPositive(value: string | true | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function print(value: unknown): void {
  process.stdout.write(`${typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n`);
}

/** Every error leaves as { code, message, retryable } (ADR 0004); retryable defaults to false. */
function failWith(error: { code: string; message: string; retryable?: boolean }, asJson: boolean, exitCode = 1): number {
  const shaped = { code: error.code, message: error.message, retryable: error.retryable ?? false };
  print(asJson ? { error: shaped } : `${shaped.code}: ${shaped.message}`);
  return exitCode;
}

/** The human channel: both ends must be a terminal, which agent hosts never provide. */
function terminalIo(): TerminalIo {
  return {
    isInteractive: process.stdin.isTTY === true && process.stdout.isTTY === true,
    ask: async (prompt) => {
      const readline = createInterface({ input: process.stdin, output: process.stdout });
      try {
        return await readline.question(prompt);
      } finally {
        readline.close();
      }
    },
  };
}
