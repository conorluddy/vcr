// Predeclared checks for the scrcpy fixture, reading output/ and expected/capture.json.
// Usage: node check.mjs [--record]  (--record also writes expected/observed.json)
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "output");
const expected = JSON.parse(readFileSync(join(here, "expected", "capture.json"), "utf8"));
const probe = JSON.parse(readFileSync(join(out, "ffprobe.json"), "utf8"));
const video = probe.streams[0];
const durationSeconds = Number(probe.format.duration);
// "Override size" wins over "Physical size" when both are printed.
const sizeLine = [...readFileSync(join(out, "wm-size.txt"), "utf8").matchAll(/(\d+)x(\d+)/g)].at(-1);
const deviceWidth = Number(sizeLine[1]);
const deviceHeight = Number(sizeLine[2]);
const early = join(out, "frame-early.png");
const late = join(out, "frame-late.png");
const earlyDeviation = deviation(early);
const lateDeviation = deviation(late);
const minimumDeviation = expected.minimumNormalisedStandardDeviation;
const recording = expected.recording;

const results = [
  check("C1", "recording is H.264 MP4", { codec: video.codec_name, formats: probe.format.format_name },
    video.codec_name === recording.codec && probe.format.format_name.includes(recording.container)),
  check("C2", "recording size equals adb wm size", { width: video.width, height: video.height, deviceWidth, deviceHeight },
    video.width === deviceWidth && video.height === deviceHeight),
  check("C3", "duration within tolerance of --time-limit=3", { durationSeconds },
    durationSeconds >= recording.minimumDurationSeconds && durationSeconds <= recording.maximumDurationSeconds),
  check("C4", "frames non-blank and differ (live screen; keypress not isolated)",
    { earlyDeviation, lateDeviation, earlyHash: sha256(early), lateHash: sha256(late) },
    earlyDeviation > minimumDeviation && lateDeviation > minimumDeviation && sha256(early) !== sha256(late)),
];
const passedAll = results.every((result) => result.pass);
writeFileSync(join(out, "summary.json"), `${JSON.stringify({ passedAll, results }, null, 2)}\n`);
if (process.argv[2] === "--record") {
  writeFileSync(join(here, "expected", "observed.json"), `${JSON.stringify(Object.fromEntries(results.map((result) => [result.id, result.measured])), null, 2)}\n`);
}
for (const result of results) console.log(`${result.pass ? "PASS" : "FAIL"} ${result.id} ${result.description}: ${JSON.stringify(result.measured)}`);
process.exitCode = passedAll ? 0 : 1;

function check(id, description, measured, pass) { return { id, description, measured, pass: Boolean(pass) }; }
function deviation(file) { return Number(execFileSync("magick", [file, "-format", "%[fx:standard_deviation]", "info:"], { encoding: "utf8" })); }
function sha256(file) { return createHash("sha256").update(readFileSync(file)).digest("hex"); }
