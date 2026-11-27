"""make: write noisy.wav (speech + seeded white noise at a known SNR). score: SNR of a denoised file against clean."""
import hashlib
import json
import sys
import wave

import numpy as np

TARGET_SNR_DB = 5.0
SEED = 20261127
MIN_IMPROVEMENT_DB = 8.0  # predeclared in README before the first run
RATE_HZ = 48000


def read_wav(path):
    with wave.open(path, "rb") as w:
        assert w.getsampwidth() == 2, f"{path}: expected 16-bit PCM"
        return w.getframerate(), w.getnchannels(), np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768


def write_wav(path, samples):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE_HZ)
        w.writeframes((np.clip(samples, -1, 1) * 32767).round().astype("<i2").tobytes())


def aligned_snr_db(clean, estimate):
    """SNR after the best scalar gain on clean, so a level change is not counted as noise."""
    gain = np.dot(estimate, clean) / np.dot(clean, clean)
    residual = estimate - gain * clean
    return 10 * np.log10(np.sum((gain * clean) ** 2) / np.sum(residual ** 2))


def sha256_of(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def make(directory):
    rate, channels, clean = read_wav(f"{directory}/clean.wav")
    assert (rate, channels) == (RATE_HZ, 1)
    noise = np.random.default_rng(SEED).standard_normal(len(clean))
    noise *= np.sqrt(np.sum(clean ** 2) / np.sum(noise ** 2) / 10 ** (TARGET_SNR_DB / 10))
    write_wav(f"{directory}/noisy.wav", clean + noise)


def score(directory):
    _, _, clean = read_wav(f"{directory}/clean.wav")
    _, _, noisy = read_wav(f"{directory}/noisy.wav")
    rate, channels, out1 = read_wav(f"{directory}/run1/noisy.wav")
    noisy_db = aligned_snr_db(clean, noisy)
    same_length = len(out1) == len(clean)
    overlap = min(len(out1), len(clean))  # deep-filter drops trailing samples; SNR is scored on the shared prefix
    out_db = aligned_snr_db(clean[:overlap], out1[:overlap])
    checks = {
        "input_snr_is_target": bool(abs(noisy_db - TARGET_SNR_DB) <= 0.05),
        "output_format_48k_mono_16bit": (rate, channels) == (RATE_HZ, 1),
        "output_length_equals_input": same_length,
        "snr_improves_by_margin": bool(out_db - noisy_db >= MIN_IMPROVEMENT_DB),
        "rerun_byte_identical": sha256_of(f"{directory}/run1/noisy.wav") == sha256_of(f"{directory}/run2/noisy.wav"),
    }
    result = {
        "target_snr_db": TARGET_SNR_DB,
        "min_improvement_db": MIN_IMPROVEMENT_DB,
        "samples_in": int(len(clean)),
        "samples_out": int(len(out1)),
        "input_snr_db": round(float(noisy_db), 1),
        "output_snr_db": round(float(out_db), 1),
        "improvement_db": round(float(out_db - noisy_db), 1),
        "checks": checks,
    }
    with open(f"{directory}/result.json", "w") as f:
        json.dump(result, f, indent=2, sort_keys=True)
        f.write("\n")


{"make": make, "score": score}[sys.argv[1]](sys.argv[2])
