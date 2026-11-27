"""pysubs2 fixture: author ASS from code, convert SRT to ASS, retime, reload."""
import hashlib, json, os, subprocess, sys
import pysubs2

assert pysubs2.__version__ == "1.9.1", pysubs2.__version__
out = "output"
os.makedirs(out, exist_ok=True)
checks = {}

# 1. Author an ASS file from code: one custom style, two events with override tags.
subs = pysubs2.SSAFile()
subs.info["PlayResX"] = "1920"
subs.info["PlayResY"] = "1080"
subs.styles["Kinetic"] = pysubs2.SSAStyle(
    fontname="Inter", fontsize=72, primarycolor=pysubs2.Color(255, 220, 0), bold=True,
    outline=3, alignment=pysubs2.Alignment.BOTTOM_CENTER)
subs.append(pysubs2.SSAEvent(start=1000, end=3500, style="Kinetic",
    text=r"{\an8\fad(200,200)}Second line\NTwo rows"))
subs.append(pysubs2.SSAEvent(start=4000, end=6000, style="Kinetic",
    text=r"{\k50}Ka{\k50}ra{\k100}oke"))
authored = f"{out}/authored.ass"
subs.save(authored)
text = open(authored, encoding="utf-8").read()
reloaded = pysubs2.load(authored)
checks["ass_has_style_and_events"] = (
    "Style: Kinetic,Inter,72," in text and text.count("Dialogue:") == 2)
checks["ass_play_res"] = "PlayResX: 1920" in text and "PlayResY: 1080" in text
checks["override_tags_survive_reload"] = (
    reloaded[0].text == r"{\an8\fad(200,200)}Second line\NTwo rows"
    and reloaded[1].text == r"{\k50}Ka{\k50}ra{\k100}oke")
checks["timings_ms_survive_reload"] = [(e.start, e.end) for e in reloaded] == [(1000, 3500), (4000, 6000)]
checks["style_survives_reload"] = (
    reloaded.styles["Kinetic"].fontsize == 72 and reloaded.styles["Kinetic"].bold is True)

# 2. Convert a hand-written SRT to ASS and retime with shift.
srt_path = "input.srt"
converted = pysubs2.load(srt_path)
converted.shift(s=2.5)
converted.save(f"{out}/converted.ass")
back = pysubs2.load(f"{out}/converted.ass")
checks["srt_three_cues"] = len(back) == 3
checks["shift_plus_2500_ms"] = [(e.start, e.end) for e in back] == [
    (3500, 5000), (5620, 7540), (8000, 9750)]
checks["srt_line_break_becomes_ass_N"] = back[1].text == r"Second\Nline"
checks["srt_italic_becomes_tag"] = back[2].text.startswith(r"{\i1}Italic{\i0}")

# 3. CLI: convert to WebVTT with -o DIR, so the input stays untouched.
cli_dir = f"{out}/cli"
subprocess.run([sys.executable, "-m", "pysubs2", "--to", "vtt", "-o", cli_dir, srt_path], check=True)
vtt_text = open(f"{cli_dir}/input.vtt", encoding="utf-8").read()
checks["cli_vtt_header_and_cue"] = vtt_text.startswith("WEBVTT") and "00:00:01.000 --> 00:00:02.500" in vtt_text
checks["cli_left_input_unchanged"] = open(srt_path, encoding="utf-8").read().startswith("1\n00:00:01,000")

sha = lambda p: hashlib.sha256(open(p, "rb").read()).hexdigest()
result = {
    "pysubs2": pysubs2.__version__,
    "authored_ass_sha256": sha(authored),
    "converted_ass_sha256": sha(f"{out}/converted.ass"),
    "checks": checks,
    "all_passed": all(checks.values()),
}
print(json.dumps(result, indent=2, sort_keys=True))
