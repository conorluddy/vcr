import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { compileTokensCss } from "../tokens/compileTokensCss";
import { readTokenFile, TOKEN_FILE_PATH } from "../tokens/readTokenFile";
import type { ComponentEntry } from "./discoverComponents";
import { DIST_ROOT, NAMESPACE, PACKAGE_ROOT, PROJECT_ROOT } from "./paths";

// === PUBLIC API ===

/** Copies tokens, the brand book, component guidelines and the cover; writes the index and a local tokens.css. */
export function writeSystemFiles(components: readonly ComponentEntry[], builtAt: string): string[] {
  mkdirSync(`${PROJECT_ROOT}components/Cover/`, { recursive: true });
  copyFileSync(TOKEN_FILE_PATH, `${PROJECT_ROOT}tokens.json`);
  copyFileSync(`${PACKAGE_ROOT}docs/README.md`, `${PROJECT_ROOT}README.md`);
  copyFileSync(`${PACKAGE_ROOT}docs/cover.html`, `${PROJECT_ROOT}components/Cover/preview.html`);
  for (const component of components) {
    mkdirSync(`${PROJECT_ROOT}components/${component.name}/`, { recursive: true });
    copyFileSync(component.readmePath, `${PROJECT_ROOT}components/${component.name}/README.md`);
  }
  writeFileSync(`${PROJECT_ROOT}design-system.json`, `${JSON.stringify(systemIndex(builtAt), null, 2)}\n`);
  // Never published: the page generates its own tokens.css. This copy serves local previews and other consumers.
  writeFileSync(`${DIST_ROOT}tokens.css`, compileTokensCss(readTokenFile()));
  return ["tokens.json", "README.md", "components/Cover/preview.html", "design-system.json"];
}

// === PRIVATE HELPERS ===

function systemIndex(builtAt: string) {
  return {
    v: 3,
    layout: "files",
    createdOnFiles: { v: 1, at: builtAt },
    title: NAMESPACE,
    namespace: NAMESPACE,
    libraries: [
      { name: "react", version: "18" },
      { name: "react-dom", version: "18" },
    ],
    sections: {},
    groups: [],
    assetGroups: {},
    blobs: {},
    docs: { readme: "project/README.md", sections: [] },
    lastChange: {
      by: "Conor Luddy",
      at: builtAt,
      via: "GitHub · conorluddy/vcr · DesignSystem",
      note: "Built from DesignSystem/ by pnpm build.",
    },
  };
}
