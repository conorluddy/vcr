# Engrave score.musicxml to SVG with Verovio's Python module and print facts a script can diff.
import hashlib, json, re, sys
import verovio

tk = verovio.toolkit()
tk.setOptions({"pageWidth": 1800, "pageHeight": 700, "scale": 100, "adjustPageHeight": True, "svgViewBox": True, "xmlIdSeed": 1})
if not tk.loadFile("score.musicxml"):
    sys.exit("loadFile failed: " + tk.getLog())
svg = tk.renderToSVG(1)
open("output/score.svg", "w").write(svg)
count = lambda p: len(re.findall(p, svg))
timemap = tk.renderToTimemap()
metrics = {
    "verovio_version": tk.getVersion(),
    "pages": tk.getPageCount(),
    "measures": count(r'class="measure"'),
    "notes": count(r'class="note"'),
    "noteheads": count(r'class="notehead"'),
    "textElements": count(r"<text\b"),
    "timemapNoteOns": sum(len(e.get("on", [])) for e in timemap),
    "sha256": hashlib.sha256(svg.encode()).hexdigest(),
}
print(json.dumps(metrics, indent=2))
