"""Checks two ComfyUI runs of workflow.json against the predeclared fixture values; prints checks JSON.

Usage: check.py <results-dir> <listen-report-path> <port> <input-png-path>
Exit 1 if any gating check fails. Byte identity of the resubmission is reported but not gating,
so a non-identical rerun is recorded as a partial result rather than hidden.
"""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

from fixture import (
    OUTPUT_HEIGHT_PX,
    OUTPUT_WIDTH_PX,
    PIXEL_TOLERANCE,
    PROBE_POINTS_OUTPUT,
    predicted_output_rgb_at_probes,
)

RUN_LABELS = ("run-a", "run-b")


def sha256_hex(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def probe_rgb(image: Image.Image) -> dict[str, list[int]]:
    rgb_image = image.convert("RGB")
    return {name: list(rgb_image.getpixel(point)) for name, point in PROBE_POINTS_OUTPUT.items()}


def probes_within_tolerance(measured: dict[str, list[int]]) -> bool:
    predicted = predicted_output_rgb_at_probes()
    return all(
        abs(measured[name][channel] - predicted[name][channel]) <= PIXEL_TOLERANCE
        for name in PROBE_POINTS_OUTPUT
        for channel in range(3)
    )


def listener_report_is_loopback_only(report_text: str, port: int) -> bool:
    listen_lines = [line for line in report_text.splitlines() if "(LISTEN)" in line]
    return bool(listen_lines) and all(f"127.0.0.1:{port} (LISTEN)" in line for line in listen_lines)


def main(argv: list[str]) -> int:
    if len(argv) != 5:
        print("usage: check.py <results-dir> <listen-report-path> <port> <input-png-path>", file=sys.stderr)
        return 2
    results_dir, listen_report_path, port, input_path = Path(argv[1]), Path(argv[2]), int(argv[3]), Path(argv[4])
    summaries = {label: json.loads((results_dir / f"{label}.json").read_text()) for label in RUN_LABELS}
    output_paths = {label: results_dir / f"{label}.png" for label in RUN_LABELS}
    images = {label: Image.open(path) for label, path in output_paths.items()}
    probes = {label: probe_rgb(image) for label, image in images.items()}

    checks = {
        "output_is_rgb_png_at_predeclared_size": all(
            image.format == "PNG" and image.mode == "RGB" and image.size == (OUTPUT_WIDTH_PX, OUTPUT_HEIGHT_PX)
            for image in images.values()
        ),
        "one_still_per_run_in_history": all(summary["history_image_count"] == 1 for summary in summaries.values()),
        "history_entry_completed_success": all(
            summary["completed"] and summary["status_str"] == "success" for summary in summaries.values()
        ),
        "no_node_served_from_cache_each_run": all(
            summary["cached_node_ids"] == [] and "execution_success" in summary["message_events"]
            for summary in summaries.values()
        ),
        "pixel_probes_within_tolerance": all(probes_within_tolerance(probes[label]) for label in RUN_LABELS),
        "server_listened_on_loopback_only": listener_report_is_loopback_only(listen_report_path.read_text(), port),
        "resubmission_byte_identical": sha256_hex(output_paths["run-a"]) == sha256_hex(output_paths["run-b"]),
    }
    measurements = {
        "input_sha256": sha256_hex(input_path),
        "input_size": list(Image.open(input_path).size),
        "output_size": list(images["run-a"].size),
        "run_a_sha256": sha256_hex(output_paths["run-a"]),
        "run_b_sha256": sha256_hex(output_paths["run-b"]),
        "run_a_probe_rgb": probes["run-a"],
        "run_b_probe_rgb": probes["run-b"],
        "predicted_probe_rgb": {name: [round(value, 2) for value in rgb] for name, rgb in predicted_output_rgb_at_probes().items()},
        "run_a_message_events": summaries["run-a"]["message_events"],
        "run_b_message_events": summaries["run-b"]["message_events"],
        "run_b_cached_node_ids": summaries["run-b"]["cached_node_ids"],
    }
    tolerances = {"pixel_tolerance_per_channel": PIXEL_TOLERANCE, "output_size": [OUTPUT_WIDTH_PX, OUTPUT_HEIGHT_PX]}
    print(json.dumps({"checks": checks, "measurements": measurements, "tolerances": tolerances}, indent=2, sort_keys=True))
    gating_checks_pass = all(value for name, value in checks.items() if name != "resubmission_byte_identical")
    return 0 if gating_checks_pass else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
