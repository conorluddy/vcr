"""Applies the predeclared gates to two MFA JSON runs. Usage: check.py REFERENCE_JSON RUN1_JSON RUN2_JSON OUTPUT_DIR"""
import json, sys

MAX_START_ERROR_S = 0.2
MIN_WORDS_WITHIN_TOLERANCE = 9
reference_path, run1_path, run2_path, output_dir = sys.argv[1:5]
with open(reference_path) as reference_file:
    reference = json.load(reference_file)


def read_words(path):
    with open(path) as run_file:
        tiers = json.load(run_file)["tiers"]
    return [(label, begin, end) for begin, end, label in tiers["words"]["entries"] if label]


def to_ms(run):
    return [[round(begin * 1000), round(end * 1000)] for _, begin, end in run]


def write_json(name, value):
    with open(f"{output_dir}/{name}", "w") as out:
        json.dump(value, out, indent=2)
        out.write("\n")


runs = [read_words(run1_path), read_words(run2_path)]
words = runs[0]
errors = [abs(begin - ref) for (_, begin, _), ref in zip(words, reference["referenceStartsS"])]
within = sum(error <= MAX_START_ERROR_S for error in errors)
gates = {
    "G1_ten_words_in_reference_order": [w.lower() for w, _, _ in words] == reference["words"],
    "G2_starts_non_decreasing_and_ends_after_starts": all(
        end > begin and (index == 0 or begin >= words[index - 1][1]) for index, (_, begin, end) in enumerate(words)
    ),
    f"G3_at_least_{MIN_WORDS_WITHIN_TOLERANCE}_starts_within_{MAX_START_ERROR_S}s": within >= MIN_WORDS_WITHIN_TOLERANCE,
    "G4_timings_identical_across_runs_to_1ms": to_ms(runs[0]) == to_ms(runs[1]),
}
write_json("checks.json", {
    "gates": gates,
    "pass": all(gates.values()),
    "thresholds": {"maxStartErrorS": MAX_START_ERROR_S, "minWordsWithinTolerance": MIN_WORDS_WITHIN_TOLERANCE},
    "observed": {
        "wordsWithinTolerance": within,
        "meanAbsStartErrorS": round(sum(errors) / len(errors), 2),
        "maxAbsStartErrorS": round(max(errors), 2),
    },
})
write_json("alignment.json", [
    {"word": w, "start": round(b, 2), "end": round(e, 2), "referenceStart": round(r, 2)}
    for (w, b, e), r in zip(words, reference["referenceStartsS"])
])
failed = [name for name, passed in gates.items() if not passed]
if failed:
    print("KNOWN FAIL: gated checks failed: " + ", ".join(failed), file=sys.stderr)
