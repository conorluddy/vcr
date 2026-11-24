"""Render a hand-written Vega-Lite bar chart to SVG and PNG with vl-convert.

Usage: generate.py OUTPUT_DIRECTORY NAME
Writes NAME.vl.json (the spec), NAME.svg and NAME.png. The data is inline, so
the spec references no URL and no file.
"""
import json
import os
import sys

import vl_convert as vlc

VEGA_LITE_VERSION = "5.21"
CHART_WIDTH_PX = 320
CHART_HEIGHT_PX = 200
PNG_SCALE = 2
CHART_TITLE = "Quarterly signups by channel"
CHANNEL_SIGNUPS = [
    ("Email", 28),
    ("Search", 55),
    ("Social", 43),
    ("Referral", 91),
    ("Direct", 70),
]
SCALE_DOMAIN_MAXIMUM = 100


def build_chart_spec() -> dict[str, object]:
    return {
        "title": CHART_TITLE,
        "width": CHART_WIDTH_PX,
        "height": CHART_HEIGHT_PX,
        "autosize": {"type": "fit", "contains": "padding"},
        "data": {
            "values": [
                {"channel": channel, "signups": signups}
                for channel, signups in CHANNEL_SIGNUPS
            ]
        },
        "mark": "bar",
        "encoding": {
            "x": {"field": "channel", "type": "nominal", "axis": {"labelAngle": 0}},
            "y": {
                "field": "signups",
                "type": "quantitative",
                "scale": {"domain": [0, SCALE_DOMAIN_MAXIMUM], "zero": True},
            },
        },
    }


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("Usage: generate.py OUTPUT_DIRECTORY NAME", file=sys.stderr)
        return 2
    output_directory, name = argv[1], argv[2]
    os.makedirs(output_directory, exist_ok=True)
    spec = build_chart_spec()
    svg_text = vlc.vegalite_to_svg(spec, vl_version=VEGA_LITE_VERSION)
    png_bytes = vlc.vegalite_to_png(spec, vl_version=VEGA_LITE_VERSION, scale=PNG_SCALE)
    with open(os.path.join(output_directory, f"{name}.vl.json"), "w", encoding="utf-8") as spec_file:
        json.dump(spec, spec_file, indent=2, sort_keys=True)
    with open(os.path.join(output_directory, f"{name}.svg"), "w", encoding="utf-8") as svg_file:
        svg_file.write(svg_text)
    with open(os.path.join(output_directory, f"{name}.png"), "wb") as png_file:
        png_file.write(png_bytes)
    print(f"wrote {name}.svg and {name}.png to {output_directory}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
