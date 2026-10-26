#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { writeCatalogIndex } from "./catalog.js";
import { formatDoctorTable, runDoctor } from "./doctor.js";
import { logEvent, startTimer } from "./log.js";
import { findRepositoryRoot } from "./repository.js";
import { filterTools, findTool, formatToolTable, loadTools } from "./tools.js";
import { hasErrors, validateRepository } from "./validate.js";

const USAGE = `vcr <command>

  validate                      Validate catalogue, projects, references and environment records
  tools list [--capability x] [--tier x] [--category x]
  tools info <id>
  doctor                        Probe local tools and write environment/<hostname>.json
  catalog build [--check]       Regenerate catalog/tools.json from catalog/tools/*.json

Flags: --json for machine-readable output.`;

// === ENTRY ===

const argv = process.argv.slice(2);
const flags = parseFlags(argv);
const positional = argv.filter((argument) => !argument.startsWith("--"));
const repositoryRoot = findRepositoryRoot();
const elapsed = startTimer();

const exitCode = await dispatch(positional, flags);
logEvent("command.finished", { command: positional.join(" ") || "help", duration_ms: elapsed(), exit_code: exitCode });
process.exit(exitCode);

// === COMMANDS ===

async function dispatch(args: string[], options: Record<string, string | true>): Promise<number> {
  const [command, subcommand, target] = args;
  const asJson = options["json"] === true;

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
    if (subcommand === "info" && target) {
      const tool = findTool(tools.value, target);
      if (!tool.ok) return failWith(tool.error, asJson);
      print(asJson ? tool.value : JSON.stringify(tool.value, null, 2));
      return 0;
    }
  }

  if (command === "catalog" && subcommand === "build") {
    const checkOnly = options["check"] === true;
    const outcome = writeCatalogIndex(repositoryRoot, checkOnly);
    if (!outcome.ok) return failWith(outcome.error, asJson);
    const { recordCount, wasStale } = outcome.value;
    print(asJson ? outcome.value : `${recordCount} records; index ${wasStale ? (checkOnly ? "is stale" : "rewritten") : "up to date"}`);
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

function parseFlags(args: string[]): Record<string, string | true> {
  const parsed: Record<string, string | true> = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]!;
    if (!argument.startsWith("--")) continue;
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      parsed[argument.slice(2)] = next;
      index += 1;
    } else parsed[argument.slice(2)] = true;
  }
  return parsed;
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
