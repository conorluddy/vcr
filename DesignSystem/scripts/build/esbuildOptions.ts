import type { BuildOptions } from "esbuild";

// === PUBLIC API ===

/** Evergreen targets: every one supports CSS nesting, so esbuild keeps it native instead of flattening it. */
export const EVERGREEN_TARGETS = ["chrome130", "edge130", "firefox147", "safari18.2"];

export const SHARED_BUILD_OPTIONS: BuildOptions = {
  bundle: true,
  format: "iife",
  target: EVERGREEN_TARGETS,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "none",
  charset: "utf8",
  logLevel: "warning",
};

/** Consumers inline bundle.js and previews in <script>, so these sequences would end or escape the element. */
export function assertInlineSafe(fileName: string, contents: string): void {
  const unsafe = ["</script", "<!--"].find((sequence) => contents.toLowerCase().includes(sequence));
  if (unsafe) {
    throw new Error(
      `${fileName} contains "${unsafe}", which breaks inlining in a <script>; find the source string and split it.`,
    );
  }
}
