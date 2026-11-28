import { fileURLToPath } from "node:url";

// === PUBLIC API ===

/** Absolute paths the build reads from and writes to. dist/ is ignored by git. */
export const PACKAGE_ROOT = fileURLToPath(new URL("../../", import.meta.url));
export const SOURCE_ROOT = `${PACKAGE_ROOT}src/`;
export const SOURCE_INDEX_PATH = `${SOURCE_ROOT}index.ts`;
export const DIST_ROOT = `${PACKAGE_ROOT}dist/`;
/** Mirrors the artifact: each file here is published at project/<path>. */
export const PROJECT_ROOT = `${DIST_ROOT}project/`;
export const NAMESPACE = "VCRStudio";
