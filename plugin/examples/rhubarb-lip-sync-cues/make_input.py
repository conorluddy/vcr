"""Concatenate phrase clips with exact silent gaps into one WAV and write its timing reference.

Usage: make_input.py PHRASES_TXT PHRASES_DIR OUTPUT_WAV OUTPUT_REFERENCE_JSON OUTPUT_DIALOG_TXT
PHRASES_DIR holds NN.wav clips, one per line of PHRASES_TXT, in order (see run.sh).
Silent gaps are written as exact zero samples, so the reference intervals are sample-exact.
"""
import json
import os
import sys
import wave
from array import array

SAMPLE_RATE_HZ = 16000
LEAD_IN_S = 0.50
GAP_AFTER_PHRASE_S = 1.00
TAIL_S = 1.00


def readPhraseLines(phrasesPath: str) -> list:
    with open(phrasesPath, encoding="utf-8") as phrasesFile:
        lines = [line.strip() for line in phrasesFile if line.strip()]
    if not lines:
        sys.exit(f"{phrasesPath}: no phrases; add one phrase per line")
    return lines


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


def roundSeconds(sampleCount: int) -> float:
    return round(sampleCount / SAMPLE_RATE_HZ, 6)


def main(argv: list) -> None:
    if len(argv) != 6:
        sys.exit("usage: make_input.py PHRASES_TXT PHRASES_DIR OUTPUT_WAV OUTPUT_REFERENCE_JSON OUTPUT_DIALOG_TXT")
    phrasesPath, phrasesDir, outputWavPath, outputReferencePath, outputDialogPath = argv[1:]
    phrases = readPhraseLines(phrasesPath)

    sentence = array("h")
    silentGapsS: list = []
    speechSpansS: list = []

    def appendSilence(sampleCount: int) -> None:
        startSample = len(sentence)
        sentence.extend(array("h", [0]) * sampleCount)
        silentGapsS.append([roundSeconds(startSample), roundSeconds(len(sentence))])

    appendSilence(int(LEAD_IN_S * SAMPLE_RATE_HZ))
    for phraseIndex, _phrase in enumerate(phrases):
        clip = readMonoSamples(os.path.join(phrasesDir, f"{phraseIndex:02d}.wav"))
        startSample = len(sentence)
        sentence.extend(clip)
        speechSpansS.append([roundSeconds(startSample), roundSeconds(len(sentence))])
        if phraseIndex < len(phrases) - 1:
            appendSilence(int(GAP_AFTER_PHRASE_S * SAMPLE_RATE_HZ))
    appendSilence(int(TAIL_S * SAMPLE_RATE_HZ))

    with wave.open(outputWavPath, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(SAMPLE_RATE_HZ)
        out.writeframes(sentence.tobytes())

    reference = {
        "phrases": phrases,
        "sampleRateHz": SAMPLE_RATE_HZ,
        "durationS": roundSeconds(len(sentence)),
        "silentGapsS": silentGapsS,
        "speechSpansS": speechSpansS,
    }
    with open(outputReferencePath, "w", encoding="utf-8") as referenceFile:
        json.dump(reference, referenceFile, indent=2)
        referenceFile.write("\n")
    with open(outputDialogPath, "w", encoding="utf-8") as dialogFile:
        dialogFile.write(" ".join(phrases) + "\n")


if __name__ == "__main__":
    main(sys.argv)
