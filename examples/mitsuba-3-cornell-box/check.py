"""Render a built-in Cornell box with Mitsuba scalar_rgb and print predeclared checks as JSON."""
import json, sys
import numpy as np
import mitsuba as mi

mi.set_variant("scalar_rgb")
SIZE, SPP, SEED = 96, 16, 7


def render(seed, spp=SPP):
    scene = mi.load_dict(mi.cornell_box())
    params = mi.traverse(scene)
    params["sensor.film.size"] = [SIZE, SIZE]
    params.update()
    return np.array(mi.render(scene, spp=spp, seed=seed))


def rmse(x, y):
    return float(np.sqrt(((x - y) ** 2).mean()))


a = render(SEED)
b = render(SEED)
c = render(SEED + 1)
reference = render(SEED, spp=256)
other_seed_low = render(SEED + 2)
other_seed_high = render(SEED + 2, spp=256)
mean = a.mean(axis=(0, 1))
left = a[:, : SIZE // 4].mean(axis=(0, 1))
right = a[:, -SIZE // 4 :].mean(axis=(0, 1))

if len(sys.argv) > 1:
    mi.Bitmap(a).convert(mi.Bitmap.PixelFormat.RGB, mi.Struct.Type.UInt8, srgb_gamma=True).write(sys.argv[1])
if len(sys.argv) > 2:
    np.save(sys.argv[2], a)

checks = {
    "version_3_9_1": mi.__version__ == "3.9.1",
    "shape_96x96x3": list(a.shape) == [SIZE, SIZE, 3],
    "finite": bool(np.isfinite(a).all()),
    "same_seed_bitwise_identical_in_process": bool(np.array_equal(a, b)),
    # added after the first run showed the bitwise check failing; it does not replace it
    "same_seed_max_abs_diff_below_1e-6_in_process": float(np.abs(a - b).max()) < 1e-6,
    "different_seed_differs": not np.array_equal(a, c),
    "left_wall_red_right_wall_green": bool(left[0] > left[1] * 2 and right[1] > right[0] * 2),
    "mean_in_plausible_range": bool(0.05 < a.mean() < 0.8),
    "more_spp_less_noise": rmse(other_seed_high, reference) < rmse(other_seed_low, reference),
}
print(json.dumps({
    "variant": mi.variant(), "mitsuba": mi.__version__, "size": SIZE, "spp": SPP, "seed": SEED,
    "mean_rgb": [round(float(x), 4) for x in mean],
    "left_rgb": [round(float(x), 4) for x in left],
    "right_rgb": [round(float(x), 4) for x in right],
    "checks": checks, "all_passed": all(checks.values()),
}, indent=2))
