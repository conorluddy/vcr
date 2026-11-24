"""Concatenate per-word 16 kHz mono WAV clips into one sentence WAV with reference word onsets.

Usage: make_input.py WORDS_DIR OUTPUT_WAV OUTPUT_REFERENCE_JSON
WORDS_DIR holds NN.wav clips in sentence order, one per word (see run.sh).
The reference onset is the first sample whose absolute value reaches
ONSET_THRESHOLD_FRACTION of that clip's peak, placed on the sentence timeline.
"""
import json
import os
import sys
import wave
from array import array

SAMPLE_RATE_HZ = 16000
LEAD_IN_S = 0.50
GAP_S = 0.40
ONSET_THRESHOLD_FRACTION = 0.03
SENTENCE_WORDS = ["the", "red", "fox", "jumps", "over", "the", "quiet", "brown", "river", "today"]


def readMonoSamples(clipPath: str) -> array:
    with wave.open(clipPath, "rb") as clip:
        if clip.getframerate() != SAMPLE_RATE_HZ or clip.getnchannels() != 1 or clip.getsampwidth() != 2:
            sys.exit(f"{clipPath}: expected 16 kHz mono 16-bit, got "
                     f"{clip.getframerate()} Hz, {clip.getnchannels()} ch, {clip.getsampwidth()} bytes")
        samples = array("h")
        samples.frombytes(clip.readframes(clip.getnframes()))
    if sys.byteorder == "big":
        samples.byteswap()
    return samples


def findOnsetIndex(samples: array) -> int:
    peak = max(abs(value) for value in samples)
    if peak == 0:
        sys.exit("clip is silent; the say step failed")
    threshold = ONSET_THRESHOLD_FRACTION * peak
    for index, value in enumerate(samples):
        if abs(value) >= threshold:
            return index
    return 0


def main(argv: list[str]) -> None:
    if len(argv) != 4:
        sys.exit("usage: make_input.py WORDS_DIR OUTPUT_WAV OUTPUT_REFERENCE_JSON")
    wordsDir, outputWavPath, outputReferencePath = argv[1], argv[2], argv[3]
    clipPaths = [os.path.join(wordsDir, f"{index:02d}.wav") for index in range(len(SENTENCE_WORDS))]

    sentence = array("h")
    sentence.extend(array("h", [0]) * int(LEAD_IN_S * SAMPLE_RATE_HZ))
    gapSamples = array("h", [0]) * int(GAP_S * SAMPLE_RATE_HZ)
    referenceStartsS: list[float] = []

    for clipIndex, clipPath in enumerate(clipPaths):
        clip = readMonoSamples(clipPath)
        onsetIndex = findOnsetIndex(clip)
        referenceStartsS.append(round((len(sentence) + onsetIndex) / SAMPLE_RATE_HZ, 6))
        sentence.extend(clip)
        if clipIndex < len(clipPaths) - 1:
            sentence.extend(gapSamples)

    if sys.byteorder == "big":
        sentence.byteswap()
    with wave.open(outputWavPath, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(SAMPLE_RATE_HZ)
        out.writeframes(sentence.tobytes())

    reference = {
        "sentence": " ".join(SENTENCE_WORDS),
        "words": SENTENCE_WORDS,
        "startsS": referenceStartsS,
        "durationS": round(len(sentence) / SAMPLE_RATE_HZ, 6),
        "leadInS": LEAD_IN_S,
        "gapS": GAP_S,
        "onsetThresholdFraction": ONSET_THRESHOLD_FRACTION,
    }
    with open(outputReferencePath, "w", encoding="utf-8") as referenceFile:
        json.dump(reference, referenceFile, indent=2)
        referenceFile.write("\n")


if __name__ == "__main__":
    main(sys.argv)
