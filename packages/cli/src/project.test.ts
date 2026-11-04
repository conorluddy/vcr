import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { formatProjectReadiness, npmPackagesFor, projectPackageVersions } from "./project.js";

describe("npmPackagesFor", () => {
  test.each([
    ["pnpm add gsap", ["gsap"]],
    ["pnpm add -D playwright && npx playwright install chromium", ["playwright"]],
    ["pnpm add mediabunny @mediabunny/server", ["mediabunny", "@mediabunny/server"]],
    ["npm install --save-dev three@0.186.1", ["three"]],
    ["npm i @scope/pkg@^1.2.0", ["@scope/pkg"]],
    ["yarn add d3", ["d3"]],
    ["pnpm add -g @gltf-transform/cli", []],
    ["npm i -g editly", []],
    ["pnpm dlx gltfjsx model.glb", []],
    ["brew install ffmpeg", []],
    ["pnpm add ..", []],
    ["pnpm add ./local-pkg", []],
    [undefined, []],
  ])("%s → %j", (command, expected) => {
    expect(npmPackagesFor(command)).toEqual(expected);
  });
});

describe("project readiness", () => {
  function project(packages: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), "vcr-project-"));
    for (const [name, version] of Object.entries(packages)) {
      mkdirSync(join(root, "node_modules", name), { recursive: true });
      writeFileSync(join(root, "node_modules", name, "package.json"), JSON.stringify({ name, version }));
    }
    return root;
  }

  let lastRoot = "";
  const stopAtRoot = (root: string) => (lastRoot = root);

  test("resolves from a project below the workspace root, as Node does", () => {
    const workspace = project({});
    const example = join(workspace, "examples", "g");
    mkdirSync(join(example, "node_modules", "gsap"), { recursive: true });
    writeFileSync(join(example, "package.json"), "{}");
    writeFileSync(join(example, "node_modules", "gsap", "package.json"), JSON.stringify({ version: "3.15.0" }));
    expect(projectPackageVersions(join(example, "src"), ["gsap"], workspace)).toEqual([{ name: "gsap", version: "3.15.0" }]);
    expect(projectPackageVersions(workspace, ["gsap"], workspace)).toEqual([{ name: "gsap", version: null }]);
  });
  test("never looks above the workspace root", () => {
    const outer = project({ gsap: "9.9.9" });
    const workspace = join(outer, "ws");
    mkdirSync(workspace);
    expect(projectPackageVersions(workspace, ["gsap"], workspace)).toEqual([{ name: "gsap", version: null }]);
  });
  test("without a workspace, stops at the nearest package.json", () => {
    const outer = project({ gsap: "9.9.9" });
    const app = join(outer, "app");
    mkdirSync(app);
    writeFileSync(join(app, "package.json"), "{}");
    expect(projectPackageVersions(app, ["gsap"])).toEqual([{ name: "gsap", version: null }]);
  });
  test("reports an unreadable package.json instead of not installed", () => {
    const root = project({});
    mkdirSync(join(root, "node_modules", "gsap"), { recursive: true });
    writeFileSync(join(root, "node_modules", "gsap", "package.json"), "{bad");
    const packages = projectPackageVersions(root, ["gsap"], root);
    expect(formatProjectReadiness(packages, "pnpm add gsap", undefined)).toBe("this project: gsap present but its package.json is unreadable");
  });
  test("reads installed versions and reports missing packages as null", () => {
    expect(projectPackageVersions(stopAtRoot(project({ gsap: "3.15.0" })), ["gsap", "three"], lastRoot)).toEqual([{ name: "gsap", version: "3.15.0" }, { name: "three", version: null }]);
  });
  test("same version as the evidence", () => {
    const packages = projectPackageVersions(stopAtRoot(project({ gsap: "3.15.0" })), ["gsap"], lastRoot);
    expect(formatProjectReadiness(packages, "pnpm add gsap", { version: "3.15.0" })).toBe("this project: has gsap 3.15.0; same version as evidence");
  });
  test("a different version is untested, never verified", () => {
    const packages = projectPackageVersions(stopAtRoot(project({ gsap: "3.16.0" })), ["gsap"], lastRoot);
    expect(formatProjectReadiness(packages, "pnpm add gsap", { version: "3.15.0" })).toBe("this project: has gsap 3.16.0; evidence ran 3.15.0, so this version is untested");
  });
  test("matches a version inside free-text evidence", () => {
    const packages = projectPackageVersions(stopAtRoot(project({ playwright: "1.64.1" })), ["playwright"], lastRoot);
    expect(formatProjectReadiness(packages, "pnpm add -D playwright", { version: "1.64.1, Chrome for Testing 153.0.8010.12 headless shell" })).toBe("this project: has playwright 1.64.1; same version as evidence");
  });
  test("names the install command when nothing is installed, and lists partial installs", () => {
    const root = project({ mediabunny: "1.0.0" });
    expect(formatProjectReadiness(projectPackageVersions(root, ["d3"], root), "pnpm add d3", undefined)).toBe("this project: not installed (pnpm add d3)");
    expect(formatProjectReadiness(projectPackageVersions(root, ["mediabunny", "@mediabunny/server"], root), "pnpm add mediabunny @mediabunny/server", undefined)).toBe("this project: has mediabunny 1.0.0; missing @mediabunny/server");
  });
});
