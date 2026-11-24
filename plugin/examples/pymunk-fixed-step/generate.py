"""Simulate the predeclared pymunk scene at a fixed 1/60 s step and write JSON.

Usage:
  generate.py OUTPUT_JSON_PATH          continuous trace, then seeks as fresh processes
  generate.py --resimulate STEP_COUNT   one fresh re-simulation from step 0; prints its state hash

The continuous trace is the first space built in this process, so every Chipmunk shape
hash id a fresh process would assign matches the trace's. Seeks run in fresh processes.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

import pymunk

from scene import BODY_SPECS, STEP_SECONDS, TOTAL_STEPS, build_space

STATE_STEPS = (0, 1, 2, 30, 60, 120, 240, 480, 900)
SEEK_ORDER = (480, 0, 900, 30, 2, 240, 1, 120, 60)
POSITION_DECIMALS = 6

BodyState = dict[str, float]
Snapshot = dict[str, BodyState]


# === PUBLIC API ===

def main(argv: list[str]) -> int:
    if len(argv) == 3 and argv[1] == "--resimulate":
        print(state_sha256(resimulate_from_step_zero(parse_step_count(argv[2]))))
        return 0
    if len(argv) != 2:
        sys.exit("usage: generate.py OUTPUT_JSON_PATH | generate.py --resimulate STEP_COUNT")
    hashes, states = continuous_trace()
    seek_fresh_matches = {
        str(step): resimulate_in_fresh_process(step) == hashes[step] for step in SEEK_ORDER
    }
    seek_in_process_matches = {
        str(step): state_sha256(resimulate_from_step_zero(step)) == hashes[step]
        for step in SEEK_ORDER
    }
    payload = {
        "library": {"pymunk": pymunk.version, "chipmunk": pymunk.chipmunk_version},
        "scene": {
            "step_seconds": STEP_SECONDS,
            "total_steps": TOTAL_STEPS,
            "state_steps": list(STATE_STEPS),
            "seek_order": list(SEEK_ORDER),
            "bodies": [spec.name for spec in BODY_SPECS],
        },
        "trace_sha256": hashes,
        "states": {
            str(step): {"sha256": hashes[step], "bodies": rounded_snapshot(states[step])}
            for step in STATE_STEPS
        },
        "seek_fresh_process_matches_trace": seek_fresh_matches,
        "seek_in_process_matches_trace": seek_in_process_matches,
    }
    Path(argv[1]).write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    return 0


# === HELPERS ===

def parse_step_count(text: str) -> int:
    step_count = int(text)
    if not 0 <= step_count <= TOTAL_STEPS:
        sys.exit(f"STEP_COUNT must be between 0 and {TOTAL_STEPS}, got {step_count}")
    return step_count


def continuous_trace() -> tuple[list[str], dict[int, Snapshot]]:
    space, bodies = build_space()
    hashes: list[str] = []
    states: dict[int, Snapshot] = {}
    for step in range(TOTAL_STEPS + 1):
        if step > 0:
            space.step(STEP_SECONDS)
        snapshot = snapshot_bodies(bodies)
        hashes.append(state_sha256(snapshot))
        if step in STATE_STEPS:
            states[step] = snapshot
    return hashes, states


def resimulate_from_step_zero(step_count: int) -> Snapshot:
    space, bodies = build_space()
    for _ in range(step_count):
        space.step(STEP_SECONDS)
    return snapshot_bodies(bodies)


def resimulate_in_fresh_process(step_count: int) -> str:
    completed = subprocess.run(
        [sys.executable, str(Path(__file__).resolve()), "--resimulate", str(step_count)],
        capture_output=True,
        text=True,
        check=True,
    )
    return completed.stdout.strip()


def snapshot_bodies(bodies: dict[str, pymunk.Body]) -> Snapshot:
    return {
        name: {
            "x": body.position.x,
            "y": body.position.y,
            "angle": body.angle,
            "vx": body.velocity.x,
            "vy": body.velocity.y,
            "angular_velocity": body.angular_velocity,
        }
        for name, body in bodies.items()
    }


def rounded_snapshot(snapshot: Snapshot) -> Snapshot:
    return {
        name: {key: round(value, POSITION_DECIMALS) for key, value in state.items()}
        for name, state in snapshot.items()
    }


def state_sha256(snapshot: Snapshot) -> str:
    serialised = json.dumps(snapshot, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(serialised.encode("utf-8")).hexdigest()


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
