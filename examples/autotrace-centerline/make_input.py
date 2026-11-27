#!/usr/bin/env python3
"""Generate two 200x200 greyscale PNGs with known geometry (Pillow, no randomness)."""
from pathlib import Path
from PIL import Image, ImageDraw

out = Path(__file__).parent / "output"
out.mkdir(exist_ok=True)

solid = Image.new("L", (200, 200), 255)
d = ImageDraw.Draw(solid)
d.ellipse((20, 20, 90, 90), fill=0)
d.rectangle((110, 20, 180, 90), fill=0)
d.polygon([(100, 110), (180, 190), (20, 190)], fill=0)
solid.save(out / "solid.png")

strokes = Image.new("L", (200, 200), 255)
d = ImageDraw.Draw(strokes)
d.ellipse((30, 30, 90, 90), outline=0, width=8)  # ring
d.line((110, 40, 180, 40), fill=0, width=8)  # horizontal bar
d.line((145, 20, 145, 80), fill=0, width=8)  # vertical bar
d.line((30, 130, 170, 170), fill=0, width=8)  # diagonal
strokes.save(out / "strokes.png")
