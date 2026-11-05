import { describe, expect, test } from "vitest";
import { README_TOC_MARKERS, spliceReadmeToc } from "./catalog.js";

const { start, end } = README_TOC_MARKERS;

describe("spliceReadmeToc", () => {
  test("replaces only the marked block and is idempotent", () => {
    const readme = `# Title\n\nProse stays.\n\n${start}\nold list\n${end}\n\nTrailing prose stays.\n`;
    const once = spliceReadmeToc(readme, "## Tool catalogue\n\n- new");
    expect(once.ok && once.value).toBe(`# Title\n\nProse stays.\n\n${start}\n## Tool catalogue\n\n- new\n${end}\n\nTrailing prose stays.\n`);
    const twice = once.ok ? spliceReadmeToc(once.value, "## Tool catalogue\n\n- new") : once;
    expect(twice).toEqual(once);
  });

  test.each([["no markers", "# Title\n"], ["markers out of order", `${end}\n${start}\n`]])("%s is an actionable error", (_label, readme) => {
    const outcome = spliceReadmeToc(readme, "toc");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.error.code).toBe("README_TOC_MARKERS_MISSING");
  });
});
