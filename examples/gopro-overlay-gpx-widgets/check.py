"""Render the GPX-only overlay twice, then check frames, alpha and the drawn numbers."""
import hashlib
import json
import subprocess
import sys
from importlib.metadata import version
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE / "output"
BIN = Path(sys.executable).parent
FRAMES_TO_READ = {0: 0, 5: 150, 10: 300}  # seconds into the track -> output frame (30 fps)
REGIONS = {"speed": (10, 50, 310, 180), "hr": (340, 50, 640, 180), "alt": (10, 240, 310, 350)}
EXPECTED = {"speed": [36, 36, 36], "hr": [120, 130, 140], "alt": [100, 110, 120]}


def run(*args) -> str:
    return subprocess.run([str(a) for a in args], check=True, capture_output=True, text=True).stdout


def render(name: str) -> Path:
    target = OUT / f"{name}.mov"
    cfg = OUT / "cfg"
    cfg.mkdir(parents=True, exist_ok=True)
    (cfg / "ffmpeg-profiles.json").write_text(
        json.dumps({"qtrle": {"input": [], "output": ["-vcodec", "qtrle", "-pix_fmt", "argb"]}}))
    run(BIN / "gopro-dashboard.py", "--use-gpx-only", "--gpx", HERE / "track.gpx",
        "--overlay-size", "640x360", "--layout", "xml", "--layout-xml", HERE / "layout.xml",
        "--font", "Arial.ttf", "--profile", "qtrle", "--config-dir", cfg, "--cache-dir", OUT / "cache", target)
    return target


def frame_hashes(movie: Path) -> list[str]:
    lines = run("ffmpeg", "-v", "error", "-i", movie, "-f", "framemd5", "-").splitlines()
    return [line.split(",")[-1].strip() for line in lines if line and not line.startswith("#")]


def extract_frame(movie: Path, index: int, name: str) -> Image.Image:
    path = OUT / f"{name}.png"
    run("ffmpeg", "-v", "error", "-y", "-i", movie, "-vf", f"select=eq(n\\,{index})", "-frames:v", "1", path)
    return Image.open(path).convert("RGBA")


def read_number(frame: Image.Image, box: tuple[int, int, int, int]) -> int | None:
    black = Image.new("RGBA", frame.size, (0, 0, 0, 255))
    crop = Image.alpha_composite(black, frame).crop(box).convert("L").point(lambda v: 255 - v)
    padded = Image.new("L", (crop.width + 40, crop.height + 40), 255)
    padded.paste(crop, (20, 20))
    padded.save(OUT / "ocr.png")
    text = run("tesseract", OUT / "ocr.png", "-", "--psm", "8", "-c", "tessedit_char_whitelist=0123456789").strip()
    return int(text) if text.isdigit() else None


def digest(frame: Image.Image, box: tuple[int, int, int, int]) -> str:
    return hashlib.md5(frame.crop(box).tobytes()).hexdigest()


first, second = render("first"), render("second")
hashes_first, hashes_second = frame_hashes(first), frame_hashes(second)
probe = json.loads(run("ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                       "stream=codec_name,pix_fmt,width,height,r_frame_rate,nb_frames", "-of", "json", first))["streams"][0]
frames = {s: extract_frame(first, i, f"t{s}") for s, i in FRAMES_TO_READ.items()}
read = {key: [read_number(frames[s], box) for s in FRAMES_TO_READ] for key, box in REGIONS.items()}
alphas = list(frames[5].getchannel("A").getdata())
label_hashes = {digest(frames[s], (20, 10, 140, 44)) for s in FRAMES_TO_READ}
bar_hashes = {digest(frames[s], (340, 240, 620, 280)) for s in FRAMES_TO_READ}

checks = {
    "version_0_134_0": version("gopro-overlay") == "0.134.0",
    "stream_640x360_qtrle_argb": (probe["width"], probe["height"], probe["codec_name"], probe["pix_fmt"]) == (640, 360, "qtrle", "argb"),
    "frame_count_303": len(hashes_first) == 303 and probe["nb_frames"] == "303",
    "two_renders_identical_frames": hashes_first == hashes_second,
    "distinct_frames_101": len(set(hashes_first)) == 101,
    "corner_transparent": frames[5].getpixel((0, 0))[3] == 0,
    "has_opaque_pixels": max(alphas) == 255,
    "numbers_match_gpx": read == EXPECTED,
    "static_label_unchanged": len(label_hashes) == 1,
    "bar_changes_with_hr": len(bar_hashes) == 3,
}
print(json.dumps({
    "probe": probe, "distinct_frames": len(set(hashes_first)), "numbers_read": read,
    "opaque_fraction_t5": round(sum(1 for a in alphas if a) / len(alphas), 4),
    "checks": checks, "all_passed": all(checks.values()),
}, indent=1))
