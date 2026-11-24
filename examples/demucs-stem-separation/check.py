# === PUBLIC API ===
# Computes the predeclared checks C1 to C5 for the demucs fixture.
# Usage: check.py <output-dir>. Reads input.wav, truth/*.npy, sep1/ and sep2/.
# Writes checks.json (gated booleans and integers only; diffed against expected/) and
# metrics.json (floats and hashes; informational).

import hashlib
import json
import sys
from pathlib import Path

import numpy as np

from audio_io import probe_rate_and_channels, read_float32_stereo

EXPECTED_RATE_HZ = 44100
EXPECTED_CHANNELS = 2
TRUE_SOURCES = ["drums", "bass", "vocals"]
ALL_STEMS = ["drums", "bass", "other", "vocals"]
CORRELATION_MARGIN = 0.10
SDR_FLOOR_DB = {"drums": 4.0, "bass": 4.0, "vocals": 2.0}
SUM_SNR_FLOOR_DB = 15.0


# === PUBLIC API ===

def main(output_dir: Path) -> None:
    input_stereo = read_float32_stereo(output_dir / "input.wav")
    input_rate, input_channels = probe_rate_and_channels(output_dir / "input.wav")
    sample_count = input_stereo.shape[1]
    truths = {name: np.load(output_dir / "truth" / f"{name}.npy") for name in TRUE_SOURCES}

    estimates = {
        name: read_float32_stereo(output_dir / "sep1" / "htdemucs" / "input" / f"{name}.wav")
        for name in ALL_STEMS
    }
    format_checks = format_check_results(output_dir / "sep1" / "htdemucs" / "input", sample_count)
    correlation = correlation_matrix(estimates, truths)
    correlation_checks = {
        name: correlation[name][name] - max(correlation[name][other]
                                            for other in TRUE_SOURCES if other != name)
        >= CORRELATION_MARGIN
        for name in TRUE_SOURCES
    }
    sdr = {name: sdr_db(truths[name], estimates[name]) for name in TRUE_SOURCES}
    sdr_checks = {name: sdr[name] >= SDR_FLOOR_DB[name] for name in TRUE_SOURCES}
    sum_snr = residual_snr_db(input_stereo, sum(estimates.values()))
    sum_check = sum_snr >= SUM_SNR_FLOOR_DB

    checks = {
        "input": {"sample_rate_hz": input_rate, "channels": input_channels,
                  "samples": sample_count},
        "C1_format_all_stems": format_checks["all_pass"],
        "C2_correlation_margin": correlation_checks,
        "C3_sdr_floors": sdr_checks,
        "C4_sum_residual_snr": sum_check,
        "all_gated_checks_pass": (format_checks["all_pass"]
                                  and all(correlation_checks.values())
                                  and all(sdr_checks.values())
                                  and sum_check),
    }
    metrics = {
        "C2_correlation": correlation,
        "C3_sdr_db": sdr,
        "C4_sum_residual_snr_db": sum_snr,
        "C5_stem_sha256_identical_across_runs": stem_hashes_match(output_dir),
        "C1_detail": format_checks["detail"],
    }
    (output_dir / "checks.json").write_text(json.dumps(checks, indent=2) + "\n")
    (output_dir / "metrics.json").write_text(json.dumps(metrics, indent=2) + "\n")


# === HELPERS ===

def format_check_results(stem_dir: Path, sample_count: int) -> dict[str, object]:
    detail = {}
    for name in ALL_STEMS:
        rate_hz, channels = probe_rate_and_channels(stem_dir / f"{name}.wav")
        samples = read_float32_stereo(stem_dir / f"{name}.wav").shape[1]
        detail[name] = {"sample_rate_hz": rate_hz, "channels": channels, "samples": samples}
    all_pass = all(
        value["sample_rate_hz"] == EXPECTED_RATE_HZ
        and value["channels"] == EXPECTED_CHANNELS
        and value["samples"] == sample_count
        for value in detail.values()
    )
    return {"all_pass": all_pass, "detail": detail}


def correlation_matrix(estimates: dict[str, np.ndarray],
                       truths: dict[str, np.ndarray]) -> dict[str, dict[str, float]]:
    return {
        estimate_name: {
            truth_name: float(np.corrcoef(estimates[estimate_name].ravel(),
                                          truths[truth_name].ravel())[0, 1])
            for truth_name in TRUE_SOURCES
        }
        for estimate_name in TRUE_SOURCES
    }


def sdr_db(truth: np.ndarray, estimate: np.ndarray) -> float:
    error_energy = float(np.sum((estimate - truth) ** 2))
    return 10.0 * float(np.log10(np.sum(truth ** 2) / error_energy))


def residual_snr_db(mix: np.ndarray, summed_stems: np.ndarray) -> float:
    residual_energy = float(np.sum((mix - summed_stems) ** 2))
    return 10.0 * float(np.log10(np.sum(mix ** 2) / residual_energy))


def stem_hashes_match(output_dir: Path) -> dict[str, object]:
    run_one = output_dir / "sep1" / "htdemucs" / "input"
    run_two = output_dir / "sep2" / "htdemucs" / "input"
    if not run_two.is_dir():
        return {"available": False}
    per_stem = {
        name: sha256(run_one / f"{name}.wav") == sha256(run_two / f"{name}.wav")
        for name in ALL_STEMS
    }
    return {"available": True, "per_stem_identical": per_stem}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: check.py <output-dir>", file=sys.stderr)
        sys.exit(2)
    main(Path(sys.argv[1]))
