"""Check ttconv caption conversions against predeclared cue values.

Usage: check.py VTT TTML ROUNDTRIP_SRT RERUN_VTT
Prints JSON to stdout and exits 1 when any gating check fails.
Standard library only. The predeclared values are the constants below,
not values read back from the converter's output.
"""
import hashlib
import json
import re
import sys
import xml.etree.ElementTree as ElementTree

TTML_NAMESPACE = "http://www.w3.org/ns/ttml"
TTML_STYLING_NAMESPACE = "http://www.w3.org/ns/ttml#styling"

# Predeclared cues: (begin ms, end ms, lines). Cue 2 has two lines; cue 3 has italics.
PREDECLARED_CUES = [
    (1000, 2500, ["Hello, world."]),
    (3120, 5040, ["First line of the caption", "second line here"]),
    (5500, 7250, ["This is <i>italic</i> text."]),
]
PREDECLARED_ITALIC_TEXT = "italic"
PREDECLARED_ITALIC_CUE_INDEX = 2

TIMING_PATTERN = re.compile(r"(\d{2}):(\d{2}):(\d{2})[.,](\d{3})")


def parse_milliseconds(text):
    match = TIMING_PATTERN.fullmatch(text.strip())
    if match is None:
        raise ValueError(f"not an hh:mm:ss.mmm timing: {text!r}")
    hours, minutes, seconds, milliseconds = (int(part) for part in match.groups())
    return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds


def read_file_text(path):
    with open(path, encoding="utf-8") as text_file:
        return text_file.read()


def parse_vtt_cues(vtt_text):
    blocks = [block for block in re.split(r"\n\s*\n", vtt_text.replace("\r\n", "\n")) if "-->" in block]
    cues = []
    for block in blocks:
        lines = block.strip("\n").split("\n")
        timing_index = next(index for index, line in enumerate(lines) if "-->" in line)
        begin_text, end_text = (part.strip() for part in lines[timing_index].split("-->"))
        cues.append((parse_milliseconds(begin_text), parse_milliseconds(end_text), lines[timing_index + 1:]))
    return cues


def parse_srt_cues(srt_text):
    blocks = [block for block in re.split(r"\n\s*\n", srt_text.replace("\r\n", "\n").strip()) if block.strip()]
    cues = []
    for block in blocks:
        lines = block.split("\n")
        timing_index = next(index for index, line in enumerate(lines) if "-->" in line)
        begin_text, end_text = (part.strip() for part in lines[timing_index].split("-->"))
        cues.append((parse_milliseconds(begin_text), parse_milliseconds(end_text), lines[timing_index + 1:]))
    return cues


def cue_timings(cues):
    return [(begin, end) for begin, end, _ in cues]


def cue_lines(cues):
    return [lines for _, _, lines in cues]


def collect_paragraph_lines(element, lines, italic_spans):
    """Walk a TTML paragraph in document order; <br/> starts a new line."""
    if element.tag == f"{{{TTML_NAMESPACE}}}br":
        lines.append("")
        return
    if element.text:
        lines[-1] += element.text
    if element.tag == f"{{{TTML_NAMESPACE}}}span" and element.get(f"{{{TTML_STYLING_NAMESPACE}}}fontStyle") == "italic":
        italic_spans.append("".join(element.itertext()))
    for child in element:
        collect_paragraph_lines(child, lines, italic_spans)
        if child.tail:
            lines[-1] += child.tail


def check_ttml(ttml_path):
    """Return (well_formed, namespace_ok, cues, parse_error); cues are (begin, end, lines, italic_spans)."""
    try:
        root = ElementTree.parse(ttml_path).getroot()
    except ElementTree.ParseError as parse_error:
        return False, False, [], str(parse_error)
    namespace_ok = root.tag == f"{{{TTML_NAMESPACE}}}tt"
    cues = []
    for paragraph in root.iter(f"{{{TTML_NAMESPACE}}}p"):
        lines = [""]
        italic_spans = []
        collect_paragraph_lines(paragraph, lines, italic_spans)
        cues.append((parse_milliseconds(paragraph.get("begin", "")), parse_milliseconds(paragraph.get("end", "")), lines, italic_spans))
    return True, namespace_ok, cues, None


def strip_italic_markup(line):
    """TTML carries italics as a span, so its text has no <i> tags."""
    return line.replace("<i>", "").replace("</i>", "")


def cue_lines_at(cues, index):
    return cues[index][2] if index < len(cues) else None


def build_checks(vtt_path, ttml_path, roundtrip_srt_path, rerun_vtt_path):
    checks = {}
    vtt_cues = parse_vtt_cues(read_file_text(vtt_path))
    checks["vtt_cue_count"] = len(vtt_cues) == len(PREDECLARED_CUES)
    checks["vtt_timings_ms"] = cue_timings(vtt_cues) == [(b, e) for b, e, _ in PREDECLARED_CUES]
    checks["vtt_text_lines"] = cue_lines(vtt_cues) == [lines for _, _, lines in PREDECLARED_CUES]
    checks["vtt_line_break_preserved"] = len(vtt_cues[1][2]) == 2
    checks["vtt_italic_markup"] = any(
        "<i>" + PREDECLARED_ITALIC_TEXT + "</i>" in line for line in vtt_cues[PREDECLARED_ITALIC_CUE_INDEX][2]
    )

    well_formed, namespace_ok, ttml_cues, ttml_error = check_ttml(ttml_path)
    checks["ttml_well_formed_xml"] = well_formed
    checks["ttml_namespace"] = namespace_ok
    checks["ttml_cue_count"] = len(ttml_cues) == len(PREDECLARED_CUES)
    checks["ttml_timings_ms"] = [(b, e) for b, e, _, _ in ttml_cues] == [(b, e) for b, e, _ in PREDECLARED_CUES]
    checks["ttml_text_lines"] = [lines for _, _, lines, _ in ttml_cues] == [
        [strip_italic_markup(line) for line in lines] for _, _, lines in PREDECLARED_CUES
    ]
    checks["ttml_line_break_preserved"] = len(cue_lines_at(ttml_cues, 1) or []) == 2
    checks["ttml_italic_span"] = (
        len(ttml_cues) > PREDECLARED_ITALIC_CUE_INDEX
        and ttml_cues[PREDECLARED_ITALIC_CUE_INDEX][3] == [PREDECLARED_ITALIC_TEXT]
    )

    roundtrip_cues = parse_srt_cues(read_file_text(roundtrip_srt_path))
    checks["roundtrip_srt_cue_count"] = len(roundtrip_cues) == len(PREDECLARED_CUES)
    checks["roundtrip_srt_timings_ms"] = cue_timings(roundtrip_cues) == [(b, e) for b, e, _ in PREDECLARED_CUES]
    checks["roundtrip_srt_text_lines"] = cue_lines(roundtrip_cues) == [lines for _, _, lines in PREDECLARED_CUES]

    checks["rerun_vtt_identical"] = sha256_of(rerun_vtt_path) == sha256_of(vtt_path)
    measured = {
        "vtt_sha256": sha256_of(vtt_path),
        "ttml_sha256": sha256_of(ttml_path),
        "roundtrip_srt_sha256": sha256_of(roundtrip_srt_path),
        "ttml_parse_error": ttml_error,
    }
    return checks, measured


def sha256_of(path):
    with open(path, "rb") as file_handle:
        return hashlib.sha256(file_handle.read()).hexdigest()


def main(argument_paths):
    if len(argument_paths) != 4:
        sys.exit("usage: check.py VTT TTML ROUNDTRIP_SRT RERUN_VTT")
    checks, measured = build_checks(*argument_paths)
    report = {"checks": checks, "measured": measured, "all_gating_checks_pass": all(checks.values())}
    json.dump(report, sys.stdout, indent=2, sort_keys=True)
    print()
    return 0 if report["all_gating_checks_pass"] else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
