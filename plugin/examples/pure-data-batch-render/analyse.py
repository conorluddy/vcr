#!/usr/bin/env python3
"""Check a Pd batch render against the predeclared envelope and tone. Standard library only.

Usage: analyse.py <run-a/render.wav> <run-b/render.wav> > summary.json
Prints a JSON summary and exits 1 when any predeclared check is false.
"""
import hashlib
import json
import math
import sys
import wave
from array import array
from collections import deque

# === PREDECLARED VALUES (see README "Plan, before running") ===
SAMPLE_RATE_HZ = 48000
CHANNEL_COUNT = 1
SAMPLE_WIDTH_BYTES = 2
DURATION_MS = 2000.0
DURATION_TOLERANCE_MS = 5.0
TONE_HZ = 440.0
TONE_TOLERANCE_CENTS = 5.0
PLATEAU_AMPLITUDE = 0.5
PLATEAU_TOLERANCE_FRACTION = 0.01
ATTACK_MS = 50.0
RELEASE_START_MS = 1500.0
RELEASE_MS = 300.0
ENVELOPE_WINDOW_SAMPLES = 240
ENVELOPE_TIME_TOLERANCE_MS = 2.0
PLATEAU_SEARCH_MS = (600.0, 1400.0)
SUSTAIN_START_MS = 300.0
FFT_SIZE = 16384
TONE_SEARCH_HZ = (200.0, 1000.0)
TAIL_START_MS = 1850.0
SILENCE_LIMIT = 1e-4

# === PUBLIC API ===


def analyseRender(renderPath: str) -> dict:
    """Return the measurements and check results for one WAV render."""
    with wave.open(renderPath, "rb") as wav:
        channels = wav.getnchannels()
        sampleWidthBytes = wav.getsampwidth()
        sampleRateHz = wav.getframerate()
        frameCount = wav.getnframes()
        rawBytes = wav.readframes(frameCount)
    samples = array("h")
    samples.frombytes(rawBytes)
    if sys.byteorder == "big":
        samples.byteswap()
    values = [sample / 32768 for sample in samples]

    envelope = trailingPeakEnvelope(values, ENVELOPE_WINDOW_SAMPLES)
    plateauAmplitude = max(envelope[msToSample(PLATEAU_SEARCH_MS[0]) : msToSample(PLATEAU_SEARCH_MS[1])])
    thresholdFor = lambda fraction: fraction * plateauAmplitude
    rise10Ms = crossingMs(firstAtOrAbove(envelope, thresholdFor(0.1), 0))
    rise90Ms = crossingMs(firstAtOrAbove(envelope, thresholdFor(0.9), 0))
    fall90Ms = crossingMs(firstBelow(envelope, thresholdFor(0.9), msToSample(PLATEAU_SEARCH_MS[1])))
    fall10Ms = crossingMs(firstBelow(envelope, thresholdFor(0.1), msToSample(PLATEAU_SEARCH_MS[1])))
    toneHz, toneErrorCents = measureTone(values)
    attackHash = segmentHash(rawBytes, 0.0, ATTACK_MS)
    sustainHash = segmentHash(rawBytes, SUSTAIN_START_MS, SUSTAIN_START_MS + 100.0)
    releaseHash = segmentHash(rawBytes, RELEASE_START_MS, RELEASE_START_MS + RELEASE_MS)
    tailPeak = max(abs(value) for value in values[msToSample(TAIL_START_MS) :])
    durationMs = frameCount * 1000.0 / sampleRateHz
    predicted = {
        "rise10Ms": ATTACK_MS * 0.1,
        "rise90Ms": ATTACK_MS * 0.9,
        "fall90Ms": predictedFallMs(0.9),
        "fall10Ms": predictedFallMs(0.1),
    }
    measured = {
        "rise10Ms": rise10Ms,
        "rise90Ms": rise90Ms,
        "fall90Ms": fall90Ms,
        "fall10Ms": fall10Ms,
    }
    checks = {
        "rate_48000_hz": sampleRateHz == SAMPLE_RATE_HZ,
        "mono": channels == CHANNEL_COUNT,
        "sample_width_16_bit": sampleWidthBytes == SAMPLE_WIDTH_BYTES,
        "duration_2000ms_within_5ms": abs(durationMs - DURATION_MS) <= DURATION_TOLERANCE_MS,
        "peak_below_full_scale": max(abs(value) for value in values) < 1.0,
        "plateau_0_5_within_1_percent": abs(plateauAmplitude - PLATEAU_AMPLITUDE) <= PLATEAU_TOLERANCE_FRACTION * PLATEAU_AMPLITUDE,
        "rise_10_within_2ms": isWithin(rise10Ms, predicted["rise10Ms"], ENVELOPE_TIME_TOLERANCE_MS),
        "rise_90_within_2ms": isWithin(rise90Ms, predicted["rise90Ms"], ENVELOPE_TIME_TOLERANCE_MS),
        "fall_90_within_2ms": isWithin(fall90Ms, predicted["fall90Ms"], ENVELOPE_TIME_TOLERANCE_MS),
        "fall_10_within_2ms": isWithin(fall10Ms, predicted["fall10Ms"], ENVELOPE_TIME_TOLERANCE_MS),
        "tone_440_within_5_cents": abs(toneErrorCents) <= TONE_TOLERANCE_CENTS,
        "tail_silent": tailPeak <= SILENCE_LIMIT,
        "segments_distinct": len({attackHash, sustainHash, releaseHash}) == 3,
    }
    return {
        "checks": checks,
        "measured": {
            "channels": channels,
            "sample_width_bytes": sampleWidthBytes,
            "sample_rate_hz": sampleRateHz,
            "frame_count": frameCount,
            "duration_ms": round(durationMs, 3),
            "plateau_amplitude": round(plateauAmplitude, 6),
            "envelope_ms": {key: crossingRounded(value) for key, value in measured.items()},
            "envelope_predicted_ms": {key: round(value, 3) for key, value in predicted.items()},
            "tone_hz": round(toneHz, 4),
            "tone_error_cents": round(toneErrorCents, 4),
            "tail_peak": tailPeak,
            "segment_sha256": {"attack": attackHash, "sustain": sustainHash, "release": releaseHash},
        },
        "sha256": hashlib.sha256(rawBytes).hexdigest(),
    }


def isRerunByteIdentical(firstRenderPath: str, secondRenderPath: str) -> bool:
    return fileSha256(firstRenderPath) == fileSha256(secondRenderPath)


# === HELPERS ===


def msToSample(milliseconds: float) -> int:
    return round(milliseconds * SAMPLE_RATE_HZ / 1000)


def predictedFallMs(fraction: float) -> float:
    # Trailing-max envelope lags a falling ramp by the window length.
    windowMs = ENVELOPE_WINDOW_SAMPLES * 1000 / SAMPLE_RATE_HZ
    return RELEASE_START_MS + RELEASE_MS * (1 - fraction) + windowMs


def isWithin(measuredMs: float | None, predictedMs: float, toleranceMs: float) -> bool:
    return measuredMs is not None and abs(measuredMs - predictedMs) <= toleranceMs


def crossingMs(sampleIndex: int | None) -> float | None:
    return None if sampleIndex is None else sampleIndex * 1000 / SAMPLE_RATE_HZ


def crossingRounded(milliseconds: float | None) -> float | None:
    return None if milliseconds is None else round(milliseconds, 4)


def trailingPeakEnvelope(values: list[float], windowSamples: int) -> list[float]:
    envelope = [0.0] * len(values)
    candidates: deque[int] = deque()
    for index, value in enumerate(values):
        while candidates and abs(values[candidates[-1]]) <= abs(value):
            candidates.pop()
        candidates.append(index)
        if candidates[0] <= index - windowSamples:
            candidates.popleft()
        envelope[index] = abs(values[candidates[0]])
    return envelope


def firstAtOrAbove(values: list[float], threshold: float, startIndex: int) -> int | None:
    for index in range(startIndex, len(values)):
        if values[index] >= threshold:
            return index
    return None


def firstBelow(values: list[float], threshold: float, startIndex: int) -> int | None:
    for index in range(startIndex, len(values)):
        if values[index] < threshold:
            return index
    return None


def segmentHash(rawBytes: bytes, startMs: float, endMs: float) -> str:
    startByte = msToSample(startMs) * SAMPLE_WIDTH_BYTES
    endByte = msToSample(endMs) * SAMPLE_WIDTH_BYTES
    return hashlib.sha256(rawBytes[startByte:endByte]).hexdigest()


def measureTone(values: list[float]) -> tuple[float, float]:
    """Return the sustain tone's frequency (Hz) and its error from TONE_HZ in cents."""
    start = msToSample(SUSTAIN_START_MS)
    hann = [0.5 - 0.5 * math.cos(2 * math.pi * index / FFT_SIZE) for index in range(FFT_SIZE)]
    windowed = [values[start + index] * hann[index] for index in range(FFT_SIZE)]
    magnitudes = magnitudeSpectrum(windowed)
    lowBin = int(TONE_SEARCH_HZ[0] * FFT_SIZE / SAMPLE_RATE_HZ)
    highBin = int(TONE_SEARCH_HZ[1] * FFT_SIZE / SAMPLE_RATE_HZ)
    peakBin = max(range(lowBin, highBin + 1), key=lambda bin: magnitudes[bin])
    left, centre, right = (math.log(magnitudes[bin]) for bin in (peakBin - 1, peakBin, peakBin + 1))
    offset = 0.5 * (left - right) / (left - 2 * centre + right)
    frequencyHz = (peakBin + offset) * SAMPLE_RATE_HZ / FFT_SIZE
    return frequencyHz, 1200 * math.log2(frequencyHz / TONE_HZ)


def magnitudeSpectrum(samples: list[float]) -> list[float]:
    """Iterative radix-2 FFT; returns magnitudes of the first half of the bins."""
    size = len(samples)
    data = [complex(value, 0.0) for value in samples]
    bitReversed = 0
    for index in range(1, size):
        bit = size >> 1
        while bitReversed & bit:
            bitReversed ^= bit
            bit >>= 1
        bitReversed |= bit
        if index < bitReversed:
            data[index], data[bitReversed] = data[bitReversed], data[index]
    span = 2
    while span <= size:
        half = span // 2
        for blockStart in range(0, size, span):
            for offsetInBlock in range(half):
                angle = -2 * math.pi * offsetInBlock / span
                twiddle = complex(math.cos(angle), math.sin(angle)) * data[blockStart + offsetInBlock + half]
                upper = data[blockStart + offsetInBlock]
                data[blockStart + offsetInBlock] = upper + twiddle
                data[blockStart + offsetInBlock + half] = upper - twiddle
        span <<= 1
    return [abs(value) for value in data[: size // 2]]


def fileSha256(path: str) -> str:
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: analyse.py <run-a/render.wav> <run-b/render.wav>", file=sys.stderr)
        return 2
    analysis = analyseRender(argv[1])
    checks = analysis["checks"]
    checks["rerun_byte_identical"] = isRerunByteIdentical(argv[1], argv[2])
    print(json.dumps(analysis, indent=2, sort_keys=True))
    failed = [name for name, passed in checks.items() if passed is not True]
    if failed:
        print(f"predeclared checks failed: {', '.join(sorted(failed))}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
