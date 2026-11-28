import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { ComponentEntry } from "./discoverComponents";
import { DIST_ROOT, NAMESPACE, PACKAGE_ROOT, PROJECT_ROOT } from "./paths";

// === PUBLIC API ===

/**
 * Emits declarations with tsc and folds them into one components/index.d.ts, the file the artifact reads
 * `<Component>Props` from. Names are unique across the package, so relative imports can simply be dropped.
 */
export function buildDeclarations(components: readonly ComponentEntry[]): number {
  const typesDirectory = join(DIST_ROOT, "types");
  rmSync(typesDirectory, { recursive: true, force: true });
  execFileSync(
    join(PACKAGE_ROOT, "node_modules/.bin/tsc"),
    ["-p", join(PACKAGE_ROOT, "tsconfig.declarations.json")],
    {
      stdio: "inherit",
    },
  );
  const declarationFiles = listDeclarationFiles(typesDirectory).filter(
    (path) => !path.endsWith("/index.d.ts") && !path.includes("cssModules"),
  );
  const reactImports = new Set<string>();
  const bodies = declarationFiles.map((path) =>
    stripImports(readFileSync(path, "utf8"), reactImports, relative(typesDirectory, path)),
  );
  const contents = [
    `// ${NAMESPACE} component types, generated from DesignSystem/src. Documentation, not type-checked by the page.`,
    `import type { ${[...reactImports].sort().join(", ")} } from "react";`,
    ...bodies,
    windowDeclaration(components),
    "",
  ].join("\n\n");
  mkdirSync(`${PROJECT_ROOT}components/`, { recursive: true });
  writeFileSync(`${PROJECT_ROOT}components/index.d.ts`, contents);
  return declarationFiles.length;
}

// === PRIVATE HELPERS ===

function listDeclarationFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listDeclarationFiles(path) : entry.name.endsWith(".d.ts") ? [path] : [];
  });
}

function stripImports(declaration: string, reactImports: Set<string>, sourceLabel: string): string {
  const keptLines = declaration.split("\n").filter((line) => {
    const reactImport = /^import (?:type )?\{ (.+) \} from "react";$/.exec(line);
    if (reactImport?.[1]) {
      for (const name of reactImport[1].split(",")) {
        reactImports.add(name.replace(/^type /, "").trim());
      }
      return false;
    }
    return (
      !/^import .* from "\.{1,2}\//.test(line) &&
      !/^export \{\};$/.test(line) &&
      !/^export \{ .* \} from "\.{1,2}\//.test(line)
    );
  });
  return `// --- ${sourceLabel}\n${keptLines.join("\n").trim()}`;
}

function windowDeclaration(components: readonly ComponentEntry[]): string {
  const members = components
    .map((component) => `      ${component.name}: typeof ${component.name};`)
    .join("\n");
  return `declare global {\n  interface Window {\n    ${NAMESPACE}: {\n${members}\n      describePolarity: typeof describePolarity;\n    };\n  }\n}`;
}
