"""Speech bursts at known times; an SRT shifted by a known offset must be corrected by ffsubsync."""
import json, subprocess, sys, wave
from pathlib import Path
import pysubs2

OUT = Path("output/work"); OUT.mkdir(parents=True, exist_ok=True)
PHRASES = ["Welcome to the show", "Today we are talking about subtitles", "Timing matters a great deal",
           "Late captions are annoying", "Early captions are worse", "Let us fix the offset", "Thanks for watching everyone"]
STARTS_S = [2.0, 6.0, 10.5, 14.0, 18.5, 22.0, 26.0]
TOLERANCE_S = 0.25  # predeclared: every cue start and end within this of the truth
OFFSETS_S = [3.0, -1.5]  # captions late, then early
# Each offset runs with the default flags (checked first, kept even though it fails) and with a bounded search.
VARIANTS = {"default": [], "max10": ["--max-offset-seconds", "10"]}
VENV_BIN = Path(sys.executable).parent


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def synth():
    """Speech from macOS `say`, resampled to 16 kHz mono and placed at STARTS_S on a 30 s track."""
    durations = []
    for index, phrase in enumerate(PHRASES):
        run(["say", "-v", "Samantha", "-o", str(OUT / f"p{index}.aiff"), phrase])
        run(["ffmpeg", "-v", "error", "-y", "-i", str(OUT / f"p{index}.aiff"), "-ar", "16000", "-ac", "1", str(OUT / f"p{index}.wav")])
        with wave.open(str(OUT / f"p{index}.wav")) as clip:
            durations.append(clip.getnframes() / clip.getframerate())
    inputs = [a for index in range(len(PHRASES)) for a in ("-i", str(OUT / f"p{index}.wav"))]
    delays = ";".join(f"[{i}]adelay={int(s * 1000)}[d{i}]" for i, s in enumerate(STARTS_S))
    mix = "".join(f"[d{i}]" for i in range(len(STARTS_S))) + f"amix=inputs={len(STARTS_S)}:normalize=0,apad=whole_dur=30[o]"
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", f"{delays};{mix}", "-map", "[o]", "-ar", "16000", "-ac", "1", str(OUT / "speech.wav")])
    return durations


def write_srt(path, offset_s, durations):
    subs = pysubs2.SSAFile()
    for index, (start, duration) in enumerate(zip(STARTS_S, durations)):
        subs.append(pysubs2.SSAEvent(start=pysubs2.make_time(s=start + offset_s), end=pysubs2.make_time(s=start + duration + offset_s), text=PHRASES[index]))
    subs.save(str(path))


durations = synth()
cases, checks = [], []
for offset_s in OFFSETS_S:
    for variant, flags in VARIANTS.items():
        name = f"off{offset_s:+.1f}-{variant}"
        bad, fixed = OUT / f"{name}.srt", OUT / f"{name}.fixed.srt"
        write_srt(bad, offset_s, durations)
        log = subprocess.run([str(VENV_BIN / "ffsubsync"), str(OUT / "speech.wav"), "-i", str(bad), "-o", str(fixed), *flags], capture_output=True, text=True)
        fixed_events = pysubs2.load(str(fixed)) if fixed.exists() else []
        errors = [round(max(abs(event.start / 1000 - start), abs(event.end / 1000 - (start + duration))), 2)
                  for event, start, duration in zip(fixed_events, STARTS_S, durations)]
        worst = max(errors) if len(fixed_events) == len(STARTS_S) else None
        checks.append({"name": f"{name}: 7 cues back, worst error <= {TOLERANCE_S} s", "pass": worst is not None and worst <= TOLERANCE_S})
        cases.append({"name": name, "exit": log.returncode, "cue_count": len(fixed_events), "worst_error_s": worst, "per_cue_error_s": errors})
print(json.dumps({"ffsubsync": "0.5.1", "tolerance_s": TOLERANCE_S, "cases": cases, "checks": checks, "all_passed": all(c["pass"] for c in checks)}, indent=2))
