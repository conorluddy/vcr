"""pyseq frame-gap detection on generated, empty frame files. Prints JSON; checks are predeclared in README.md."""
import json
import shutil
import subprocess
import sys
from pathlib import Path

import pyseq

root = Path("output/frames")
shutil.rmtree(root, ignore_errors=True)


def touch(folder, name_format, numbers):
    (root / folder).mkdir(parents=True, exist_ok=True)
    for number in numbers:
        (root / folder / (name_format % number)).touch()


touch("gap", "frame.%04d.png", [1, 2, 3, 6, 7, 10])
touch("complete", "clean.%04d.png", range(1, 6))
touch("offset", "shot.%04d.exr", [1001, 1002, 1004, 1005])
touch("two", "a.%04d.png", [1, 2, 3])
touch("two", "b.%04d.png", [1, 3])
(root / "two" / "notes.txt").touch()
touch("mixed", "pad.%03d.png", [1, 2])
touch("mixed", "pad.%04d.png", [100])


def sequences(folder):
    return {s.format("%h%p%t"): s for s in pyseq.get_sequences(str(root / folder))}


checks = {}


def check(name, passed, observed):
    checks[name] = {"passed": bool(passed), "observed": observed}


gap = sequences("gap")["frame.%04d.png"]
check("gap_missing_frames", gap.missing() == [4, 5, 8, 9], gap.missing())
check("gap_range_string", gap.format("%R") == "[1-3, 6-7, 10]" and gap.length() == 6, [gap.format("%R"), gap.length()])
clean = sequences("complete")["clean.%04d.png"]
check("complete_has_no_gaps", clean.missing() == [] and (clean.start(), clean.end(), clean.length()) == (1, 5, 5), [clean.start(), clean.end(), clean.length(), clean.missing()])
offset = sequences("offset")["shot.%d.exr"]
check("offset_start_gap", (offset.start(), offset.end(), offset.missing()) == (1001, 1005, [1003]), [offset.start(), offset.end(), offset.missing()])
two = sequences("two")
check("two_sequences_split_and_text_ignored", sorted(two) == ["a.%04d.png", "b.%04d.png"] and two["b.%04d.png"].missing() == [2], {k: v.format("%R") for k, v in sorted(two.items())})
lss = subprocess.run([str(Path(sys.executable).parent / "lss"), str(root / "gap")], capture_output=True, text=True, check=True).stdout.strip()
check("cli_lss_line", lss.split() == ["6", "frame.%04d.png", "[1-3,", "6-7,", "10]"], lss)
mixed = sequences("mixed")
reported_missing = sum(len(s.missing()) for s in mixed.values())
check("mixed_padding_reports_no_false_gaps", reported_missing == 0, {k: [s.format("%R")[:40], len(s.missing())] for k, s in sorted(mixed.items())})

result = {
    "pyseq_version": pyseq.__version__,
    "checks": checks,
    "failed": [n for n, c in checks.items() if not c["passed"]],
}
result["all_passed"] = not result["failed"]
print(json.dumps(result, indent=2, sort_keys=True))
