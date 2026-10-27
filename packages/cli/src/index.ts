#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeCatalogIndex } from "./catalog.js";
import { formatDoctorTable, runDoctor } from "./doctor.js";
import { logEvent, startTimer } from "./log.js";
import { findRepositoryRoot } from "./repository.js";
import { filterTools, findTool, formatExamplesForTool, formatToolCard, formatToolTable, loadExamples, loadTools, readToolGuide } from "./tools.js";
import { hasErrors, validateRepository } from "./validate.js";

const USAGE = `vcr <command>

  validate                      Validate catalogue, projects, references and environment records
  tools list [--capability x] [--tier x] [--category x]   Tier 0: one line per tool
  tools info <id> [--full]      Tier 1 card; --full appends the tier 2 guide
  tools examples <id>           Tier 3: runnable examples that demonstrate the tool
  doctor                        Probe local tools and write environment/<hostname>.json
  catalog build [--check]       Regenerate catalog/tools.json and catalog/INDEX.md

Flags: --json for machine-readable output.`;

// === ENTRY ===

const argv = process.argv.slice(2);
const parsed = parseArguments(argv);
const { flags, positional } = parsed;
const repositoryRoot = findRepositoryRoot();
const elapsed = startTimer();

const exitCode = await dispatch(positional, flags);
logEvent("command.finished", { command: positional.join(" ") || "help", duration_ms: elapsed(), exit_code: exitCode });
process.exit(exitCode);

// === COMMANDS ===

async function dispatch(args: string[], options: Record<string, string | true>): Promise<number> {
  const [command, subcommand, target] = args;
  const asJson = options["json"] === true;
  if (parsed.error) {
    print(asJson ? { error: { code: "INVALID_ARGUMENT", message: parsed.error } } : `${parsed.error}\n\n${USAGE}`);
    return 2;
  }

  if (command === "validate") {
    const report = validateRepository(repositoryRoot);
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

  if (command === "catalog" && subcommand === "build") {
    const checkOnly = options["check"] === true;
    const outcome = writeCatalogIndex(repositoryRoot, checkOnly);
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const { recordCount, wasStale, staleFiles } = outcome.value;
    print(asJson ? outcome.value : `${recordCount} records; ${wasStale ? `${checkOnly ? "stale" : "rewrote"}: ${staleFiles.join(", ")}` : "index up to date"}`);
    return checkOnly && wasStale ? 1 : 0;
  }

  if (command === "doctor") {
    const record = await runDoctor();
    const outputDirectory = join(repositoryRoot, "environment");
    mkdirSync(outputDirectory, { recursive: true });
    const outputPath = join(outputDirectory, `${record.hostname}.json`);
    writeFileSync(outputPath, `${JSON.stringify(record, null, 2)}\n`);
    print(asJson ? record : `${formatDoctorTable(record)}\n\nwritten ${outputPath}`);
    return 0;
  }

  print(USAGE);
  return command ? 2 : 0;
}

// === HELPERS ===

function parseArguments(args: string[]): { flags: Record<string, string | true>; positional: string[]; error?: string } {
  const flags: Record<string, string | true> = {};
  const positional: string[] = [];
  const booleanFlags = new Set(["json", "full", "check"]);
  const valueFlags = new Set(["capability", "tier", "category"]);
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

function text(value: string | true | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function print(value: unknown): void {
  process.stdout.write(`${typeof value === "string" ? value : JSON.stringify(value, null, 2)}\n`);
}

function failWith(error: { code: string; message: string }, asJson: boolean): number {
  print(asJson ? { error } : `${error.code}: ${error.message}`);
  return 1;
}
