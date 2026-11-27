"""pixelsort fixture. Prints metrics JSON to stdout; images go to output/."""
import colorsys
import hashlib
import json
import os
import random
import subprocess
import sys
from importlib.metadata import version

from PIL import Image, ImageDraw

W, H = 240, 135
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "output")


def make_input():
    """Colour ramps, three shapes and seeded speckle: deterministic, no external files."""
    rng = random.Random(1234)
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        for x in range(W):
            px[x, y] = (int(255 * x / W), int(255 * y / H), int(255 * (1 - x / W)))
    d = ImageDraw.Draw(img)
    d.ellipse((30, 20, 110, 100), fill=(240, 200, 30))
    d.rectangle((140, 30, 210, 110), fill=(20, 20, 60))
    d.polygon([(100, 130), (170, 60), (230, 130)], fill=(230, 60, 90))
    for _ in range(1500):
        px[rng.randrange(W), rng.randrange(H)] = tuple(rng.randrange(256) for _ in range(3))
    return img


def rgb(image):
    return [[image.getpixel((x, y))[:3] for x in range(image.width)] for y in range(image.height)]


def sha(image):
    return hashlib.sha256(image.convert("RGBA").tobytes()).hexdigest()


# Independent keys, not imported from pixelsort.
def lightness(p):
    return (min(p) + max(p)) / 2.0


def hue(p):
    return colorsys.rgb_to_hls(p[0] / 255, p[1] / 255, p[2] / 255)[0]


def nondecreasing(values, tolerance=0.0):
    return all(b >= a - tolerance for a, b in zip(values, values[1:]))


def threshold_segments(row, lower, upper):
    cuts = [x for x, p in enumerate(row) if lightness(p) < lower * 255 or lightness(p) > upper * 255]
    bounds = [0] + cuts + [len(row)]
    return [(a, b) for a, b in zip(bounds, bounds[1:]) if b > a]


def seeded_random_hash(seed):
    from pixelsort import pixelsort
    random.seed(seed)
    return sha(pixelsort(make_input(), interval_function="random", char_length=20, randomness=30))


def main():
    from pixelsort import pixelsort
    src = make_input()
    src_rgb = rgb(src)
    checks, metrics = {}, {}

    checks["versions"] = version("pixelsort") == "1.0.2" and version("Pillow") == "10.4.0"
    metrics["input_sha256"] = sha(src)

    # threshold + lightness: every span sorted, row pixel multiset kept, image changed
    lo, hi = 0.25, 0.8
    out = pixelsort(src, interval_function="threshold", lower_threshold=lo, upper_threshold=hi,
                    sorting_function="lightness")
    out_rgb = rgb(out)
    spans = bad_spans = bad_perm = 0
    for y in range(H):
        if sorted(out_rgb[y]) != sorted(src_rgb[y]):
            bad_perm += 1
        for a, b in threshold_segments(src_rgb[y], lo, hi):
            spans += 1
            if not nondecreasing([lightness(p) for p in out_rgb[y][a:b]]):
                bad_spans += 1
    changed = sum(src_rgb[y][x] != out_rgb[y][x] for y in range(H) for x in range(W))
    metrics["threshold"] = {"spans": spans, "unsorted_spans": bad_spans, "rows_not_permutation": bad_perm,
                            "pixels_changed": changed, "sha256": sha(out)}
    checks["threshold_spans_sorted_by_lightness"] = bad_spans == 0 and bad_perm == 0 and changed > 0
    out.save(os.path.join(OUT, "threshold.png"))

    # interval none + hue: whole rows non-decreasing in hue
    hue_out = pixelsort(src, interval_function="none", sorting_function="hue")
    unsorted_rows = sum(not nondecreasing([hue(p) for p in row], 1e-9) for row in rgb(hue_out))
    metrics["hue_none"] = {"unsorted_rows": unsorted_rows, "sha256": sha(hue_out)}
    checks["none_rows_sorted_by_hue"] = unsorted_rows == 0
    hue_out.save(os.path.join(OUT, "hue.png"))

    # mask: left half sortable, right half untouched
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).rectangle((0, 0, W // 2 - 1, H - 1), fill=255)
    masked = rgb(pixelsort(src, mask_image=mask, interval_function="none", sorting_function="lightness"))
    right_changed = sum(masked[y][x] != src_rgb[y][x] for y in range(H) for x in range(W // 2, W))
    left_sorted = all(nondecreasing([lightness(p) for p in masked[y][:W // 2]]) for y in range(H))
    metrics["mask"] = {"right_half_pixels_changed": right_changed, "left_rows_sorted": left_sorted}
    checks["mask_protects_unmasked_pixels"] = right_changed == 0 and left_sorted

    # angle 90: size kept, each column monotone in lightness from one end
    ang = rgb(pixelsort(src, interval_function="none", sorting_function="lightness", angle=90))
    cols = [[ang[y][x] for y in range(H)] for x in range(W)]
    top_down = sum(nondecreasing([lightness(p) for p in c]) for c in cols)
    bottom_up = sum(nondecreasing([lightness(p) for p in c[::-1]]) for c in cols)
    metrics["angle_90"] = {"size": [len(ang[0]), len(ang)], "columns_sorted_top_down": top_down,
                           "columns_sorted_bottom_up": bottom_up}
    checks["angle_90_sorts_columns"] = metrics["angle_90"]["size"] == [W, H] and max(top_down, bottom_up) == W

    # CLI equals API for the same options
    src.save(os.path.join(OUT, "input.png"))
    cli_png = os.path.join(OUT, "cli.png")
    subprocess.run([sys.executable, "-m", "pixelsort", os.path.join(OUT, "input.png"), "-o", cli_png,
                    "-i", "threshold", "-t", str(lo), "-u", str(hi), "-s", "lightness"],
                   check=True, capture_output=True)
    checks["cli_matches_api"] = sha(Image.open(cli_png)) == metrics["threshold"]["sha256"]

    # randomness=100 leaves everything unsorted
    checks["randomness_100_is_identity"] = sha(pixelsort(src, interval_function="threshold", randomness=100)) == sha(src)

    # random intervals: seeded runs repeat across processes; unseeded CLI runs differ
    child = [subprocess.run([sys.executable, __file__, "--seeded", "7"], check=True, capture_output=True,
                            text=True).stdout.strip() for _ in range(2)]
    other_seed = seeded_random_hash(8)
    metrics["random"] = {"seed7_sha256": child[0], "seed8_sha256": other_seed}
    checks["seeded_random_repeats_across_processes"] = child[0] == child[1] and child[0] != other_seed
    cli_hashes = []
    for i in range(2):
        p = os.path.join(OUT, f"cli_random_{i}.png")
        subprocess.run([sys.executable, "-m", "pixelsort", os.path.join(OUT, "input.png"), "-o", p,
                        "-i", "random", "-c", "20"], check=True, capture_output=True)
        cli_hashes.append(sha(Image.open(p)))
    checks["cli_random_is_unseeded"] = cli_hashes[0] != cli_hashes[1]

    sheet = Image.new("RGB", (W * 3 + 20, H * 2 + 10), (30, 30, 30))
    for i, name in enumerate(["input", "threshold", "hue", "cli_random_0"]):
        sheet.paste(Image.open(os.path.join(OUT, name + ".png")).convert("RGB"),
                    ((i % 3) * (W + 10), (i // 3) * (H + 10)))
    sheet.save(os.path.join(OUT, "sheet.png"))

    print(json.dumps({"checks": checks, "metrics": metrics, "all_passed": all(checks.values())},
                     indent=2, sort_keys=True))


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "--seeded":
        print(seeded_random_hash(int(sys.argv[2])))
    else:
        os.makedirs(OUT, exist_ok=True)
        main()
