"""OpenEXR fixture: float round-trip, compression, multi-layer channel names, bad file."""
import hashlib, json, os
import numpy as np
import OpenEXR

assert OpenEXR.__version__ == "3.5.5", OpenEXR.__version__
out = "output"
os.makedirs(out, exist_ok=True)
checks = {}
h, w = 24, 32
rng = np.random.default_rng(7)
# Linear values well outside 0..1, which 8-bit formats cannot hold.
beauty = (rng.random((h, w, 3), dtype=np.float32) * 40.0 - 2.0).astype(np.float32)
depth = (rng.random((h, w), dtype=np.float32) * 100.0).astype(np.float32)
alpha = rng.random((h, w), dtype=np.float32)


def write(path, compression, rgb_dtype=np.float32):
    header = {"compression": compression, "type": OpenEXR.scanlineimage}
    channels = {"RGB": beauty.astype(rgb_dtype), "A": alpha.astype(rgb_dtype), "depth.Z": depth}
    with OpenEXR.File(header, channels) as f:
        f.write(path)


def read(path):
    with OpenEXR.File(path) as f:
        return dict(f.header()), {k: np.array(v.pixels) for k, v in f.channels().items()}


# 1. Lossless float32 round trip, bit-exact, for three compressions.
sizes = {}
for name, comp in [("zip", OpenEXR.ZIP_COMPRESSION), ("piz", OpenEXR.PIZ_COMPRESSION),
                   ("none", OpenEXR.NO_COMPRESSION)]:
    p = f"{out}/{name}.exr"
    write(p, comp)
    hdr, ch = read(p)
    sizes[name] = os.path.getsize(p)
    checks[f"{name}_float32_rgb_bit_exact"] = ch["RGBA"].dtype == np.float32 and np.array_equal(ch["RGBA"][..., :3], beauty)
    checks[f"{name}_alpha_and_depth_bit_exact"] = np.array_equal(ch["RGBA"][..., 3], alpha) and np.array_equal(ch["depth.Z"], depth)
    checks[f"{name}_compression_in_header"] = hdr["compression"] == comp
checks["values_beyond_one_kept"] = float(beauty.max()) > 1.0 and float(read(f"{out}/zip.exr")[1]["RGBA"][..., :3].max()) > 1.0
checks["zip_smaller_than_uncompressed"] = sizes["zip"] < sizes["none"]

# 2. Channel names, including a dotted layer name, survive.
hdr, ch = read(f"{out}/zip.exr")
checks["channel_names"] = sorted(ch) == ["RGBA", "depth.Z"]  # reader groups R,G,B,A into one RGBA array
checks["data_window_size"] = [int(v) for a in hdr["dataWindow"] for v in a] == [0, 0, w - 1, h - 1]

# 3. Half float: stored values equal the float16 cast.
write(f"{out}/half.exr", OpenEXR.ZIP_COMPRESSION, np.float16)
_, hch = read(f"{out}/half.exr")
checks["half_pixels_are_float16"] = hch["RGBA"].dtype == np.float16 and hch["depth.Z"].dtype == np.float32
checks["half_matches_float16_cast"] = np.array_equal(hch["RGBA"][..., :3], beauty.astype(np.float16))

# 4. A non-EXR file is rejected.
with open(f"{out}/not.exr", "wb") as handle:
    handle.write(b"not an exr")
checks["isOpenExrFile_true_and_false"] = OpenEXR.isOpenExrFile(f"{out}/zip.exr") and not OpenEXR.isOpenExrFile(f"{out}/not.exr")
try:
    OpenEXR.File(f"{out}/not.exr")
    checks["bad_file_raises"] = False
except Exception:
    checks["bad_file_raises"] = True


def sha(path):
    with open(path, "rb") as handle:
        return hashlib.sha256(handle.read()).hexdigest()


result = {
    "OpenEXR": OpenEXR.__version__, "numpy": np.__version__,
    "channels_seen": sorted(ch), "file_sizes_bytes": sizes,
    "zip_exr_sha256": sha(f"{out}/zip.exr"),
    "checks": checks, "all_passed": all(checks.values()),
}
print(json.dumps(result, indent=2, sort_keys=True))
