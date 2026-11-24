"""Check two pymunk simulation outputs against the predeclared rules in README.md.

Usage: check.py PRIMARY_JSON RERUN_JSON
Prints JSON to stdout and exits 1 when any gating check fails.
"""
import json
import math
import sys
from pathlib import Path

from generate import SEEK_ORDER, STATE_STEPS
from scene import STEP_SECONDS, TOTAL_STEPS

BALL_NAME = "ball"
BALL_REST_X_RANGE_PX = (-260.0, -240.0)
BALL_REST_Y_RANGE_PX = (11.5, 12.5)
BALL_REST_SPEED_MAX_PX_PER_S = 1.0
BODY_FALL_MIN_PX = 50.0
MIN_DISTINCT_TRACE_HASHES = 2


# === PUBLIC API ===

def main(argv: list[str]) -> int:
    if len(argv) != 3:
        sys.exit("usage: check.py PRIMARY_JSON RERUN_JSON")
    primary = json.loads(Path(argv[1]).read_text())
    rerun = json.loads(Path(argv[2]).read_text())
    result = evaluate(primary, rerun)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["all_passed"] else 1


# === HELPERS ===

def evaluate(primary: dict, rerun: dict) -> dict:
    final_bodies = primary["states"][str(TOTAL_STEPS)]["bodies"]
    initial_bodies = primary["states"]["0"]["bodies"]
    ball = final_bodies[BALL_NAME]
    ball_speed = math.hypot(ball["vx"], ball["vy"])
    trace = primary["trace_sha256"]
    seek_fresh = primary["seek_fresh_process_matches_trace"]
    seek_in_process = primary["seek_in_process_matches_trace"]
    checks = {
        "reruns_identical": primary == rerun,
        "fixed_step_is_one_sixtieth": primary["scene"]["step_seconds"] == STEP_SECONDS,
        "trace_covers_declared_steps": len(trace) == TOTAL_STEPS + 1,
        "recorded_steps_as_declared": sorted(int(key) for key in primary["states"]) == sorted(STATE_STEPS),
        "seek_fresh_process_matches_trace": set(seek_fresh) == {str(s) for s in SEEK_ORDER}
        and all(seek_fresh.values()),
        "seek_order_is_shuffled": list(SEEK_ORDER) != sorted(SEEK_ORDER)
        and sorted(SEEK_ORDER) == sorted(STATE_STEPS),
        "distinct_trace_hashes": len(set(trace)) >= MIN_DISTINCT_TRACE_HASHES,
        "bodies_fell_to_floor": all(
            initial_bodies[name]["y"] - final_bodies[name]["y"] >= BODY_FALL_MIN_PX
            for name in final_bodies
        ),
        "ball_rest_region": BALL_REST_X_RANGE_PX[0] <= ball["x"] <= BALL_REST_X_RANGE_PX[1]
        and BALL_REST_Y_RANGE_PX[0] <= ball["y"] <= BALL_REST_Y_RANGE_PX[1]
        and ball_speed <= BALL_REST_SPEED_MAX_PX_PER_S,
    }
    measurements = {
        "ball_final_x_px": ball["x"],
        "ball_final_y_px": ball["y"],
        "ball_final_speed_px_per_s": round(ball_speed, 6),
        "distinct_trace_hashes": len(set(trace)),
        "seek_in_process_matching_steps": sorted(int(key) for key, matched in seek_in_process.items() if matched),
        "seek_in_process_total": len(seek_in_process),
        "fall_px_by_body": {
            name: round(initial_bodies[name]["y"] - final_bodies[name]["y"], 6) for name in final_bodies
        },
    }
    return {"checks": checks, "measurements": measurements, "all_passed": all(checks.values())}


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
