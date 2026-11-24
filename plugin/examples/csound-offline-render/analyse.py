#!/usr/bin/env python3
# === PUBLIC API ===
# Analyse two csound renders of fixture.csd against the predeclared score (README "Plan, before running").
# Usage: analyse.py <fixture.csd> <render-a.wav> <render-b.wav> <spectrogram.ppm>
# Prints a sorted-key JSON summary to stdout and exits 1 when any predeclared check is false.
# Standard library only: no numpy, no venv.

import cmath
import hashlib
import json
import math
import struct
import sys
import wave

SAMPLE_RATE_HZ = 48000
CHANNEL_COUNT = 1
FRAME_COUNT = 144000
AMPLITUDE = 0.5
PEAK_TOLERANCE = 0.01
ONSET_THRESHOLD = 0.01
ONSET_TOLERANCE_S = 0.005
ONSET_SEARCH_BEFORE_S = 0.05
ONSET_SEARCH_AFTER_S = 0.1
FREQUENCY_TOLERANCE_CENTS = 5.0
FREQUENCY_WINDOW_SAMPLES = 8192
FREQUENCY_FFT_SAMPLES = 32768
FREQUENCY_OFFSET_S = 0.05
FREQUENCY_BAND_HZ = (50.0, 5000.0)
SILENCE_MARGIN_S = 0.01
SILENCE_MAX_ABS = 1e-4
SPECTROGRAM_FFT_SAMPLES = 1024
SPECTROGRAM_HOP_SAMPLES = 512
SPECTROGRAM_MAX_HZ = 2500
SPECTROGRAM_FLOOR_DB = -90.0
SPECTROGRAM_PIXEL_SCALE = 4

# Predeclared score: (start s, duration s, frequency Hz). Must equal the "i 1" lines in fixture.csd.
NOTES = [
    (0.0, 0.4, 220.0),
    (0.5, 0.4, 330.0),
    (1.0, 0.4, 440.0),
    (1.5, 0.4, 660.0),
    (2.0, 0.4, 880.0),
    (2.5, 0.4, 1100.0),
]


def main(argv: list[str]) -> int:
    if len(argv) != 5:
        print("usage: analyse.py <fixture.csd> <render-a.wav> <render-b.wav> <spectrogram.ppm>", file=sys.stderr)
        return 2
    fixturePath, renderAPath, renderBPath, spectrogramPath = argv[1:]

    with open(fixturePath, encoding="utf-8") as fixtureFile:
        scoreMatches = tuplesMatch(parseScoreNotes(fixtureFile.read()), [(s, d, f, AMPLITUDE) for s, d, f in NOTES])

    render = readRender(renderAPath)
    with open(renderAPath, "rb") as fileA, open(renderBPath, "rb") as fileB:
        bytesA, bytesB = fileA.read(), fileB.read()

    peak = max(abs(value) for value in render["samples"])
    notes = [analyseNote(render, start, duration, frequency) for start, duration, frequency in NOTES]
    silenceMax = maxAbsInGaps(render["samples"])
    writeSpectrogramPpm(render["samples"], spectrogramPath)

    checks = {
        "rate_48000_hz": render["rate"] == SAMPLE_RATE_HZ,
        "mono": render["channels"] == CHANNEL_COUNT,
        "frames_144000": render["frames"] == FRAME_COUNT,
        "peak_below_0dbfs": peak < 1.0,
        "peak_matches_amplitude": abs(peak - AMPLITUDE) <= PEAK_TOLERANCE,
        "score_matches_predeclared": scoreMatches,
        "onsets_within_5ms": all(note["onset_error_ms"] is not None and abs(note["onset_error_ms"]) <= ONSET_TOLERANCE_S * 1000 for note in notes),
        "frequencies_within_5_cents": all(abs(note["error_cents"]) <= FREQUENCY_TOLERANCE_CENTS for note in notes),
        "gaps_silent": silenceMax <= SILENCE_MAX_ABS,
        "distinct_note_hashes": len({note["segment_sha256"] for note in notes}) == len(NOTES),
        "rerun_byte_identical": bytesA == bytesB,
    }

    summary = {
        "checks": checks,
        "notes": notes,
        "render": {
            "channels": render["channels"],
            "frames": render["frames"],
            "peak_amplitude": round(peak, 6),
            "rate_hz": render["rate"],
            "sample_width_bytes": render["width"],
            "sha256": hashlib.sha256(bytesA).hexdigest(),
        },
        "silence_max_abs": round(silenceMax, 9),
    }
    print(json.dumps(summary, indent=2, sort_keys=True))
    return 0 if all(checks.values()) else 1


# === NOTE ANALYSIS ===

def analyseNote(render: dict, startS: float, durationS: float, expectedHz: float) -> dict:
    onsetS = findOnsetS(render["samples"], startS)
    measuredHz = measureFrequencyHz(render["samples"], startS)
    segment = segmentBytes(render, startS, durationS)
    return {
        "start_s": startS,
        "duration_s": durationS,
        "expected_hz": expectedHz,
        "onset_s": round(onsetS, 6) if onsetS is not None else None,
        "onset_error_ms": round((onsetS - startS) * 1000, 4) if onsetS is not None else None,
        "measured_hz": round(measuredHz, 4),
        "error_cents": round(1200 * math.log2(measuredHz / expectedHz), 3),
        "segment_sha256": hashlib.sha256(segment).hexdigest(),
    }


def findOnsetS(samples: list[float], startS: float) -> float | None:
    searchStart = max(0, round((startS - ONSET_SEARCH_BEFORE_S) * SAMPLE_RATE_HZ))
    searchEnd = min(len(samples), round((startS + ONSET_SEARCH_AFTER_S) * SAMPLE_RATE_HZ))
    for index in range(searchStart, searchEnd):
        if abs(samples[index]) >= ONSET_THRESHOLD:
            return index / SAMPLE_RATE_HZ
    return None


def measureFrequencyHz(samples: list[float], startS: float) -> float:
    blockStart = round((startS + FREQUENCY_OFFSET_S) * SAMPLE_RATE_HZ)
    window = hannWindow(FREQUENCY_WINDOW_SAMPLES)
    block = [samples[blockStart + index] * window[index] for index in range(FREQUENCY_WINDOW_SAMPLES)]
    magnitudes = fourierMagnitudes(block + [0.0] * (FREQUENCY_FFT_SAMPLES - FREQUENCY_WINDOW_SAMPLES))
    lowBin = math.ceil(FREQUENCY_BAND_HZ[0] * FREQUENCY_FFT_SAMPLES / SAMPLE_RATE_HZ)
    highBin = math.floor(FREQUENCY_BAND_HZ[1] * FREQUENCY_FFT_SAMPLES / SAMPLE_RATE_HZ)
    peakBin = max(range(lowBin, highBin + 1), key=lambda binIndex: magnitudes[binIndex])
    leftLog, centreLog, rightLog = (math.log(magnitudes[binIndex] + 1e-300) for binIndex in (peakBin - 1, peakBin, peakBin + 1))
    curvature = leftLog - 2 * centreLog + rightLog
    offsetBins = 0.5 * (leftLog - rightLog) / curvature if curvature != 0 else 0.0
    return (peakBin + offsetBins) * SAMPLE_RATE_HZ / FREQUENCY_FFT_SAMPLES


def maxAbsInGaps(samples: list[float]) -> float:
    gapEnds = [start + duration for start, duration, _ in NOTES]
    gaps = [
        (gapEnds[index] + SILENCE_MARGIN_S, NOTES[index + 1][0] - SILENCE_MARGIN_S)
        for index in range(len(NOTES) - 1)
    ]
    gaps.append((gapEnds[-1] + SILENCE_MARGIN_S, FRAME_COUNT / SAMPLE_RATE_HZ))
    return max(
        abs(samples[index])
        for gapStartS, gapEndS in gaps
        for index in range(round(gapStartS * SAMPLE_RATE_HZ), round(gapEndS * SAMPLE_RATE_HZ))
    )


# === FILES ===

def readRender(path: str) -> dict:
    with wave.open(path, "rb") as wavFile:
        channels = wavFile.getnchannels()
        width = wavFile.getsampwidth()
        rate = wavFile.getframerate()
        frames = wavFile.getnframes()
        raw = wavFile.readframes(frames)
    if width == 2:
        values = struct.unpack(f"<{len(raw) // 2}h", raw)
        scale = 32768.0
    elif width == 4:
        values = struct.unpack(f"<{len(raw) // 4}i", raw)
        scale = 2147483648.0
    else:
        raise SystemExit(f"analyse: unsupported sample width {width} bytes in {path}; expected 2 or 4")
    return {
        "channels": channels,
        "width": width,
        "rate": rate,
        "frames": frames,
        "raw": raw,
        "samples": [value / scale for value in values],
    }


def segmentBytes(render: dict, startS: float, durationS: float) -> bytes:
    bytesPerFrame = render["width"] * render["channels"]
    firstFrame = round(startS * SAMPLE_RATE_HZ)
    endFrame = round((startS + durationS) * SAMPLE_RATE_HZ)
    return render["raw"][firstFrame * bytesPerFrame : endFrame * bytesPerFrame]


def writeSpectrogramPpm(samples: list[float], path: str) -> None:
    window = hannWindow(SPECTROGRAM_FFT_SAMPLES)
    coherentGain = sum(window) / 2
    binCount = round(SPECTROGRAM_MAX_HZ * SPECTROGRAM_FFT_SAMPLES / SAMPLE_RATE_HZ)
    columns = []
    for frameStart in range(0, len(samples) - SPECTROGRAM_FFT_SAMPLES + 1, SPECTROGRAM_HOP_SAMPLES):
        block = [samples[frameStart + index] * window[index] for index in range(SPECTROGRAM_FFT_SAMPLES)]
        magnitudes = fourierMagnitudes(block)[:binCount]
        columns.append([greyLevel(magnitude / coherentGain) for magnitude in magnitudes])
    scale = SPECTROGRAM_PIXEL_SCALE
    width = len(columns) * scale
    height = binCount * scale
    pixels = bytearray()
    for row in range(height):
        binIndex = binCount - 1 - row // scale
        for column in range(width):
            pixels.extend(bytes([columns[column // scale][binIndex]]) * 3)
    with open(path, "wb") as imageFile:
        imageFile.write(f"P6\n{width} {height}\n255\n".encode("ascii"))
        imageFile.write(pixels)


# === DSP HELPERS ===

def greyLevel(amplitude: float) -> int:
    decibels = 20 * math.log10(amplitude + 1e-12)
    fraction = (decibels - SPECTROGRAM_FLOOR_DB) / -SPECTROGRAM_FLOOR_DB
    return int(255 * min(1.0, max(0.0, fraction)))


def hannWindow(length: int) -> list[float]:
    return [0.5 - 0.5 * math.cos(2 * math.pi * index / length) for index in range(length)]


def fourierMagnitudes(values: list[float]) -> list[float]:
    """Iterative radix-2 FFT. Returns magnitudes for bins 0..N/2; N must be a power of two."""
    count = len(values)
    bitCount = count.bit_length() - 1
    data = [complex(values[int(format(index, f"0{bitCount}b")[::-1], 2)]) for index in range(count)]
    size = 2
    while size <= count:
        half = size // 2
        twiddles = [cmath.exp(-2j * math.pi * k / size) for k in range(half)]
        for blockStart in range(0, count, size):
            for k in range(half):
                top = data[blockStart + k]
                bottom = data[blockStart + k + half] * twiddles[k]
                data[blockStart + k] = top + bottom
                data[blockStart + k + half] = top - bottom
        size *= 2
    return [abs(value) for value in data[: count // 2 + 1]]


# === SCORE PARSING ===

def parseScoreNotes(csdText: str) -> list[tuple[float, ...]]:
    notes = []
    for line in csdText.splitlines():
        fields = line.split(";")[0].split()
        if len(fields) == 6 and fields[0] == "i" and fields[1] == "1":
            notes.append(tuple(float(field) for field in fields[2:6]))
    return notes


def tuplesMatch(actual: list[tuple[float, ...]], expected: list[tuple[float, ...]]) -> bool:
    return len(actual) == len(expected) and all(
        len(actualNote) == len(expectedNote) and all(math.isclose(a, e, abs_tol=1e-9) for a, e in zip(actualNote, expectedNote))
        for actualNote, expectedNote in zip(actual, expected)
    )


if __name__ == "__main__":
    sys.exit(main(sys.argv))
