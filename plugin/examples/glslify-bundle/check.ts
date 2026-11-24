// === PUBLIC API ===
// Checks the glslify bundle of input/main.frag against the predeclared checks in README.md and writes
// output/report.json (diffed against expected/report.json by run.sh). Exits 1 if any check fails.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { hostname } from "node:os";

const PRAGMA_IMPORT = "#pragma glslify";
const FUNCTION_DEFINITION = "float cubicInOut(float t) {";
const OUTPUT_COLOUR_LINE = "gl_FragColor = vec4(eased, 0.0, 0.0, 1.0);";
const VERTEX_SHADER = `attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

interface CompileOutcome {
  readonly webglAvailable: boolean;
  readonly compiled: boolean;
  readonly log: string;
  readonly renderer: string;
}

interface PlaywrightPage {
  setContent(html: string): Promise<void>;
  evaluate<Result>(expression: string): Promise<Result>;
}

interface PlaywrightBrowser {
  newPage(): Promise<PlaywrightPage>;
  version(): string;
  close(): Promise<void>;
}

interface PlaywrightModule {
  chromium: { launch(options: { headless: boolean }): Promise<PlaywrightBrowser> };
}

interface Report {
  pins: { glslify: string; "glsl-easings": string };
  input: { pragmaImports: number };
  bundle: {
    sha256: string;
    bytes: number;
    lines: number;
    pragmaImports: number;
    requireCalls: number;
    definesFunction: boolean;
  };
  compile: { bundle: boolean; rawInput: boolean; brokenBundle: boolean };
  checks: Record<string, boolean>;
}

async function main(): Promise<void> {
  const inputSource = readText("input/main.frag");
  const bundleSource = readText("output/bundle-1.frag");
  const secondBundleSource = readText("output/bundle-2.frag");
  const brokenBundleSource = breakColourLine(bundleSource);

  const browser = await launchChromium();
  let compile: Report["compile"];
  let renderer: string;
  try {
    const bundleOutcome = await compileFragment(browser, bundleSource);
    const rawOutcome = await compileFragment(browser, inputSource);
    const brokenOutcome = await compileFragment(browser, brokenBundleSource);
    if (!bundleOutcome.webglAvailable) {
      throw new Error("No WebGL1 context in headless Chromium; the compile check is blocked, not failed.");
    }
    compile = { bundle: bundleOutcome.compiled, rawInput: rawOutcome.compiled, brokenBundle: brokenOutcome.compiled };
    renderer = bundleOutcome.renderer;
    writeEnvironment({
      chromiumVersion: browser.version(),
      renderer,
      compileLogs: { bundle: bundleOutcome.log, rawInput: rawOutcome.log, brokenBundle: brokenOutcome.log },
    });
  } finally {
    await browser.close();
  }

  const report = buildReport(inputSource, bundleSource, secondBundleSource, compile);
  writeFileSync(new URL("output/report.json", exampleRoot()), `${JSON.stringify(report, null, 2)}\n`);

  const failedChecks = Object.entries(report.checks).filter(([, passed]) => !passed).map(([name]) => name);
  if (failedChecks.length > 0) {
    console.error(`glslify-bundle: predeclared checks failed: ${failedChecks.join(", ")}`);
    process.exitCode = 1;
  }
}

// === BUILDING THE REPORT ===

function buildReport(
  inputSource: string,
  bundleSource: string,
  secondBundleSource: string,
  compile: Report["compile"],
): Report {
  const pins = readPins();
  const inputPragmaImports = countOccurrences(inputSource, PRAGMA_IMPORT);
  const bundlePragmaImports = countOccurrences(bundleSource, PRAGMA_IMPORT);
  const requireCalls = countOccurrences(bundleSource, "require(");
  const definesFunction = bundleSource.includes(FUNCTION_DEFINITION);
  return {
    pins,
    input: { pragmaImports: inputPragmaImports },
    bundle: {
      sha256: createHash("sha256").update(bundleSource).digest("hex"),
      bytes: Buffer.byteLength(bundleSource),
      lines: bundleSource.split("\n").length,
      pragmaImports: bundlePragmaImports,
      requireCalls,
      definesFunction,
    },
    compile,
    checks: {
      inputHasOneImport: inputPragmaImports === 1,
      bundleLargerThanInput: bundleSource.length > inputSource.length,
      bundleDefinesFunction: definesFunction,
      noPragmaImportsRemain: bundlePragmaImports === 0,
      noRequireCallsRemain: requireCalls === 0,
      bundlesByteIdentical: bundleSource === secondBundleSource,
      bundleCompiles: compile.bundle,
      rawInputRejected: !compile.rawInput,
      brokenBundleRejected: !compile.brokenBundle,
    },
  };
}

// === BROWSER COMPILE PROBE ===

async function launchChromium(): Promise<PlaywrightBrowser> {
  const playwright = loadPlaywrightFromCapturePackage();
  return playwright.chromium.launch({ headless: true });
}

async function compileFragment(browser: PlaywrightBrowser, fragmentSource: string): Promise<CompileOutcome> {
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  return page.evaluate<CompileOutcome>(buildCompileExpression(fragmentSource));
}

function buildCompileExpression(fragmentSource: string): string {
  return `(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (gl === null) return { webglAvailable: false, compiled: false, log: "getContext('webgl') returned null", renderer: "" };
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return { compiled: gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true, log: gl.getShaderInfoLog(shader) || "" };
    };
    const vertex = compile(gl.VERTEX_SHADER, ${JSON.stringify(VERTEX_SHADER)});
    const fragment = compile(gl.FRAGMENT_SHADER, ${JSON.stringify(fragmentSource)});
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return { webglAvailable: true, compiled: vertex.compiled && fragment.compiled, log: fragment.log || vertex.log, renderer: String(renderer) };
  })()`;
}

// === HELPERS ===

function exampleRoot(): URL {
  return new URL(".", import.meta.url);
}

function readText(relativePath: string): string {
  return readFileSync(new URL(relativePath, exampleRoot()), "utf8");
}

function readPins(): Report["pins"] {
  const manifest = JSON.parse(readText("package.json")) as { dependencies: Record<string, string> };
  return { glslify: pinFor(manifest.dependencies, "glslify"), "glsl-easings": pinFor(manifest.dependencies, "glsl-easings") };
}

function pinFor(dependencies: Record<string, string>, name: string): string {
  const version = dependencies[name];
  if (version === undefined) {
    throw new Error(`package.json has no dependency "${name}"; add it at an exact version.`);
  }
  return version;
}

function loadPlaywrightFromCapturePackage(): PlaywrightModule {
  const capturePackageManifest = createRequire(new URL("../../packages/capture/package.json", import.meta.url));
  return capturePackageManifest("playwright") as PlaywrightModule;
}

function breakColourLine(bundleSource: string): string {
  if (!bundleSource.includes(OUTPUT_COLOUR_LINE)) {
    throw new Error(`Bundle has no line "${OUTPUT_COLOUR_LINE}" to break; the input shader may have changed.`);
  }
  return bundleSource.replace(OUTPUT_COLOUR_LINE, OUTPUT_COLOUR_LINE.slice(0, -1));
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

interface EnvironmentDetails {
  readonly chromiumVersion: string;
  readonly renderer: string;
  readonly compileLogs: Record<"bundle" | "rawInput" | "brokenBundle", string>;
}

function writeEnvironment(details: EnvironmentDetails): void {
  const environment = {
    chromium: details.chromiumVersion,
    renderer: details.renderer,
    compileLogs: details.compileLogs,
    node: process.version,
    hostname: hostname(),
  };
  writeFileSync(new URL("output/environment.json", exampleRoot()), `${JSON.stringify(environment, null, 2)}\n`);
}

await main();
