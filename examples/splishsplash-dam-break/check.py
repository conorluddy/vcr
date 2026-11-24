"""Gate the predeclared checks for the dam-break run.

Usage: check.py RUN.json RERUN.json SEEK_DIR
Prints checks.json-style JSON to stdout; exits 1 if any gating check is false.
Thresholds are predeclared in README.md and must not be tuned after a result.
"""
import glob
import json
import os
import sys

from generate import FRAME_STEPS, LAST_STEP, TIME_STEP_SECONDS

FIRST_STEP = FRAME_STEPS[0]

PARTICLE_RADIUS_METRES = 0.02
BOX_MIN_X, BOX_MAX_X = -1.0, 1.0
BOX_MIN_Y, BOX_MAX_Y = 0.0, 2.0
MIN_PARTICLE_COUNT, MAX_PARTICLE_COUNT = 200, 400
MIN_COM_DROP_METRES = 0.10
MIN_WIDTH_GAIN_METRES = 0.20
MIN_COM_RIGHT_SHIFT_METRES = 0.05
MAX_ABS_Z_METRES = 1e-9
MAX_TIME_ERROR_SECONDS = 1e-9


def loadJson(path: str) -> dict:
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def frameSummaries(run: dict) -> dict:
    return {step: run["frames"][str(step)] for step in FRAME_STEPS}


def rerunsIdentical(run: dict, rerun: dict) -> bool:
    return frameSummaries(run) == frameSummaries(rerun) and run["trace"] == rerun["trace"]


def timeStepIsFixed(run: dict) -> bool:
    return run["stepSeconds"] == TIME_STEP_SECONDS and run["stepsRun"] == LAST_STEP


def framesAsDeclared(run: dict) -> bool:
    if run["frameSteps"] != FRAME_STEPS:
        return False
    for step in FRAME_STEPS:
        frame = run["frames"][str(step)]
        if abs(frame["timeSeconds"] - step * TIME_STEP_SECONDS) > MAX_TIME_ERROR_SECONDS:
            return False
    return True


def particleCountConserved(run: dict) -> bool:
    counts = {run["frames"][str(step)]["particleCount"] for step in FRAME_STEPS}
    startCount = run["frames"][str(FIRST_STEP)]["particleCount"]
    return len(counts) == 1 and MIN_PARTICLE_COUNT <= startCount <= MAX_PARTICLE_COUNT


def allParticlesInsideBox(run: dict) -> bool:
    tolerance = PARTICLE_RADIUS_METRES
    for step in FRAME_STEPS:
        frame = run["frames"][str(step)]
        if frame["minX"] < BOX_MIN_X - tolerance or frame["maxX"] > BOX_MAX_X + tolerance:
            return False
        if frame["minY"] < BOX_MIN_Y - tolerance or frame["maxY"] > BOX_MAX_Y + tolerance:
            return False
    return True


def twoDimensional(run: dict) -> bool:
    return all(run["frames"][str(step)]["maxAbsZ"] <= MAX_ABS_Z_METRES for step in FRAME_STEPS)


def fluidDropsAndSpreads(run: dict) -> bool:
    start = run["frames"][str(FIRST_STEP)]
    end = run["frames"][str(LAST_STEP)]
    droppedEnough = end["centreOfMassY"] < start["centreOfMassY"] - MIN_COM_DROP_METRES
    spreadEnough = end["widthX"] > start["widthX"] + MIN_WIDTH_GAIN_METRES
    return droppedEnough and spreadEnough


def centreOfMassMovesRight(run: dict) -> bool:
    start = run["frames"][str(FIRST_STEP)]
    end = run["frames"][str(LAST_STEP)]
    return end["centreOfMassX"] > start["centreOfMassX"] + MIN_COM_RIGHT_SHIFT_METRES


def seekOrderIsShuffled(seekSteps: list[int]) -> bool:
    return seekSteps != sorted(seekSteps) and sorted(seekSteps) == sorted(FRAME_STEPS)


def seekMatchesTrace(run: dict, seeks: dict[int, dict]) -> bool:
    if sorted(seeks) != sorted(FRAME_STEPS):
        return False
    return all(seeks[step]["hash"] == run["trace"][str(step)] for step in FRAME_STEPS)


def distinctHashes(run: dict) -> int:
    return len({run["trace"][str(step)] for step in FRAME_STEPS})


def loadSeeks(seekDirectory: str) -> tuple[list[int], dict[int, dict]]:
    # File names are seek-<zero-padded run index>-<step>.json, so name order is run order.
    seekFiles = sorted(glob.glob(os.path.join(seekDirectory, "seek-*.json")))
    seeks = {}
    order = []
    for seekFile in seekFiles:
        seek = loadJson(seekFile)
        order.append(seek["seekStep"])
        seeks[seek["seekStep"]] = seek
    return order, seeks


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print(__doc__, file=sys.stderr)
        return 2
    run = loadJson(argv[1])
    rerun = loadJson(argv[2])
    seekOrder, seeks = loadSeeks(argv[3])
    checks = {
        "reruns_identical": rerunsIdentical(run, rerun),
        "fixed_step_is_two_milliseconds": timeStepIsFixed(run),
        "frames_as_declared": framesAsDeclared(run),
        "particle_count_conserved": particleCountConserved(run),
        "particles_inside_box": allParticlesInsideBox(run),
        "two_dimensional_positions": twoDimensional(run),
        "fluid_drops_and_spreads": fluidDropsAndSpreads(run),
        "centre_of_mass_moves_right": centreOfMassMovesRight(run),
        "seek_order_is_shuffled": seekOrderIsShuffled(seekOrder),
        "seek_fresh_process_matches_trace": seekMatchesTrace(run, seeks),
        "distinct_frame_hashes": distinctHashes(run) >= 2,
    }
    start = run["frames"][str(FIRST_STEP)]
    end = run["frames"][str(LAST_STEP)]
    result = {
        "all_passed": all(checks.values()),
        "checks": checks,
        "measurements": {
            "particle_count": start["particleCount"],
            "com_y_start_end_m": [round(start["centreOfMassY"], 6), round(end["centreOfMassY"], 6)],
            "com_x_start_end_m": [round(start["centreOfMassX"], 6), round(end["centreOfMassX"], 6)],
            "width_x_start_end_m": [round(start["widthX"], 6), round(end["widthX"], 6)],
            "max_abs_z_m": max(run["frames"][str(step)]["maxAbsZ"] for step in FRAME_STEPS),
            "distinct_frame_hashes": distinctHashes(run),
            "seek_order": seekOrder,
            "steps_run": run["stepsRun"],
        },
    }
    result["summary"] = {
        "library": run["library"],
        "frames": {str(step): withoutPositions(run["frames"][str(step)]) for step in FRAME_STEPS},
        "seekHashes": {str(step): seeks[step]["hash"] for step in sorted(seeks)},
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["all_passed"] else 1


def withoutPositions(frame: dict) -> dict:
    return {key: value for key, value in frame.items() if key != "positions"}


if __name__ == "__main__":
    sys.exit(main(sys.argv))
