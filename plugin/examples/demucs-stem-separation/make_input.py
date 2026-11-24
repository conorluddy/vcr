# === PUBLIC API ===
# Builds the ten-second synthetic mix and the ground-truth stems it is made of.
# Usage: make_input.py <output-dir>; the vocals source is <output-dir>/vocals.wav (from say).
# Writes input.wav, truth/{drums,bass,vocals}.npy and make_input.json.

import json
import sys
from pathlib import Path

import numpy as np

from audio_io import read_float32_stereo, write_float32_wav

SAMPLE_RATE_HZ = 44100
DURATION_S = 10
SAMPLE_COUNT = SAMPLE_RATE_HZ * DURATION_S
BEAT_PERIOD_S = 0.5
BASS_NOTE_HZ = [55.0, 65.4, 73.4, 82.4]
SOURCE_GAINS = {"drums": 0.8, "bass": 0.6, "vocals": 0.5}
CLIP_LIMIT = 1.0
CLIP_SCALE = 0.7


# === SOURCE SYNTHESIS ===

def build_drums(time_s: np.ndarray) -> np.ndarray:
    beat_time_s = np.mod(time_s, BEAT_PERIOD_S)
    kick = np.exp(-12.0 * beat_time_s) * np.sin(
        2.0 * np.pi * (40.0 * beat_time_s + 2.0 * (1.0 - np.exp(-25.0 * beat_time_s)))
    )
    snare_time_s = np.mod(time_s - 0.5, 1.0)
    snare = np.where(
        time_s >= 0.5,
        0.5 * np.exp(-40.0 * snare_time_s) * np.sin(2.0 * np.pi * 1800.0 * snare_time_s),
        0.0,
    )
    return kick + snare


def build_bass(time_s: np.ndarray) -> np.ndarray:
    note_index = np.floor(time_s / BEAT_PERIOD_S).astype(int) % len(BASS_NOTE_HZ)
    note_hz = np.array(BASS_NOTE_HZ)[note_index]
    note_time_s = np.mod(time_s, BEAT_PERIOD_S)
    return np.exp(-3.0 * note_time_s) * np.sin(2.0 * np.pi * note_hz * time_s)


def fit_to_length(stereo: np.ndarray) -> np.ndarray:
    fitted = np.zeros((2, SAMPLE_COUNT))
    copied = min(stereo.shape[1], SAMPLE_COUNT)
    fitted[:, :copied] = stereo[:, :copied]
    return fitted


# === PUBLIC API: BUILD ===

def main(output_dir: Path) -> None:
    time_s = np.arange(SAMPLE_COUNT) / SAMPLE_RATE_HZ
    vocals_source = read_float32_stereo(output_dir / "vocals.wav")
    if vocals_source.shape[1] > SAMPLE_COUNT:
        print(f"make_input: vocals are {vocals_source.shape[1] / SAMPLE_RATE_HZ:.2f} s, "
              f"longer than {DURATION_S} s; shorten the sentence.", file=sys.stderr)
        sys.exit(1)
    sources = {
        "drums": np.tile(build_drums(time_s), (2, 1)),
        "bass": np.tile(build_bass(time_s), (2, 1)),
        "vocals": fit_to_length(vocals_source),
    }
    mix_unscaled = sum(SOURCE_GAINS[name] * sources[name] for name in sources)
    peak = float(np.max(np.abs(mix_unscaled)))
    scale = CLIP_SCALE if peak >= CLIP_LIMIT else 1.0
    truth_dir = output_dir / "truth"
    truth_dir.mkdir(parents=True, exist_ok=True)
    truths = {}
    for name in sources:
        truths[name] = scale * SOURCE_GAINS[name] * sources[name]
        np.save(truth_dir / f"{name}.npy", truths[name])
    mix = sum(truths.values())
    write_float32_wav(output_dir / "input.wav", mix, SAMPLE_RATE_HZ)
    summary = {
        "sample_rate_hz": SAMPLE_RATE_HZ,
        "duration_s": DURATION_S,
        "samples": SAMPLE_COUNT,
        "gains": SOURCE_GAINS,
        "peak_before_scale": peak,
        "scale": scale,
        "vocals_source_samples": int(vocals_source.shape[1]),
    }
    (output_dir / "make_input.json").write_text(json.dumps(summary, indent=2) + "\n")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: make_input.py <output-dir>", file=sys.stderr)
        sys.exit(2)
    main(Path(sys.argv[1]))
