#!/usr/bin/env node
// @ts-check
/**
 * whatwhy: the PRD/ADR process described in AGENTS.md, as one dependency-free
 * file. Why one file: docs/adr/0002 and 0008. Every command is listed in USAGE.
 *
 * Exit codes: 0 success, 1 `check` or `doctor` found problems, 2 the command could not run.
 */
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

export const VERSION = '0.2.0'

const USAGE = `whatwhy ${VERSION}: PRDs say what, ADRs say why.

Usage: node scripts/whatwhy.mjs <command> [arguments] [--json]

Author
  new adr|prd "<title>" [--prd <ID>] [--supersedes <ID>]   create the next document
  accept|reject|deprecate <ADR>                            move an ADR to a new status
  approve|ship|abandon <PRD>                               move a PRD to a new status
Read
  status                                 open PRDs, accepted ADRs, specs this branch references
  list [adr|prd] [--status <status>]     the index as data
  show <ID> [--section <name>]           a document, or one section of it
Enforce
  check [--fix] [--base <ref>] [--message-file <path>]     apply the rules; --fix repairs what is mechanical
        [--errors-only]                                    leave out warnings, as the commit hook does
  index                                  regenerate the indexes
Setup
  init [--name <name>] [--description <text>]              add the process to this repository
       [--adr-dir <path>] [--prd-dir <path>]               where documents live, when not docs/adr and docs/prd
  import                                 convert ADRs written before whatwhy, in place
  upgrade                                refresh the script, templates and AGENTS.md process section
  doctor                                 report wiring problems

--json prints { data, changes[], warnings[] }, or { code, message, retryable } on failure.
--dry-run on a command that writes reports its changes without making them.`

// === TYPES ===

/** @typedef {'structure' | 'immutability' | 'traceability' | 'architecture'} RuleName */
/** @typedef {'error' | 'warn' | 'off'} Severity */
/** @typedef {{ rule: RuleName, code: string, message: string, file?: string }} Finding */
/** @typedef {Finding & { severity: Severity }} ReportedFinding */
/** @typedef {'adr' | 'prd'} DocumentKind */
/** @typedef {{ frontmatter: Record<string, string>, body: string }} ParsedDocument */
/** @typedef {ParsedDocument & { kind: DocumentKind, path: string, fileName: string, number: number, id: string }} SpecDocument */
/** @typedef {Record<DocumentKind, string>} Directories where each kind of document lives, relative to the repository root (ADR-0009) */
/** @typedef {{ baseBranch: string, directories: Directories, rules: Record<RuleName, Severity>, architecturalPaths: string[] }} Configuration */
/** @typedef {{ base: string | null, changedFiles: string[], text: string }} ChangeSet */
/** @typedef {{ base?: string, messageFile?: string, pullRequestText?: string }} CheckOptions */
/** @typedef {{ action: 'create' | 'update' | 'configure', path: string, summary: string }} Change */
/** @typedef {Map<string, { text: string, summary: string, isExecutable?: boolean }>} PendingWrites files a command intends to write, by repository path */
/** @typedef {{ data: unknown, changes: Change[], warnings: string[], lines: string[], exitCode: number }} CommandResult `lines` is the human-readable output */
/** @typedef {{ repositoryRoot: string, command: string, positionals: string[], values: Record<string, string | boolean | undefined>, environment: Record<string, string | undefined> }} CommandContext */
/** @typedef {{ id: string, kind: DocumentKind, title: string, status: string, date: string, path: string, prd?: string, supersedes?: string, supersededBy?: string }} DocumentSummary */

const DOCUMENT_KINDS = {
  adr: {
    prefix: 'ADR',
    statuses: ['proposed', 'accepted', 'rejected', 'superseded', 'deprecated'],
    sections: ['Context', 'Decision', 'Consequences'],
  },
  prd: {
    prefix: 'PRD',
    statuses: ['draft', 'approved', 'shipped', 'abandoned'],
    sections: ['Problem', 'Goals', 'Non-goals', 'Requirements', 'Success criteria'],
  },
}

/** @type {Configuration} */
const DEFAULT_CONFIGURATION = {
  baseBranch: 'main',
  directories: { adr: 'docs/adr', prd: 'docs/prd' },
  rules: { structure: 'error', immutability: 'error', traceability: 'warn', architecture: 'warn' },
  architecturalPaths: [],
}

const DOCUMENT_FILE_NAME = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/
const NON_DOCUMENT_FILE_NAMES = ['INDEX.md', 'TEMPLATE.md', 'README.md']
const SPEC_REFERENCE = /\b(adr|prd)[- ](\d{4})\b/gi // "ADR-0006" or "ADR 0006"
const DECISIONS_FOLDER_NAME = /(?:^|[-_])(?:adrs?|decisions?)$/i
const LEGACY_METADATA_LINE = /^(?:[-*] )?\**(status|date|superseded[ -]by)\**:\**\s*(.*?)\s*$/i // "Status: accepted", "**Date:** 2026-01-01"
const REFERENCE_KEYS = ['prd', 'supersedes', 'superseded-by']
const FIXABLE_CODES = ['stale-index', 'id-mismatch', 'supersede-not-reciprocal']
const RUN = 'node scripts/whatwhy.mjs'
const MANAGED_BEGIN = '<!-- whatwhy:begin' // the opening marker continues with a note to readers, so match its start only
const MANAGED_END = '<!-- whatwhy:end -->'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SCRIPT_PATH = 'scripts/whatwhy.mjs'
const CONFIGURATION_PATH = 'whatwhy.config.json'
const HOOKS_PATH = '.githooks'

/** What `init` creates from templates/ when absent. `upgrade` refreshes the entries marked isUpgraded. @param {Directories} directories @returns {{ template: string, path: string, isExecutable?: boolean, isUpgraded?: boolean }[]} */
const scaffold = (directories) => [
  { template: 'adr.md', path: `${directories.adr}/TEMPLATE.md`, isUpgraded: true },
  { template: 'prd.md', path: `${directories.prd}/TEMPLATE.md`, isUpgraded: true },
  { template: 'config.json', path: CONFIGURATION_PATH },
  { template: 'commit-msg', path: `${HOOKS_PATH}/commit-msg`, isExecutable: true },
  { template: 'workflow.yml', path: '.github/workflows/whatwhy.yml' },
  { template: 'pull_request_template.md', path: '.github/pull_request_template.md' },
  { template: 'CLAUDE.md', path: 'CLAUDE.md' },
]

/** @type {Record<string, { kind: DocumentKind, from: string[], to: string }>} */
const TRANSITIONS = {
  accept: { kind: 'adr', from: ['proposed'], to: 'accepted' },
  reject: { kind: 'adr', from: ['proposed'], to: 'rejected' },
  deprecate: { kind: 'adr', from: ['accepted'], to: 'deprecated' },
  approve: { kind: 'prd', from: ['draft'], to: 'approved' },
  ship: { kind: 'prd', from: ['approved'], to: 'shipped' },
  abandon: { kind: 'prd', from: ['draft', 'approved'], to: 'abandoned' },
}

/** A failure the caller can act on. `code` is stable; `retryable` says whether the same call could succeed later. */
export class CommandError extends Error {
  /** @param {string} code @param {string} message @param {boolean} [retryable] */
  constructor(code, message, retryable = false) {
    super(message)
    this.code = code
    this.retryable = retryable
  }
}

// === PUBLIC API ===

/**
 * Runs every rule and returns the findings whose rule is not switched off.
 * @param {string} repositoryRoot
 * @param {CheckOptions} [options]
 * @returns {ReportedFinding[]}
 */
export function runChecks(repositoryRoot, options = {}) {
  const configuration = loadConfiguration(repositoryRoot)
  const adr = loadDocuments(repositoryRoot, 'adr')
  const prd = loadDocuments(repositoryRoot, 'prd')
  const documents = [...adr.documents, ...prd.documents]
  const changeSet = readChangeSet(repositoryRoot, configuration, options)

  const findings = [
    ...adr.findings,
    ...prd.findings,
    ...checkNumbering(adr.documents),
    ...checkNumbering(prd.documents),
    ...checkCrossReferences(documents),
    ...checkIndex(repositoryRoot, 'adr', adr.documents),
    ...checkIndex(repositoryRoot, 'prd', prd.documents),
    ...checkImmutability(repositoryRoot, configuration, changeSet),
    ...checkTraceability(documents, configuration, changeSet),
    ...checkArchitecture(configuration, changeSet),
  ]
  return findings
    .map((finding) => ({ ...finding, severity: configuration.rules[finding.rule] }))
    .filter((finding) => finding.severity !== 'off')
}

/**
 * Runs one CLI command against a repository. Throws CommandError when the command cannot run.
 * @param {string} repositoryRoot
 * @param {string[]} commandLine everything after the script name
 * @param {Record<string, string | undefined>} [environment]
 * @returns {CommandResult}
 */
export function runCommand(repositoryRoot, commandLine, environment = {}) {
  const { values, positionals } = parseCommandLine(commandLine)
  if (values.version) return result({ version: VERSION }, [VERSION])
  const [command, ...rest] = positionals
  if (values.help || !command) return { ...result({ usage: USAGE }, [USAGE]), exitCode: values.help ? 0 : 2 }
  const definition = COMMANDS[command]
  if (!definition) throw new CommandError('unknown-command', `"${command}" is not a command. Expected one of: ${Object.keys(COMMANDS).join(', ')}.`)
  const unsupported = Object.keys(values).filter((option) => option !== 'json' && !definition.options.includes(option))
  if (unsupported.length > 0) {
    throw new CommandError('invalid-arguments', `\`${command}\` does not take --${unsupported.join(', --')}. It takes: ${['json', ...definition.options].map((option) => `--${option}`).join(', ')}.`)
  }
  return definition.run({ repositoryRoot, command, positionals: rest, values, environment })
}

/**
 * Regenerates the INDEX.md of each document folder.
 * @param {string} repositoryRoot
 * @returns {string[]} the paths that changed
 */
export function writeIndexes(repositoryRoot) {
  /** @type {PendingWrites} */
  const pending = new Map()
  planIndexes(repositoryRoot, pending)
  return applyWrites(repositoryRoot, pending, false).map((change) => change.path)
}

// === COMMANDS ===

/** @type {Record<string, { run: (context: CommandContext) => CommandResult, options: string[] }>} */
const COMMANDS = {
  init: { run: runInit, options: ['name', 'description', 'adr-dir', 'prd-dir', 'dry-run'] },
  import: { run: runImport, options: ['dry-run'] },
  upgrade: { run: runUpgrade, options: ['dry-run'] },
  new: { run: runNew, options: ['prd', 'supersedes', 'dry-run'] },
  ...Object.fromEntries(Object.keys(TRANSITIONS).map((name) => [name, { run: runTransition, options: ['dry-run'] }])),
  status: { run: runStatus, options: [] },
  list: { run: runList, options: ['status'] },
  show: { run: runShow, options: ['section'] },
  check: { run: runCheck, options: ['fix', 'base', 'message-file', 'errors-only', 'dry-run'] },
  index: { run: runIndex, options: ['dry-run'] },
  doctor: { run: runDoctor, options: [] },
}

/** @param {CommandContext} context @returns {CommandResult} */
function runInit({ repositoryRoot, positionals, values }) {
  if (positionals.length > 0) throw new CommandError('invalid-arguments', 'Expected `init [--name <name>] [--description <text>] [--adr-dir <path>] [--prd-dir <path>]`. Quote values that contain spaces.')
  if (git(repositoryRoot, ['rev-parse', '--git-dir']) === null) throw new CommandError('not-a-repository', `${repositoryRoot} is not a git repository. Run \`git init\` first.`)
  const isDryRun = Boolean(values['dry-run'])
  const has = (/** @type {string} */ path) => existsSync(join(repositoryRoot, path))
  /** @type {PendingWrites} */
  const pending = new Map()
  /** @type {string[]} */
  const warnings = []
  const directories = resolveInitDirectories(repositoryRoot, values, warnings)

  // Existing files are the repository's own, so only absent ones are written.
  if (!has(SCRIPT_PATH)) pending.set(SCRIPT_PATH, { text: readText(fileURLToPath(import.meta.url)), summary: `whatwhy ${VERSION}`, isExecutable: true })
  const baseBranch = detectBaseBranch(repositoryRoot)
  for (const { template, path, isExecutable } of scaffold(directories).filter((entry) => !has(entry.path))) {
    const text = path === CONFIGURATION_PATH ? `${JSON.stringify({ ...JSON.parse(readTemplate(template)), baseBranch, directories }, null, 2)}\n` : readTemplate(template)
    pending.set(path, { text, summary: 'from the whatwhy template', isExecutable })
  }
  if (!has('AGENTS.md')) {
    const replacements = { name: optionalString(values.name) ?? basename(repositoryRoot), description: optionalString(values.description) ?? '<One sentence: what this is and who it is for.>' }
    const text = readTemplate('AGENTS.md').replace(/\{\{(name|description)\}\}/g, (_, /** @type {'name' | 'description'} */ key) => replacements[key])
    pending.set('AGENTS.md', { text, summary: 'project section and process' })
  } else {
    if (values.name !== undefined || values.description !== undefined) warnings.push('AGENTS.md already exists, so --name and --description were not used.')
    const existing = readText(join(repositoryRoot, 'AGENTS.md'))
    if (!findManagedSection(existing)) pending.set('AGENTS.md', { text: `${existing.trimEnd()}\n\n${managedSectionOf(readTemplate('AGENTS.md'))}\n`, summary: 'process section appended' })
  }
  planIndexes(repositoryRoot, pending)
  const changes = applyWrites(repositoryRoot, pending, isDryRun)

  const hooksPath = git(repositoryRoot, ['config', '--get', 'core.hooksPath'])
  if (!hooksPath) {
    changes.push({ action: 'configure', path: '.git/config', summary: `core.hooksPath = ${HOOKS_PATH}` })
    if (!isDryRun) git(repositoryRoot, ['config', 'core.hooksPath', HOOKS_PATH])
  } else if (hooksPath !== HOOKS_PATH) {
    warnings.push(`git runs hooks from "${hooksPath}", so ${HOOKS_PATH}/commit-msg will not run. Add this line to ${hooksPath}/commit-msg: exec ${RUN} check --errors-only --message-file "$1"`)
  }
  const lines = changes.length > 0 ? [`whatwhy ${VERSION} is set up. Commit this with "no-spec: adopting whatwhy" and "no-adr: adopting whatwhy" in the message.`, `Then describe the project in AGENTS.md and run \`${RUN} new prd "<title>"\`.`] : ['Already set up. Nothing changed.']
  if (loadDocuments(repositoryRoot, 'adr', pending).findings.some(({ code }) => code === 'invalid-frontmatter')) {
    lines.push(`${directories.adr} holds ADRs written before whatwhy. Run \`${RUN} import\` to convert them.`)
  }
  return result({ version: VERSION, baseBranch: has(CONFIGURATION_PATH) ? loadConfiguration(repositoryRoot).baseBranch : baseBranch, directories }, lines, changes, warnings)
}

/** The folders `init` will use: the config's when there is one, else the flags or the defaults (ADR-0009). @param {string} repositoryRoot @param {CommandContext['values']} values @param {string[]} warnings @returns {Directories} */
function resolveInitDirectories(repositoryRoot, values, warnings) {
  const flags = { adr: optionalString(values['adr-dir']), prd: optionalString(values['prd-dir']) }
  if (existsSync(join(repositoryRoot, CONFIGURATION_PATH))) {
    if (flags.adr !== undefined || flags.prd !== undefined) warnings.push(`${CONFIGURATION_PATH} already exists, so --adr-dir and --prd-dir were not used. Change \`directories\` there instead.`)
    return loadConfiguration(repositoryRoot).directories
  }
  const directories = validateDirectories({ ...DEFAULT_CONFIGURATION.directories, ...(flags.adr === undefined ? {} : { adr: flags.adr }), ...(flags.prd === undefined ? {} : { prd: flags.prd }) }, (kind) => `--${kind}-dir`, 'invalid-arguments')
  // Naming the ADR folder is the human's choice made; without it, a second decisions folder would be an accident.
  const otherFolders = flags.adr === undefined ? findDecisionFolders(repositoryRoot).filter((folder) => folder !== directories.adr) : []
  if (otherFolders.length > 0) {
    throw new CommandError('existing-decisions-found', `This repository already keeps decisions in ${otherFolders.join(' and ')}, and \`init\` would start a second set in ${directories.adr}. Nothing was written. To adopt the existing ones, run \`npx whatwhy init --adr-dir ${otherFolders[0]}\` and then \`${RUN} import\`. To keep them apart on purpose, run \`npx whatwhy init --adr-dir ${directories.adr}\`.`)
  }
  return directories
}

/** Folders named like `adr` or `decisions` that hold tracked NNNN-*.md files. @param {string} repositoryRoot @returns {string[]} */
function findDecisionFolders(repositoryRoot) {
  const folders = lines(git(repositoryRoot, ['ls-files']))
    .filter((path) => /^\d{4}-.*\.md$/.test(basename(path)) && DECISIONS_FOLDER_NAME.test(basename(dirname(path))))
    .map((path) => dirname(path))
  return [...new Set(folders)].sort()
}

/** Converts the ADRs in the ADR folder that have no frontmatter, where they sit (ADR-0009). @param {CommandContext} context @returns {CommandResult} */
function runImport({ repositoryRoot, positionals, values }) {
  if (positionals.length > 0) throw new CommandError('invalid-arguments', '`import` takes no arguments. It converts the ADRs in the folder that `directories.adr` names.')
  const directory = directoryOf(repositoryRoot, 'adr')
  const fileNames = existsSync(join(repositoryRoot, directory)) ? readdirSync(join(repositoryRoot, directory)).sort() : []
  /** @type {PendingWrites} */
  const pending = new Map()
  /** @type {{ path: string, reason: string }[]} */
  const skipped = []

  for (const fileName of fileNames.filter((name) => name.endsWith('.md') && !NON_DOCUMENT_FILE_NAMES.includes(name))) {
    const path = `${directory}/${fileName}`
    const text = readText(join(repositoryRoot, path))
    if (parseDocument(text)) continue // already has frontmatter, which is what makes `import` repeatable
    const number = DOCUMENT_FILE_NAME.exec(fileName)?.[1]
    const dateAdded = () => lines(git(repositoryRoot, ['log', '--diff-filter=A', '--follow', '--format=%ad', '--date=short', '--', path])).at(-1) ?? null
    const conversion = number ? convertLegacyAdr(text, number, dateAdded) : { reason: 'The filename is not NNNN-kebab-case-title.md. Rename it first, e.g. 0004-use-sqlite.md.' }
    if ('reason' in conversion) skipped.push({ path, reason: conversion.reason })
    else pending.set(path, { text: conversion.text, summary: `ADR-${number} imported as ${conversion.status}` })
  }
  const importedPaths = [...pending.keys()]
  planIndexes(repositoryRoot, pending)
  const changes = applyWrites(repositoryRoot, pending, Boolean(values['dry-run']))

  const { documents, findings } = loadDocuments(repositoryRoot, 'adr', pending)
  const imported = documents.filter((document) => importedPaths.includes(document.path)).map(summarise)
  // An accepted ADR is frozen once merged, so anything the check will reject has to be fixed in the same change.
  const warnings = findings.filter(({ file }) => file && importedPaths.includes(file)).map(({ file, message }) => `${file}: ${message} Fix it before this import is merged.`)
  const output = [
    ...imported.map(formatSummary),
    ...skipped.map(({ path: skippedPath, reason }) => `  skipped  ${skippedPath}\n    ${reason}`),
    `${imported.length} imported, ${skipped.length} skipped.${imported.length > 0 ? ` Run \`${RUN} check\`.` : ''}`,
  ]
  return result({ imported, skipped }, output, changes, warnings)
}

/**
 * Builds frontmatter for an ADR written before whatwhy from its heading and its `Status:` and `Date:` lines,
 * and takes those lines out of the body. Everything else stays as written. Nothing is guessed: what cannot be
 * read exactly is a reason to skip the file.
 * @param {string} text
 * @param {string} number the four digits of the filename
 * @param {() => string | null} dateAdded the date the file was first committed, asked for only when it states none
 * @returns {{ text: string, status: string } | { reason: string }}
 */
function convertLegacyAdr(text, number, dateAdded) {
  if (/^---\r?\n/.test(text)) return { reason: 'It opens with a `---` block that is not flat `key: value` lines. Correct the frontmatter by hand.' }
  const lineEnding = text.includes('\r\n') ? '\r\n' : '\n'
  const textLines = text.split(/\r?\n/)
  const isSectionHeading = (/** @type {string} */ line) => line.startsWith('## ')
  const nextSection = (/** @type {number} */ from) => {
    const offset = textLines.slice(from).findIndex(isSectionHeading)
    return offset === -1 ? textLines.length : from + offset
  }

  const headingIndex = textLines.findIndex((line) => /^# \S/.test(line))
  if (headingIndex === -1) return { reason: 'It has no `# ` heading to take the title from.' }
  const heading = textLines[headingIndex].slice(2).trim()
  const numbered = /^(?:ADR[- ]?)?(\d+)\s*[.:–—-]\s+(.+)$/i.exec(heading)
  const title = numbered && Number(numbered[1]) === Number(number) ? numbered[2] : heading

  /** @type {Record<string, string>} */
  const stated = {}
  const removed = new Set()
  for (let index = headingIndex + 1; index < nextSection(headingIndex + 1); index++) {
    const match = LEGACY_METADATA_LINE.exec(textLines[index])
    if (!match) continue
    stated[match[1].toLowerCase().replace('-', ' ')] ??= match[2]
    removed.add(index)
  }
  const statusSectionIndex = textLines.findIndex((line) => /^## Status\s*$/i.test(line))
  if (stated.status === undefined && statusSectionIndex !== -1) {
    const contentIndexes = [...textLines.keys()].slice(statusSectionIndex + 1, nextSection(statusSectionIndex + 1)).filter((index) => textLines[index].trim() !== '')
    if (contentIndexes.length > 0) stated.status = textLines[contentIndexes[0]].trim()
    // A section that holds only the status is now frontmatter. One that says more is kept whole.
    if (contentIndexes.length === 1) for (let index = statusSectionIndex; index <= contentIndexes[0]; index++) removed.add(index)
  }

  if (stated.status === undefined) return { reason: 'It has no `Status:` line or `## Status` section.' }
  const statedStatus = stated.status.replace(/\.$/, '').toLowerCase()
  const superseded = /^superseded(?:\s+by\s+(.+))?$/.exec(statedStatus)
  const status = superseded ? 'superseded' : statedStatus
  if (!DOCUMENT_KINDS.adr.statuses.includes(status)) return { reason: `Its status is "${stated.status}". Expected one of: ${DOCUMENT_KINDS.adr.statuses.join(', ')}, or "superseded by NNNN".` }
  if (!superseded && stated['superseded by'] !== undefined) return { reason: `It has a \`Superseded by\` line but its status is "${stated.status}". Make them agree.` }
  const supersededBy = superseded ? /\d{1,4}/.exec(superseded[1] ?? stated['superseded by'] ?? '')?.[0] : undefined
  if (superseded && !supersededBy) return { reason: 'It is superseded but does not say by which ADR. Add a `Superseded by: NNNN` line.' }

  const date = stated.date ?? dateAdded()
  if (date === null) return { reason: 'It has no `Date:` line and no commit to take a date from. Add `Date: YYYY-MM-DD`, or commit the file first.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { reason: `Its date is "${date}". Expected YYYY-MM-DD.` }
  if (title.includes('"') && title.includes("'")) return { reason: 'Its title mixes single and double quotes, which flat frontmatter cannot hold. Use one kind.' }

  /** @type {string[]} */
  const body = []
  let hasGap = false // a removed line must not leave two blank lines where there was one on each side
  textLines.forEach((line, index) => {
    if (removed.has(index)) hasGap = true
    else if (!(hasGap && line.trim() === '' && body.at(-1)?.trim() === '')) {
      hasGap = false
      body.push(line)
    }
  })
  while (body[0]?.trim() === '') body.shift()
  const frontmatter = ['---', `id: ADR-${number}`, `title: ${yamlScalar(title)}`, `status: ${status}`, `date: "${date}"`, ...(supersededBy ? [`superseded-by: ADR-${supersededBy.padStart(4, '0')}`] : []), '---', '']
  return { text: [...frontmatter, ...body].join(lineEnding), status }
}

/** @param {CommandContext} context @returns {CommandResult} */
function runUpgrade({ repositoryRoot, positionals, values }) {
  if (positionals.length > 0) throw new CommandError('invalid-arguments', '`upgrade` takes no arguments.')
  /** @type {PendingWrites} */
  const pending = new Map()
  /** @type {string[]} */
  const warnings = []
  const template = readTemplate('AGENTS.md')
  pending.set(SCRIPT_PATH, { text: readText(fileURLToPath(import.meta.url)), summary: `whatwhy ${VERSION}`, isExecutable: true })
  for (const entry of scaffold(loadConfiguration(repositoryRoot).directories).filter(({ isUpgraded }) => isUpgraded)) pending.set(entry.path, { text: readTemplate(entry.template), summary: `whatwhy ${VERSION} template` })

  const agentsPath = join(repositoryRoot, 'AGENTS.md')
  const existing = existsSync(agentsPath) ? readText(agentsPath) : null
  const section = existing === null ? null : findManagedSection(existing)
  if (existing !== null && section) {
    pending.set('AGENTS.md', { text: existing.slice(0, section.start) + managedSectionOf(template) + existing.slice(section.end), summary: 'process section' })
  } else {
    warnings.push(`AGENTS.md ${existing === null ? 'does not exist' : `has no \`${MANAGED_BEGIN} -->\` … \`${MANAGED_END}\` section`}, so its process text was not refreshed. Run \`npx whatwhy init\` to add it.`)
  }
  planIndexes(repositoryRoot, pending)
  const changes = applyWrites(repositoryRoot, pending, Boolean(values['dry-run']))
  return result({ version: VERSION }, [changes.length > 0 ? `Upgraded to whatwhy ${VERSION}.` : `Already at whatwhy ${VERSION}. Nothing changed.`], changes, warnings)
}

/** A file from the package's templates/ directory, which a vendored copy of the script does not have (docs/adr/0005). @param {string} name */
function readTemplate(name) {
  const path = join(PACKAGE_ROOT, 'templates', name)
  if (!existsSync(path)) throw new CommandError('templates-unavailable', 'This copy of the script was vendored without the files it would write. Run the command from the package instead: `npx whatwhy@latest init` or `npx whatwhy@latest upgrade`.')
  return readText(path)
}

/** @param {string} template the AGENTS.md template @returns {string} its managed section, markers included */
function managedSectionOf(template) {
  const section = findManagedSection(template)
  if (!section) throw new Error('templates/AGENTS.md has no managed section.')
  return template.slice(section.start, section.end)
}

/** The remote's default branch, else `main` when it exists, else the branch a repository without commits will start on. @param {string} repositoryRoot */
function detectBaseBranch(repositoryRoot) {
  const remoteHead = git(repositoryRoot, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD'])
  if (remoteHead) return remoteHead.replace(/^origin\//, '')
  const hasCommits = git(repositoryRoot, ['rev-parse', '--verify', 'HEAD']) !== null
  return (!hasCommits && git(repositoryRoot, ['branch', '--show-current'])) || DEFAULT_CONFIGURATION.baseBranch
}

/** @param {CommandContext} context @returns {CommandResult} */
function runNew({ repositoryRoot, positionals, values }) {
  const [kindArgument, titleArgument, ...extra] = positionals
  const title = (titleArgument ?? '').replace(/\s+/g, ' ').trim()
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if ((kindArgument !== 'adr' && kindArgument !== 'prd') || !slug || extra.length > 0) {
    throw new CommandError('invalid-arguments', `Expected \`new adr|prd "<title>"\` with a title containing letters or digits, e.g. \`${RUN} new adr "Use SQLite"\`.`)
  }
  const kind = /** @type {DocumentKind} */ (kindArgument)
  if (kind === 'prd' && (values.prd || values.supersedes)) throw new CommandError('invalid-arguments', '--prd and --supersedes apply to ADRs only.')
  const { prefix } = DOCUMENT_KINDS[kind]
  const directory = directoryOf(repositoryRoot, kind)
  const { documents } = loadDocuments(repositoryRoot, kind)

  const existing = documents.find((document) => document.fileName.slice(5, -3) === slug)
  if (existing) return result(summarise(existing), [`${existing.id} already exists: ${existing.path}`], [], [`${existing.id} already has this title, so nothing was created.`])

  const templatePath = `${directory}/TEMPLATE.md`
  if (!existsSync(join(repositoryRoot, templatePath))) throw new CommandError('missing-template', `${templatePath} does not exist. Run \`npx whatwhy init\` to restore it.`)
  const number = String(Math.max(0, ...documents.map((document) => document.number)) + 1).padStart(4, '0')
  const id = `${prefix}-${number}`
  const path = `${directory}/${number}-${slug}.md`
  const linkedPrd = values.prd ? findDocument(repositoryRoot, String(values.prd), 'prd') : null
  const superseded = values.supersedes ? findDocument(repositoryRoot, String(values.supersedes), 'adr') : null
  if (superseded && superseded.frontmatter.status !== 'accepted') {
    throw new CommandError('invalid-transition', `${superseded.id} is ${superseded.frontmatter.status}. Only an accepted ADR can be superseded.`)
  }

  let text = readText(join(repositoryRoot, templatePath)).replaceAll(`${prefix}-NNNN`, id).replace(new RegExp(`^# ${id}: .*$`, 'm'), () => `# ${id}: ${title}`)
  text = setFrontmatterValue(text, 'id', id)
  text = setFrontmatterValue(text, 'title', yamlScalar(title))
  text = setFrontmatterValue(text, 'date', `"${today()}"`)
  if (kind === 'adr') text = setFrontmatterValue(text, 'prd', linkedPrd ? linkedPrd.id : null)
  if (superseded) text = setFrontmatterValue(text, 'supersedes', superseded.id)

  /** @type {PendingWrites} */
  const pending = new Map([[path, { text, summary: `${id}: ${title}` }]])
  if (superseded) {
    const supersededText = setFrontmatterValue(setFrontmatterValue(readText(join(repositoryRoot, superseded.path)), 'status', 'superseded'), 'superseded-by', id)
    pending.set(superseded.path, { text: supersededText, summary: `${superseded.id} superseded by ${id}` })
  }
  planIndexes(repositoryRoot, pending)
  const changes = applyWrites(repositoryRoot, pending, Boolean(values['dry-run']))
  const created = loadDocuments(repositoryRoot, kind, pending).documents.find((document) => document.path === path)
  return result(created ? summarise(created) : null, [`${id} ${path}`, 'Fill in every section, then commit.'], changes)
}

/** @param {CommandContext} context @returns {CommandResult} */
function runTransition({ repositoryRoot, command, positionals, values }) {
  const { kind, from, to } = TRANSITIONS[command]
  if (positionals.length !== 1) throw new CommandError('invalid-arguments', `Expected \`${command} <${DOCUMENT_KINDS[kind].prefix}-NNNN>\`.`)
  const document = findDocument(repositoryRoot, positionals[0], kind, command)
  const current = document.frontmatter.status
  const data = { ...summarise(document), status: to, from: current, to }
  if (current === to) return result(data, [`${document.id} is already ${to}.`])
  if (!from.includes(current)) {
    throw new CommandError('invalid-transition', `${document.id} is ${current}. \`${command}\` needs it to be ${from.join(' or ')}.${current === 'accepted' ? ` To change an accepted ADR, run \`${RUN} new adr "<title>" --supersedes ${document.id}\`.` : ''}`)
  }
  /** @type {PendingWrites} */
  const pending = new Map([[document.path, { text: setFrontmatterValue(readText(join(repositoryRoot, document.path)), 'status', to), summary: `${document.id} ${current} → ${to}` }]])
  planIndexes(repositoryRoot, pending)
  return result(data, [`${document.id} ${current} → ${to}`], applyWrites(repositoryRoot, pending, Boolean(values['dry-run'])))
}

/** @param {CommandContext} context @returns {CommandResult} */
function runStatus({ repositoryRoot }) {
  const documents = loadAllDocuments(repositoryRoot)
  const changeSet = readChangeSet(repositoryRoot, loadConfiguration(repositoryRoot), {})
  const referencedIds = referencedSpecIds(changeSet.text)
  const withStatus = (/** @type {DocumentKind} */ kind, /** @type {string[]} */ statuses) =>
    documents.filter((document) => document.kind === kind && statuses.includes(document.frontmatter.status)).map(summarise)
  const data = {
    branch: git(repositoryRoot, ['branch', '--show-current']) || null,
    openPrds: withStatus('prd', ['draft', 'approved']),
    acceptedAdrs: withStatus('adr', ['accepted']),
    referenced: documents.filter((document) => referencedIds.includes(document.id)).map(summarise),
    unknownReferences: referencedIds.filter((id) => !documents.some((document) => document.id === id)),
  }
  const block = (/** @type {string} */ heading, /** @type {DocumentSummary[]} */ summaries) => [heading, ...(summaries.length > 0 ? summaries.map(formatSummary) : ['  (none)'])]
  const lines = [
    `Branch: ${data.branch ?? '(detached)'}`,
    ...block('Open PRDs', data.openPrds),
    ...block('Accepted ADRs', data.acceptedAdrs),
    ...block('This branch references', data.referenced),
    ...data.unknownReferences.map((id) => `  ${id}  (does not exist)`),
  ]
  return result(data, lines)
}

/** @param {CommandContext} context @returns {CommandResult} */
function runList({ repositoryRoot, positionals, values }) {
  const [kind, ...extra] = positionals
  if ((kind !== undefined && kind !== 'adr' && kind !== 'prd') || extra.length > 0) throw new CommandError('invalid-arguments', 'Expected `list [adr|prd] [--status <status>]`.')
  const kinds = /** @type {DocumentKind[]} */ (kind ? [kind] : ['prd', 'adr'])
  const validStatuses = kinds.flatMap((each) => DOCUMENT_KINDS[each].statuses)
  if (values.status !== undefined && !validStatuses.includes(String(values.status))) {
    throw new CommandError('invalid-arguments', `--status "${values.status}" is not one of: ${validStatuses.join(', ')}.`)
  }
  const summaries = kinds
    .flatMap((each) => loadDocuments(repositoryRoot, each).documents)
    .filter((document) => values.status === undefined || document.frontmatter.status === values.status)
    .map(summarise)
  return result(summaries, summaries.length > 0 ? summaries.map(formatSummary) : ['(none)'])
}

/** @param {CommandContext} context @returns {CommandResult} */
function runShow({ repositoryRoot, positionals, values }) {
  if (positionals.length !== 1) throw new CommandError('invalid-arguments', 'Expected `show <ID> [--section <name>]`, e.g. `show ADR-0003 --section Decision`.')
  const document = findDocument(repositoryRoot, positionals[0])
  if (values.section === undefined) {
    const content = readText(join(repositoryRoot, document.path))
    return result({ ...summarise(document), content }, [content.trimEnd()])
  }
  const sections = splitSections(document.body)
  const wanted = String(values.section).trim().toLowerCase()
  const section = sections.find(({ name }) => name.toLowerCase() === wanted)
  if (!section) throw new CommandError('unknown-section', `${document.id} has no "${values.section}" section. It has: ${sections.map(({ name }) => name).join(', ')}.`)
  return result({ ...summarise(document), section: section.name, content: section.content }, [section.content.trimEnd()])
}

/** @param {CommandContext} context @returns {CommandResult} */
function runCheck({ repositoryRoot, values, environment }) {
  const options = { base: optionalString(values.base), messageFile: optionalString(values['message-file']), pullRequestText: environment.WHATWHY_PR_TEXT }
  const isDryRun = Boolean(values['dry-run'])
  let findings = runChecks(repositoryRoot, options)
  /** @type {Change[]} */
  let changes = []
  if (values.fix) {
    changes = applyWrites(repositoryRoot, planFixes(repositoryRoot), isDryRun)
    findings = isDryRun ? findings.filter((finding) => !FIXABLE_CODES.includes(finding.code)) : runChecks(repositoryRoot, options)
  } else if (isDryRun) {
    throw new CommandError('invalid-arguments', '`check` only writes with --fix, so --dry-run needs --fix.')
  }
  const isErrorsOnly = Boolean(values['errors-only'])
  if (isErrorsOnly) findings = findings.filter((finding) => finding.severity === 'error')
  const errorCount = findings.filter((finding) => finding.severity === 'error').length
  const lines = findings.flatMap(({ severity, rule, code, file, message }) => [
    `${severity === 'error' ? '✖ error' : '⚠ warn '}  ${rule}/${code}${file ? `  ${file}` : ''}\n    ${message}`,
    ...(environment.GITHUB_ACTIONS ? [`::${severity === 'error' ? 'error' : 'warning'} ${file ? `file=${file},` : ''}title=whatwhy ${rule}/${code}::${message}`] : []),
  ])
  lines.push(`whatwhy: ${errorCount} error(s)${isErrorsOnly ? '' : `, ${findings.length - errorCount} warning(s)`}`)
  return { ...result({ ok: errorCount === 0, findings }, lines, changes), exitCode: errorCount > 0 ? 1 : 0 }
}

/** @param {CommandContext} context @returns {CommandResult} */
function runIndex({ repositoryRoot, values }) {
  /** @type {PendingWrites} */
  const pending = new Map()
  planIndexes(repositoryRoot, pending)
  const changes = applyWrites(repositoryRoot, pending, Boolean(values['dry-run']))
  return result({ indexes: [...pending.keys()] }, changes.length > 0 ? [] : ['Indexes are up to date.'], changes)
}

/** @param {CommandContext} context @returns {CommandResult} */
function runDoctor({ repositoryRoot }) {
  /** @type {{ code: string, message: string }[]} */
  const problems = []
  const report = (/** @type {string} */ code, /** @type {string} */ message) => problems.push({ code, message })
  const has = (/** @type {string} */ path) => existsSync(join(repositoryRoot, path))

  if (Number(process.versions.node.split('.')[0]) < 20) report('node-too-old', `Node ${process.versions.node} is running. Install Node 20 or later.`)
  if (!has(SCRIPT_PATH)) report('script-missing', 'scripts/whatwhy.mjs does not exist, so the hook and the workflow have nothing to run. Run `npx whatwhy init`.')
  let configuration = DEFAULT_CONFIGURATION
  try {
    configuration = loadConfiguration(repositoryRoot)
  } catch (error) {
    report('invalid-configuration', error instanceof Error ? error.message : String(error))
  }
  const { baseBranch } = configuration
  for (const directory of Object.values(configuration.directories)) {
    if (!has(`${directory}/TEMPLATE.md`)) report('template-missing', `${directory}/TEMPLATE.md does not exist, so \`new\` cannot create documents. Run \`npx whatwhy init\`.`)
  }
  if (!has('AGENTS.md') || !findManagedSection(readText(join(repositoryRoot, 'AGENTS.md')))) {
    report('agents-md-unmanaged', `AGENTS.md has no section between \`${MANAGED_BEGIN} -->\` and \`${MANAGED_END}\`, so agents are not told the process and \`upgrade\` cannot refresh it. Run \`npx whatwhy init\`.`)
  }
  const workflowDirectory = join(repositoryRoot, '.github/workflows')
  const workflows = existsSync(workflowDirectory) ? readdirSync(workflowDirectory).filter((name) => /\.ya?ml$/.test(name)) : []
  if (!workflows.some((name) => readText(join(workflowDirectory, name)).includes('whatwhy.mjs'))) {
    report('workflow-missing', 'No workflow in .github/workflows runs scripts/whatwhy.mjs, so nothing checks pull requests. Run `npx whatwhy init`.')
  }

  if (git(repositoryRoot, ['rev-parse', '--git-dir']) === null) {
    report('not-a-repository', `${repositoryRoot} is not a git repository. Run \`git init\`.`)
  } else {
    const hookPath = join(repositoryRoot, git(repositoryRoot, ['rev-parse', '--git-path', 'hooks/commit-msg']) ?? '.git/hooks/commit-msg')
    if (!existsSync(hookPath) || !readText(hookPath).includes('whatwhy')) {
      report('hook-not-installed', has(`${HOOKS_PATH}/commit-msg`)
        ? `git is not using ${HOOKS_PATH}, so commits are not checked in this clone. Run \`${RUN} init\`.`
        : 'There is no commit-msg hook that runs whatwhy, so commits are not checked. Run `npx whatwhy init`.')
    } else if (process.platform !== 'win32' && (statSync(hookPath).mode & 0o111) === 0) {
      report('hook-not-executable', `${hookPath} is not executable, so git skips it. Run \`chmod +x ${hookPath}\`.`)
    }
    const hasCommits = git(repositoryRoot, ['rev-parse', '--verify', 'HEAD']) !== null
    const resolves = (/** @type {string} */ ref) => git(repositoryRoot, ['rev-parse', '--verify', '--quiet', ref]) !== null
    if (hasCommits && !resolves(`origin/${baseBranch}`) && !resolves(baseBranch)) {
      report('base-branch-not-found', `Base branch "${baseBranch}" does not exist here, so changes cannot be compared with it. Fetch it, or set \`baseBranch\` in ${CONFIGURATION_PATH}.`)
    }
  }
  const lines = problems.length > 0 ? problems.map(({ code, message }) => `✖ ${code}\n    ${message}`) : [`whatwhy ${VERSION}: no problems found.`]
  return { ...result({ ok: problems.length === 0, version: VERSION, problems }, lines), exitCode: problems.length > 0 ? 1 : 0 }
}

/** Repairs for the findings in FIXABLE_CODES. @param {string} repositoryRoot @returns {PendingWrites} */
function planFixes(repositoryRoot) {
  /** @type {PendingWrites} */
  const pending = new Map()
  const documents = loadAllDocuments(repositoryRoot)
  const textOf = (/** @type {SpecDocument} */ document) => pending.get(document.path)?.text ?? readText(join(repositoryRoot, document.path))
  for (const document of documents.filter(({ id, frontmatter }) => frontmatter.id !== id)) {
    pending.set(document.path, { text: setFrontmatterValue(textOf(document), 'id', document.id), summary: `id set to ${document.id}` })
  }
  for (const document of documents) {
    const superseded = documents.find(({ id }) => id === document.frontmatter.supersedes)
    if (!superseded || (superseded.frontmatter.status === 'superseded' && superseded.frontmatter['superseded-by'] === document.id)) continue
    const text = setFrontmatterValue(setFrontmatterValue(textOf(superseded), 'status', 'superseded'), 'superseded-by', document.id)
    pending.set(superseded.path, { text, summary: `${superseded.id} superseded by ${document.id}` })
  }
  planIndexes(repositoryRoot, pending)
  return pending
}

/** Adds both indexes, as they will read once `pending` is written. @param {string} repositoryRoot @param {PendingWrites} pending */
function planIndexes(repositoryRoot, pending) {
  for (const kind of /** @type {DocumentKind[]} */ (['adr', 'prd'])) {
    pending.set(`${directoryOf(repositoryRoot, kind, pending)}/INDEX.md`, { text: renderIndex(kind, loadDocuments(repositoryRoot, kind, pending).documents), summary: `${DOCUMENT_KINDS[kind].prefix} index` })
  }
}

/** Writes what differs from disk and reports it. Identical files are skipped, which is what makes commands repeatable. @param {string} repositoryRoot @param {PendingWrites} pending @param {boolean} isDryRun @returns {Change[]} */
function applyWrites(repositoryRoot, pending, isDryRun) {
  /** @type {Change[]} */
  const changes = []
  for (const [path, { text, summary, isExecutable }] of pending) {
    const absolutePath = join(repositoryRoot, path)
    const exists = existsSync(absolutePath)
    if (exists && readText(absolutePath) === text) continue
    changes.push({ action: exists ? 'update' : 'create', path, summary })
    if (isDryRun) continue
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, text)
    if (isExecutable) chmodSync(absolutePath, 0o755)
  }
  return changes
}

/** Resolves an ID argument such as `adr-3` or `PRD-0002`. @param {string} repositoryRoot @param {string} idArgument @param {DocumentKind} [kind] required kind @param {string} [command] named in the error when the kind is wrong @returns {SpecDocument} */
function findDocument(repositoryRoot, idArgument, kind, command) {
  const match = /^(adr|prd)-(\d{1,4})$/i.exec(idArgument.trim())
  if (!match) throw new CommandError('invalid-arguments', `"${idArgument}" is not a document ID. Expected e.g. ADR-0003 or PRD-0001.`)
  const actualKind = /** @type {DocumentKind} */ (match[1].toLowerCase())
  const id = `${match[1].toUpperCase()}-${match[2].padStart(4, '0')}`
  if (kind && kind !== actualKind) {
    const alternatives = Object.keys(TRANSITIONS).filter((name) => TRANSITIONS[name].kind === actualKind).join(', ')
    throw new CommandError('invalid-arguments', `${id} is not ${kind === 'adr' ? 'an ADR' : 'a PRD'}.${command ? ` \`${command}\` applies to ${DOCUMENT_KINDS[kind].prefix}s; for a ${DOCUMENT_KINDS[actualKind].prefix} use ${alternatives}.` : ''}`)
  }
  const document = loadDocuments(repositoryRoot, actualKind).documents.find((candidate) => candidate.id === id)
  if (!document) throw new CommandError('unknown-document', `${id} does not exist. See ${directoryOf(repositoryRoot, actualKind)}/INDEX.md, or run \`${RUN} list\`.`)
  return document
}

/** @param {SpecDocument} document @returns {DocumentSummary} */
function summarise({ id, kind, path, frontmatter }) {
  return {
    id,
    kind,
    title: frontmatter.title ?? '',
    status: frontmatter.status ?? '',
    date: frontmatter.date ?? '',
    path,
    ...(frontmatter.prd ? { prd: frontmatter.prd } : {}),
    ...(frontmatter.supersedes ? { supersedes: frontmatter.supersedes } : {}),
    ...(frontmatter['superseded-by'] ? { supersededBy: frontmatter['superseded-by'] } : {}),
  }
}

const formatSummary = (/** @type {DocumentSummary} */ { id, status, title }) => `  ${id}  ${status.padEnd(10)}  ${title}`

/** @param {unknown} data @param {string[]} lines @param {Change[]} [changes] @param {string[]} [warnings] @returns {CommandResult} */
function result(data, lines, changes = [], warnings = []) {
  return { data, changes, warnings, lines, exitCode: 0 }
}

// === STRUCTURE RULE ===

/**
 * @param {string} repositoryRoot
 * @param {DocumentKind} kind
 * @param {PendingWrites} [pending] read in place of what is on disk
 * @returns {{ documents: SpecDocument[], findings: Finding[] }}
 */
function loadDocuments(repositoryRoot, kind, pending = new Map()) {
  const { prefix } = DOCUMENT_KINDS[kind]
  const directory = directoryOf(repositoryRoot, kind, pending)
  /** @type {SpecDocument[]} */
  const documents = []
  /** @type {Finding[]} */
  const findings = []
  const fileNames = new Set(existsSync(join(repositoryRoot, directory)) ? readdirSync(join(repositoryRoot, directory)) : [])
  for (const path of pending.keys()) {
    if (dirname(path) === directory) fileNames.add(path.slice(directory.length + 1))
  }

  for (const fileName of [...fileNames].sort()) {
    if (!fileName.endsWith('.md') || NON_DOCUMENT_FILE_NAMES.includes(fileName)) continue
    const path = `${directory}/${fileName}`
    const nameMatch = DOCUMENT_FILE_NAME.exec(fileName)
    if (!nameMatch) {
      findings.push(structureFinding('invalid-filename', path, 'Expected NNNN-kebab-case-title.md, e.g. 0004-use-sqlite.md.'))
      continue
    }
    const parsed = parseDocument(pending.get(path)?.text ?? readText(join(repositoryRoot, path)))
    if (!parsed) {
      findings.push(structureFinding('invalid-frontmatter', path, `Expected the file to open with a \`---\` block of flat \`key: value\` lines. Copy TEMPLATE.md${kind === 'adr' ? `, or run \`${RUN} import\` if this ADR was written before whatwhy` : ''}.`))
      continue
    }
    const document = { ...parsed, kind, path, fileName, number: Number(nameMatch[1]), id: `${prefix}-${nameMatch[1]}` }
    documents.push(document)
    findings.push(...checkDocument(document))
  }
  return { documents, findings }
}

/** @param {string} repositoryRoot @returns {SpecDocument[]} */
function loadAllDocuments(repositoryRoot) {
  return [...loadDocuments(repositoryRoot, 'prd').documents, ...loadDocuments(repositoryRoot, 'adr').documents]
}

/** @param {SpecDocument} document @returns {Finding[]} */
function checkDocument(document) {
  const { statuses, sections } = DOCUMENT_KINDS[document.kind]
  const { frontmatter, body, path } = document
  /** @type {Finding[]} */
  const findings = []
  const report = (/** @type {string} */ code, /** @type {string} */ message) => findings.push(structureFinding(code, path, message))

  for (const key of ['id', 'title', 'status', 'date']) {
    if (!frontmatter[key]) report('missing-frontmatter-key', `Frontmatter needs a \`${key}\` value.`)
  }
  if (frontmatter.id && frontmatter.id !== document.id) {
    report('id-mismatch', `Frontmatter id is "${frontmatter.id}" but the filename implies "${document.id}". Make them agree, or run \`${RUN} check --fix\`.`)
  }
  if (frontmatter.status && !statuses.includes(frontmatter.status)) {
    report('invalid-status', `Status "${frontmatter.status}" is not one of: ${statuses.join(', ')}.`)
  }
  if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
    report('invalid-date', `Date "${frontmatter.date}" must be YYYY-MM-DD.`)
  }
  if (frontmatter.status === 'superseded' && !frontmatter['superseded-by']) {
    report('missing-superseded-by', 'A superseded document needs `superseded-by: <ID>` in its frontmatter.')
  }
  const headings = new Set(body.split('\n').map((line) => /^## (.+?)\s*$/.exec(line)?.[1]))
  for (const section of sections.filter((name) => !headings.has(name))) {
    report('missing-section', `Add a "## ${section}" section. Required: ${sections.join(', ')}.`)
  }
  return findings
}

/** @param {SpecDocument[]} documents sorted by filename @returns {Finding[]} */
function checkNumbering(documents) {
  const index = documents.findIndex((document, position) => document.number !== position + 1)
  if (index === -1) return []
  const expected = String(index + 1).padStart(4, '0')
  return [structureFinding('numbering-not-contiguous', documents[index].path, `Expected number ${expected}. Numbers run from 0001 with no gaps or duplicates.`)]
}

/** @param {SpecDocument[]} documents @returns {Finding[]} */
function checkCrossReferences(documents) {
  const documentsById = new Map(documents.map((document) => [document.id, document]))
  /** @type {Finding[]} */
  const findings = []
  for (const document of documents) {
    for (const key of REFERENCE_KEYS) {
      const target = document.frontmatter[key]
      if (target && !documentsById.has(target)) {
        findings.push(structureFinding('unresolved-reference', document.path, `\`${key}: ${target}\` does not match any document.`))
      }
    }
    const superseded = documentsById.get(document.frontmatter.supersedes)
    if (superseded && (superseded.frontmatter.status !== 'superseded' || superseded.frontmatter['superseded-by'] !== document.id)) {
      findings.push(structureFinding('supersede-not-reciprocal', superseded.path, `${document.id} supersedes this document. Set \`status: superseded\` and \`superseded-by: ${document.id}\`, or run \`${RUN} check --fix\`.`))
    }
  }
  return findings
}

/** @param {string} repositoryRoot @param {DocumentKind} kind @param {SpecDocument[]} documents @returns {Finding[]} */
function checkIndex(repositoryRoot, kind, documents) {
  const path = `${directoryOf(repositoryRoot, kind)}/INDEX.md`
  const absolutePath = join(repositoryRoot, path)
  if (!existsSync(absolutePath) && documents.length === 0) return []
  if (existsSync(absolutePath) && readText(absolutePath) === renderIndex(kind, documents)) return []
  return [structureFinding('stale-index', path, `The index does not match the documents. Run \`${RUN} index\`.`)]
}

/** @param {DocumentKind} kind @param {SpecDocument[]} documents */
function renderIndex(kind, documents) {
  const cell = (/** @type {string | undefined} */ value) => (value ?? '').replaceAll('|', '\\|')
  const rows = documents.map(({ id, fileName, frontmatter }) => `| [${id}](${fileName}) | ${cell(frontmatter.title)} | ${cell(frontmatter.status)} | ${cell(frontmatter.date)} |`)
  return [
    '<!-- Generated by `whatwhy index`. Do not edit by hand. -->',
    `# ${DOCUMENT_KINDS[kind].prefix} index`,
    '',
    '| ID | Title | Status | Date |',
    '| --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n')
}

// === IMMUTABILITY RULE ===

/** An ADR that left `proposed` before the base keeps its body; only its status may move on. ADRs added by this change stay editable for review. @param {string} repositoryRoot @param {Configuration} configuration @param {ChangeSet} changeSet @returns {Finding[]} */
function checkImmutability(repositoryRoot, configuration, changeSet) {
  if (!changeSet.base) return []
  /** @type {Finding[]} */
  const findings = []
  const report = (/** @type {string} */ code, /** @type {string} */ file, /** @type {string} */ message) => findings.push({ rule: 'immutability', code, file, message })

  for (const path of changeSet.changedFiles.filter((file) => isSpecDocumentPath(file, configuration.directories, 'adr'))) {
    const textAtBase = git(repositoryRoot, ['show', `${changeSet.base}:${path}`])
    const before = textAtBase === null ? null : parseDocument(textAtBase)
    if (!before || before.frontmatter.status === 'proposed') continue
    const id = before.frontmatter.id

    if (!existsSync(join(repositoryRoot, path))) {
      report('frozen-adr-removed', path, `${id} is ${before.frontmatter.status} and cannot be deleted or renamed. Restore it; supersede it with a new ADR instead.`)
      continue
    }
    const after = parseDocument(readText(join(repositoryRoot, path)))
    if (!after) continue // the structure rule reports unparseable files

    const keys = new Set([...Object.keys(before.frontmatter), ...Object.keys(after.frontmatter)])
    const editedKeys = [...keys].filter((key) => !['status', 'superseded-by'].includes(key) && before.frontmatter[key] !== after.frontmatter[key])
    if (before.body.trimEnd() !== after.body.trimEnd() || editedKeys.length > 0) {
      const what = editedKeys.length > 0 ? `frontmatter (${editedKeys.join(', ')})` : 'body'
      report('frozen-adr-edited', path, `${id} is ${before.frontmatter.status}, so its ${what} is frozen. Revert the edit and write a new ADR with \`supersedes: ${id}\`.`)
    }
    const from = before.frontmatter.status
    const to = after.frontmatter.status
    if (from !== to && !(from === 'accepted' && ['superseded', 'deprecated'].includes(to))) {
      report('invalid-status-transition', path, `${id} cannot go from ${from} to ${to}. Only accepted → superseded or deprecated is allowed.`)
    }
  }
  return findings
}

// === TRACEABILITY RULE ===

/** @param {SpecDocument[]} documents @param {Configuration} configuration @param {ChangeSet} changeSet @returns {Finding[]} */
function checkTraceability(documents, { directories }, changeSet) {
  if (changeSet.changedFiles.length === 0) return []
  const knownIds = new Set(documents.map((document) => document.id))
  const referencedIds = referencedSpecIds(changeSet.text)
  const unknownIds = referencedIds.filter((id) => !knownIds.has(id))
  if (unknownIds.length > 0) {
    return [{ rule: 'traceability', code: 'unknown-spec-reference', message: `The branch, commits or pull request mention ${unknownIds.join(', ')}, which does not exist. See ${directories.adr}/INDEX.md and ${directories.prd}/INDEX.md.` }]
  }
  const isJustified = referencedIds.length > 0 || /\bno-spec:\s*\S/i.test(changeSet.text) || changeSet.changedFiles.some((file) => isSpecDocumentPath(file, directories))
  if (isJustified) return []
  return [{ rule: 'traceability', code: 'missing-spec-reference', message: 'This change references no PRD or ADR. Mention an ID (e.g. PRD-0001) in the branch name, a commit message or the pull request, or write `no-spec: <reason>`.' }]
}

/** @param {string} text @returns {string[]} unique IDs, upper case */
function referencedSpecIds(text) {
  return [...new Set([...text.matchAll(SPEC_REFERENCE)].map((match) => `${match[1].toUpperCase()}-${match[2]}`))]
}

// === ARCHITECTURE RULE ===

/** @param {Configuration} configuration @param {ChangeSet} changeSet @returns {Finding[]} */
function checkArchitecture(configuration, changeSet) {
  const patterns = configuration.architecturalPaths.map(globToRegExp)
  const architecturalFiles = changeSet.changedFiles.filter((file) => patterns.some((pattern) => pattern.test(file)))
  if (architecturalFiles.length === 0) return []
  const isJustified = changeSet.changedFiles.some((file) => isSpecDocumentPath(file, configuration.directories, 'adr')) || /\bno-adr:\s*\S/i.test(changeSet.text)
  if (isJustified) return []
  return [{ rule: 'architecture', code: 'architectural-change-without-adr', message: `Architectural paths changed (${architecturalFiles.join(', ')}) with no ADR in the same change. Add one with \`${RUN} new adr "<title>"\`, or write \`no-adr: <reason>\` in a commit message or the pull request.` }]
}

// === CHANGE SET ===

/** The change under review: the working tree compared with where the branch left the base branch. @param {string} repositoryRoot @param {Configuration} configuration @param {CheckOptions} options @returns {ChangeSet} */
function readChangeSet(repositoryRoot, configuration, options) {
  const hasCommits = git(repositoryRoot, ['rev-parse', '--verify', 'HEAD']) !== null
  const base = hasCommits ? resolveBase(repositoryRoot, configuration, options) : null
  const untrackedFiles = lines(git(repositoryRoot, ['ls-files', '--others', '--exclude-standard']))
  const changedFiles = base
    ? [...lines(git(repositoryRoot, ['diff', '--name-only', '--no-renames', base])), ...untrackedFiles]
    : [...lines(git(repositoryRoot, ['ls-files'])), ...untrackedFiles]
  const commitMessage = options.messageFile ? readText(options.messageFile).split('\n').filter((line) => !line.startsWith('#')).join('\n') : ''
  const text = [
    git(repositoryRoot, ['branch', '--show-current']),
    base ? git(repositoryRoot, ['log', '--format=%B', `${base}..HEAD`]) : '',
    options.pullRequestText,
    commitMessage,
  ].join('\n')
  return { base, changedFiles, text }
}

/** @param {string} repositoryRoot @param {Configuration} configuration @param {CheckOptions} options @returns {string | null} */
function resolveBase(repositoryRoot, configuration, options) {
  const mergeBase = (/** @type {string} */ ref) => git(repositoryRoot, ['merge-base', 'HEAD', ref])
  if (!options.base) return mergeBase(`origin/${configuration.baseBranch}`) ?? mergeBase(configuration.baseBranch)
  const base = mergeBase(options.base)
  if (!base) throw new Error(`--base ${options.base} shares no history with HEAD. Expected a fetched ref; in CI, check out with fetch-depth: 0.`)
  return base
}

// === HELPERS ===

/** @param {string} repositoryRoot @param {PendingWrites} [pending] read in place of what is on disk @returns {Configuration} */
function loadConfiguration(repositoryRoot, pending = new Map()) {
  const path = join(repositoryRoot, CONFIGURATION_PATH)
  let overrides = {}
  try {
    const text = pending.get(CONFIGURATION_PATH)?.text ?? (existsSync(path) ? readText(path) : null)
    if (text !== null) overrides = JSON.parse(text)
  } catch (error) {
    throw new CommandError('invalid-configuration', `${CONFIGURATION_PATH} is not valid JSON: ${error instanceof Error ? error.message : error}`)
  }
  const configuration = { ...DEFAULT_CONFIGURATION, ...overrides, rules: { ...DEFAULT_CONFIGURATION.rules, ...overrides.rules } }
  for (const [rule, severity] of Object.entries(configuration.rules)) {
    if (!(rule in DEFAULT_CONFIGURATION.rules) || !['error', 'warn', 'off'].includes(severity)) {
      throw new CommandError('invalid-configuration', `${CONFIGURATION_PATH}: rules.${rule} is "${severity}". Expected one of ${Object.keys(DEFAULT_CONFIGURATION.rules).join(', ')} set to error, warn or off.`)
    }
  }
  const directories = validateDirectories({ ...DEFAULT_CONFIGURATION.directories, ...overrides.directories }, (kind) => `${CONFIGURATION_PATH}: directories.${kind}`, 'invalid-configuration')
  return { ...configuration, directories }
}

/** @param {string} repositoryRoot @param {DocumentKind} kind @param {PendingWrites} [pending] */
function directoryOf(repositoryRoot, kind, pending) {
  return loadConfiguration(repositoryRoot, pending).directories[kind]
}

/**
 * Each folder must be a relative path inside the repository, and the two must differ.
 * @param {Record<string, unknown>} candidate
 * @param {(kind: DocumentKind) => string} nameOf how the caller spells each setting, for the message
 * @param {string} code the CommandError code when one is invalid
 * @returns {Directories} normalised, with no trailing slash
 */
function validateDirectories(candidate, nameOf, code) {
  const normalise = (/** @type {DocumentKind} */ kind) => {
    const value = candidate[kind]
    const normalised = typeof value === 'string' && !isAbsolute(value) && !value.includes('\\') ? posix.normalize(value).replace(/\/$/, '') : '.'
    if (normalised === '.' || normalised === '..' || normalised.startsWith('../')) {
      throw new CommandError(code, `${nameOf(kind)} is ${JSON.stringify(value)}. Expected a folder inside the repository, relative to its root, e.g. "${DEFAULT_CONFIGURATION.directories[kind]}".`)
    }
    return normalised
  }
  const directories = { adr: normalise('adr'), prd: normalise('prd') }
  if (directories.adr === directories.prd) throw new CommandError(code, `${nameOf('adr')} and ${nameOf('prd')} are both "${directories.adr}". ADRs and PRDs need separate folders.`)
  return directories
}

/** Splits a document into flat `key: value` frontmatter and body. Null when there is no valid frontmatter. @param {string} text @returns {ParsedDocument | null} */
function parseDocument(text) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text.replaceAll('\r\n', '\n'))
  if (!match) return null
  /** @type {Record<string, string>} */
  const frontmatter = {}
  for (const line of match[1].split('\n').filter((candidate) => candidate.trim() && !candidate.trim().startsWith('#'))) {
    const pair = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line)
    if (!pair) return null
    frontmatter[pair[1]] = pair[2].trim().replace(/^(["'])(.*)\1$/, '$2')
  }
  return { frontmatter, body: match[2] }
}

/** @param {string} path @param {Directories} directories @param {DocumentKind} [kind] any kind when omitted */
function isSpecDocumentPath(path, directories, kind) {
  const candidates = kind ? [directories[kind]] : Object.values(directories)
  return candidates.some((directory) => path.startsWith(`${directory}/`) && DOCUMENT_FILE_NAME.test(path.slice(directory.length + 1)))
}

/** Supports `*`, `?` and `**`. A `**` followed by a slash also matches zero directories. @param {string} glob */
function globToRegExp(glob) {
  const tokens = { '**/': '(?:.*/)?', '**': '.*', '*': '[^/]*', '?': '[^/]' }
  const pattern = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\/|\*\*|\*|\?/g, (token) => tokens[/** @type {keyof typeof tokens} */ (token)])
  return new RegExp(`^${pattern}$`)
}

/** @returns {Finding} */
function structureFinding(/** @type {string} */ code, /** @type {string} */ file, /** @type {string} */ message) {
  return { rule: 'structure', code, file, message }
}

/** Runs git and returns stdout, or null when the command fails. @param {string} repositoryRoot @param {string[]} gitArguments */
function git(repositoryRoot, gitArguments) {
  try {
    return execFileSync('git', gitArguments, { cwd: repositoryRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trimEnd()
  } catch {
    return null
  }
}

/** Sets, adds or (with null) removes one frontmatter line, leaving every other line as it was. @param {string} text @param {string} key @param {string | null} value */
function setFrontmatterValue(text, key, value) {
  const textLines = text.split('\n')
  const closing = textLines.findIndex((line, index) => index > 0 && line.trimEnd() === '---')
  if (textLines[0].trimEnd() !== '---' || closing === -1) throw new CommandError('invalid-frontmatter', `Cannot set \`${key}\`: the document does not open with a \`---\` frontmatter block.`)
  const existing = textLines.findIndex((line, index) => index > 0 && index < closing && line.startsWith(`${key}:`))
  if (existing !== -1) textLines.splice(existing, 1, ...(value === null ? [] : [`${key}: ${value}`]))
  else if (value !== null) textLines.splice(closing, 0, `${key}: ${value}`)
  return textLines.join('\n')
}

/** Quotes a frontmatter value when YAML would misread it. The parser here reads either form. @param {string} value */
function yamlScalar(value) {
  if (/^[A-Za-z0-9][^:#"'\[\]{}]*$/.test(value)) return value
  if (!value.includes('"')) return `"${value}"`
  if (!value.includes("'")) return `'${value}'`
  throw new CommandError('invalid-arguments', 'The title mixes single and double quotes, which flat frontmatter cannot hold. Use one kind.')
}

/** @param {string} body @returns {{ name: string, content: string }[]} each `## ` section, heading included */
function splitSections(body) {
  /** @type {{ name: string, content: string }[]} */
  const sections = []
  for (const line of body.split('\n')) {
    const heading = /^## (.+?)\s*$/.exec(line)
    if (heading) sections.push({ name: heading[1], content: '' })
    if (sections.length > 0) sections[sections.length - 1].content += `${line}\n`
  }
  return sections.map(({ name, content }) => ({ name, content: `${content.trimEnd()}\n` }))
}

/** The managed section of AGENTS.md (docs/adr/0007), markers included. Null when the markers are missing or out of order. @param {string} text @returns {{ start: number, end: number } | null} */
function findManagedSection(text) {
  const start = text.indexOf(MANAGED_BEGIN)
  const end = text.indexOf(MANAGED_END)
  return start === -1 || end < start ? null : { start, end: end + MANAGED_END.length }
}

function today() {
  const now = new Date()
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
}

const optionalString = (/** @type {string | boolean | undefined} */ value) => (typeof value === 'string' ? value : undefined)
const lines = (/** @type {string | null} */ output) => (output ? output.split('\n').filter(Boolean) : [])
const readText = (/** @type {string} */ path) => readFileSync(path, 'utf8')

// === COMMAND LINE ===

/** @param {string[]} commandLine */
function parseCommandLine(commandLine) {
  try {
    return parseArgs({
      args: commandLine,
      allowPositionals: true,
      options: {
        json: { type: 'boolean' },
        'dry-run': { type: 'boolean' },
        fix: { type: 'boolean' },
        'errors-only': { type: 'boolean' },
        help: { type: 'boolean' },
        version: { type: 'boolean' },
        base: { type: 'string' },
        name: { type: 'string' },
        'adr-dir': { type: 'string' },
        'prd-dir': { type: 'string' },
        description: { type: 'string' },
        'message-file': { type: 'string' },
        prd: { type: 'string' },
        supersedes: { type: 'string' },
        status: { type: 'string' },
        section: { type: 'string' },
      },
    })
  } catch (error) {
    throw new CommandError('invalid-arguments', `${error instanceof Error ? error.message : error} Run \`${RUN} --help\` for usage.`)
  }
}

function main() {
  const commandLine = process.argv.slice(2)
  const wantsJson = commandLine.includes('--json')
  try {
    const repositoryRoot = git(process.cwd(), ['rev-parse', '--show-toplevel']) ?? process.cwd()
    const { data, changes, warnings, lines: output, exitCode } = runCommand(repositoryRoot, commandLine, process.env)
    if (wantsJson) {
      console.log(JSON.stringify({ data, changes, warnings }, null, 2))
    } else {
      const verb = commandLine.includes('--dry-run') ? 'would ' : ''
      for (const line of output) console.log(line)
      for (const { action, path, summary } of changes) console.log(`${verb}${action} ${path}  (${summary})`)
      for (const warning of warnings) console.error(`⚠ ${warning}`)
    }
    process.exitCode = exitCode
  } catch (error) {
    const failure = error instanceof CommandError
      ? { code: error.code, message: error.message, retryable: error.retryable }
      : { code: 'internal-error', message: error instanceof Error ? error.message : String(error), retryable: false }
    if (wantsJson) console.log(JSON.stringify(failure, null, 2))
    else console.error(`whatwhy could not run (${failure.code}): ${failure.message}`)
    process.exitCode = 2
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main()
