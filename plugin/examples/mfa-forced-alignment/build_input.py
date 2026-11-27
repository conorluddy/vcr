"""Joins per-word 16 kHz mono PCM clips into one sentence WAV with known onsets.
Usage: build_input.py WORDS_DIR CORPUS_DIR REFERENCE_JSON"""
import json, sys, wave
import numpy as np

SAMPLE_RATE_HZ = 16000
LEAD_IN_S = 0.5
GAP_S = 0.4
ONSET_THRESHOLD_FRACTION = 0.03
WORDS = ["the", "red", "fox", "jumps", "over", "the", "quiet", "brown", "river", "today"]

words_dir, corpus_dir, reference_path = sys.argv[1:4]
parts = [np.zeros(round(LEAD_IN_S * SAMPLE_RATE_HZ), dtype=np.int16)]
starts_s, length = [], len(parts[0])
for index in range(len(WORDS)):
    with wave.open(f"{words_dir}/{index:02d}.wav") as clip_file:
        assert (clip_file.getframerate(), clip_file.getnchannels(), clip_file.getsampwidth()) == (SAMPLE_RATE_HZ, 1, 2)
        clip = np.frombuffer(clip_file.readframes(clip_file.getnframes()), dtype=np.int16)
    magnitude = np.abs(clip.astype(np.int32))
    peak = int(magnitude.max())
    assert peak > 0, "clip is silent; the say step failed"
    onset = int(np.argmax(magnitude >= ONSET_THRESHOLD_FRACTION * peak))
    starts_s.append((length + onset) / SAMPLE_RATE_HZ)
    parts.append(clip)
    length += len(clip)
    if index < len(WORDS) - 1:
        parts.append(np.zeros(round(GAP_S * SAMPLE_RATE_HZ), dtype=np.int16))
        length += len(parts[-1])
with wave.open(f"{corpus_dir}/sentence.wav", "wb") as out:
    out.setnchannels(1)
    out.setsampwidth(2)
    out.setframerate(SAMPLE_RATE_HZ)
    out.writeframes(np.concatenate(parts).tobytes())
with open(f"{corpus_dir}/sentence.txt", "w") as transcript:
    transcript.write(" ".join(WORDS) + "\n")
with open(reference_path, "w") as reference:
    json.dump({"words": WORDS, "referenceStartsS": starts_s}, reference)
