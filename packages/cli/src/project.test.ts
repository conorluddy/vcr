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

  test("reads installed versions and reports missing packages as null", () => {
    expect(projectPackageVersions(project({ gsap: "3.15.0" }), ["gsap", "three"])).toEqual([{ name: "gsap", version: "3.15.0" }, { name: "three", version: null }]);
  });
  test("same version as the evidence", () => {
    const packages = projectPackageVersions(project({ gsap: "3.15.0" }), ["gsap"]);
    expect(formatProjectReadiness(packages, "pnpm add gsap", { version: "3.15.0" })).toBe("this project: has gsap 3.15.0; same version as evidence");
  });
  test("a different version is untested, never verified", () => {
    const packages = projectPackageVersions(project({ gsap: "3.16.0" }), ["gsap"]);
    expect(formatProjectReadiness(packages, "pnpm add gsap", { version: "3.15.0" })).toBe("this project: has gsap 3.16.0; evidence ran 3.15.0, so this version is untested");
  });
  test("matches a version inside free-text evidence", () => {
    const packages = projectPackageVersions(project({ playwright: "1.64.1" }), ["playwright"]);
    expect(formatProjectReadiness(packages, "pnpm add -D playwright", { version: "1.64.1, Chrome for Testing 153.0.8010.12 headless shell" })).toBe("this project: has playwright 1.64.1; same version as evidence");
  });
  test("names the install command when nothing is installed, and lists partial installs", () => {
    const root = project({ mediabunny: "1.0.0" });
    expect(formatProjectReadiness(projectPackageVersions(root, ["d3"]), "pnpm add d3", undefined)).toBe("this project: not installed (pnpm add d3)");
    expect(formatProjectReadiness(projectPackageVersions(root, ["mediabunny", "@mediabunny/server"]), "pnpm add mediabunny @mediabunny/server", undefined)).toBe("this project: has mediabunny 1.0.0; missing @mediabunny/server");
  });
});
