import { rmSync } from "node:fs";
import { buildBundle } from "./build/buildBundle";
import { buildDeclarations } from "./build/buildDeclarations";
import { buildPreviews } from "./build/buildPreviews";
import { discoverComponents } from "./build/discoverComponents";
import { PROJECT_ROOT } from "./build/paths";
import { writeSystemFiles } from "./build/writeSystemFiles";

// Builds dist/project/, a mirror of the Design System artifact's files. Prints one JSON event: { data, changes, warnings }.

const startedAtMs = Date.now();
rmSync(PROJECT_ROOT, { recursive: true, force: true });
const components = discoverComponents();
const { bundleBytes, stylesheetBytes } = await buildBundle(components);
const previewCount = await buildPreviews(components);
const declarationFileCount = buildDeclarations(components);
const systemFiles = writeSystemFiles(components, new Date().toISOString());

console.log(
  JSON.stringify({
    data: {
      output: PROJECT_ROOT,
      componentCount: components.length,
      previewCount,
      declarationFileCount,
      bundleBytes,
      stylesheetBytes,
    },
    changes: ["components/bundle.js", "components/bundle.css", "components/index.d.ts", ...systemFiles],
    warnings: [],
    duration_ms: Date.now() - startedAtMs,
  }),
);
