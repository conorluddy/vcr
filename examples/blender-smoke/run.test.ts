import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";

const directories: string[] = [];
afterEach(() => { for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true }); });

test.each([1, 0])("a render that exits %i without producing an image cannot reuse stale output", (renderExit) => {
  const root = mkdtempSync(join(tmpdir(), "vcr-blender-test-"));
  directories.push(root);
  cpSync(new URL("./run.sh", import.meta.url), join(root, "run.sh"));
  mkdirSync(join(root, "output"));
  mkdirSync(join(root, "expected"));
  writeFileSync(join(root, "output/cube.png"), "stale image");
  writeFileSync(join(root, "expected/identify.txt"), "320 240 srgba\n");
  const blender = join(root, "blender");
  writeFileSync(blender, `#!/bin/sh\nif [ "$1" = "--version" ]; then echo 'Blender test'; exit 0; fi\necho 'Error: no new image'\nexit ${renderExit}\n`, { mode: 0o755 });
  writeFileSync(join(root, "magick"), '#!/bin/sh\n[ -f output/cube.png ] || exit 1\necho "320 240 srgba"\n', { mode: 0o755 });
  expect(() => execFileSync("bash", ["run.sh"], { cwd: root, env: { ...process.env, BLENDER: blender, PATH: `${root}:${process.env.PATH}` }, stdio: "pipe" })).toThrow();
  expect(existsSync(join(root, "output/cube.png"))).toBe(false);
});
