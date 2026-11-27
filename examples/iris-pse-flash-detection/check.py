"""Run IRIS on generated clips and print deterministic JSON.

Predeclared checks: flash-5hz must fail; slow-1hz and static-grey must pass.
"""
import contextlib
import json
import sys
import os
from importlib.metadata import version

from iris_pse_detection import Configuration, VideoAnalyser

assert version("iris-pse-detection") == "1.1.2", "pinned version mismatch"
os.chdir("output")  # IRIS writes a Results/ CSV beside the cwd
EXPECT_FAIL = {"flash-5hz": True, "slow-1hz": False, "static-grey": False}
clips = {}
for name, should_fail in EXPECT_FAIL.items():
    with contextlib.redirect_stdout(sys.stderr):  # the library prints timings
        result = VideoAnalyser(Configuration()).analyse_video(f"clips/{name}.mp4")
    overall = result.overall_result.name
    clips[name] = {
        "overall_result": overall,
        "total_frames": result.total_frames,
        "luminance_flash_fail_frames": result.total_luminance_incidents.flash_fail_frames,
        "red_total_failed_frames": result.total_red_incidents.total_failed_frames,
        "expected_fail": should_fail,
        "check_passed": ("Fail" in overall) == should_fail,
    }
print(json.dumps({"clips": clips, "all_passed": all(c["check_passed"] for c in clips.values())}, indent=2, sort_keys=True))
