"""Predeclared checks. usage: check.py RUN1.json RUN2.json  (prints JSON; exit 1 on any failed gate)."""
import json
import math
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FRAMES = 600
SEEK_ORDER = [300, 0, 600, 60, 1, 450, 120, 2, 200]  # shuffled on purpose
RADIUS = 0.05
SPHERE_CENTRE_Y, SPHERE_RADIUS = 1.0, 0.5

first = json.load(open(sys.argv[1]))
second = json.load(open(sys.argv[2]))
positions = first["final_positions"]


def fresh_process_hash(frame):
    out = subprocess.run([sys.executable, os.path.join(HERE, "sim.py"), "seek", str(frame)],
                         capture_output=True, text=True, check=True).stdout
    return out.strip().splitlines()[-1]


seeks = {str(f): fresh_process_hash(f) for f in SEEK_ORDER}
distance_from_sphere = [math.dist(p, (0.0, SPHERE_CENTRE_Y, 0.0)) for p in positions]

gates = {
    "reruns_identical": first == second,
    "trace_has_601_hashes": len(first["hashes"]) == FRAMES + 1,
    "seek_fresh_process_matches_trace": all(seeks[str(f)] == first["hashes"][f] for f in SEEK_ORDER),
    "seek_order_is_shuffled": SEEK_ORDER != sorted(SEEK_ORDER),
    "distinct_hashes_over_100": len(set(first["hashes"])) > 100,
    "all_finite": all(math.isfinite(c) for p in positions for c in p),
    "none_below_ground": all(p[1] >= RADIUS - 1e-4 for p in positions),
    "none_inside_sphere": all(d >= SPHERE_RADIUS + RADIUS - 1e-3 for d in distance_from_sphere),
    "settled_max_speed_under_0.05": first["final_max_speed"] < 0.05,
}
atomic = first["atomic_speed_sums"]
report = {
    "gates": gates,
    "all_passed": all(gates.values()),
    "measured": {
        "warp": first["warp"],
        "final_max_speed": first["final_max_speed"],
        "min_distance_from_sphere_centre": round(min(distance_from_sphere), 4),
        "seek_hashes": seeks,
        "atomic_speed_sums_identical_in_process": len(set(atomic)) == 1,
        "atomic_speed_sum": round(atomic[0], 6),
    },
}
print(json.dumps(report, indent=2))
sys.exit(0 if report["all_passed"] else 1)
