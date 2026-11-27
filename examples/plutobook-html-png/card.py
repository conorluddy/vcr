"""PlutoBook fixture: HTML+CSS title card to 1920x1080 PNG, one frame per t."""
import hashlib, json, os, random, subprocess
import plutoprint

assert plutoprint.__version__ == "0.24.0", plutoprint.__version__
out = "output"
os.makedirs(out, exist_ok=True)
W, H = 1920, 1080


def html(t, script=False):
    x = round(120 + 1200 * t)  # bar slides with t; the page is a pure function of t
    js = "<script>document.getElementById('js').textContent='JS RAN'</script>" if script else ""
    return f"""<!doctype html><html><head><style>
html,body{{margin:0;width:{W}px;height:{H}px}}
body{{background:#0b1e3a;color:#fff;font-family:sans-serif;
  display:flex;flex-direction:column;justify-content:center;padding:0 120px;box-sizing:border-box}}
h1{{font-size:150px;margin:0;letter-spacing:-2px}}
p{{font-size:48px;margin:24px 0 0;opacity:.85;max-width:1200px;line-height:1.3}}
.bar{{position:absolute;left:{x}px;top:900px;width:200px;height:40px;background:#ff3366;border-radius:20px}}
.chip{{position:absolute;left:0;top:0;width:100px;height:100px;background:#ffcc00}}
</style></head><body><div class="chip"></div><h1>Title Card</h1>
<p>Real HTML and CSS: flexbox, rounded corners and wrapped text at frame <span id="js">{round(t, 2)}</span>.</p>
<div class="bar"></div>{js}</body></html>"""


def render(t, path, script=False):
    book = plutoprint.Book(plutoprint.PAGE_SIZE_NONE, plutoprint.PAGE_MARGINS_NONE)
    book.load_html(html(t, script))
    book.write_to_png(path, W, H)


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def pixel(path, x, y):
    return subprocess.check_output(
        ["magick", path, "-format", f"%[hex:p{{{x},{y}}}]", "info:"], text=True)[:6]


checks = {}
times = [0.0, 0.25, 0.5, 0.75, 1.0]
for i, t in enumerate(times):
    render(t, f"{out}/frame_{i}.png")
hashes = [sha(f"{out}/frame_{i}.png") for i in range(len(times))]
order = list(range(len(times)))
random.Random(7).shuffle(order)
for i in order:
    render(times[i], f"{out}/shuffled_{i}.png")
shuffled = [sha(f"{out}/shuffled_{i}.png") for i in range(len(times))]

dims = subprocess.check_output(["magick", "identify", "-format", "%wx%h", f"{out}/frame_0.png"], text=True)
checks["dimensions_1920x1080"] = dims == "1920x1080"
checks["shuffled_equals_sequential"] = hashes == shuffled
checks["frames_all_distinct"] = len(set(hashes)) == len(times)
checks["css_position_and_colour"] = (
    pixel(f"{out}/frame_0.png", 50, 50) == "FFCC00"
    and pixel(f"{out}/frame_0.png", 220, 920) == "FF3366"
    and pixel(f"{out}/frame_4.png", 220, 920) != "FF3366")
checks["background_painted"] = pixel(f"{out}/frame_0.png", 1900, 20) == "0B1E3A"
light = subprocess.check_output(
    ["magick", f"{out}/frame_0.png", "-crop", "1500x500+120+300", "-fuzz", "10%", "-fill", "black",
     "+opaque", "white", "-fill", "white", "-opaque", "white", "-format", "%[fx:mean>0.01?1:0]", "info:"], text=True)
checks["text_drawn_in_title_area"] = light == "1"

# Observation, not gate (finding from the first run): is a CSS gradient painted?
grad = f"{out}/gradient.png"
book = plutoprint.Book(plutoprint.PAGE_SIZE_NONE, plutoprint.PAGE_MARGINS_NONE)
book.load_html("<body style='background:linear-gradient(135deg,#0b1e3a,#1d6f6f)'>x</body>")
book.write_to_png(grad, W, H)
gradient_painted = pixel(grad, 1900, 20) != "000000" or subprocess.check_output(
    ["magick", grad, "-format", "%[hex:p{1900,20}]", "info:"], text=True) != "00000000"

# Observation, not gate: does inline JavaScript run?
render(0.0, f"{out}/script.png", script=True)
javascript_executes = sha(f"{out}/script.png") != hashes[0]
metrics = {
    "plutoprint": plutoprint.__version__,
    "plutobook": plutoprint.PLUTOBOOK_VERSION_STRING,
    "frame_sha256": hashes,
    "javascript_executes": javascript_executes,
    "gradient_painted": gradient_painted,
    "checks": checks,
    "all_passed": all(checks.values()),
}
print(json.dumps(metrics, indent=2))
