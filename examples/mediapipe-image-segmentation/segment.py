import argparse
import hashlib
import json
import os
import platform
import sys
import urllib.request
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", str(Path(__file__).resolve().parent / "output" / "matplotlib-cache"))

import mediapipe as mp
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
OUTPUT = HERE / "output"
MODEL = OUTPUT / "selfie_segmenter.tflite"
INPUT = OUTPUT / "input.png"
MASK = OUTPUT / "mask.png"
EXPECTED = HERE / "expected" / "segment.json"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite"
MODEL_SHA256 = "191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b"
WIDTH = 256
HEIGHT = 256


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def make_input() -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), (120, 170, 220))
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 205, 255, 255), fill=(85, 150, 75))
    draw.ellipse((103, 34, 153, 84), fill=(210, 150, 110))
    draw.rectangle((116, 80, 140, 103), fill=(210, 150, 110))
    draw.polygon([(88, 103), (168, 103), (190, 190), (66, 190)], fill=(45, 75, 150))
    draw.polygon([(89, 108), (109, 112), (80, 173), (65, 168)], fill=(210, 150, 110))
    draw.polygon([(148, 112), (168, 108), (191, 168), (176, 173)], fill=(210, 150, 110))
    draw.polygon([(82, 182), (122, 182), (115, 245), (91, 245)], fill=(55, 55, 65))
    draw.polygon([(132, 182), (172, 182), (163, 245), (139, 245)], fill=(55, 55, 65))
    image.save(INPUT, format="PNG", optimize=False)


def ensure_model() -> bytes:
    if not MODEL.exists():
        urllib.request.urlretrieve(MODEL_URL, MODEL)
    model_bytes = MODEL.read_bytes()
    actual = sha256(model_bytes)
    if actual != MODEL_SHA256:
        raise RuntimeError(f"Model SHA-256 mismatch: expected {MODEL_SHA256}, got {actual}")
    return model_bytes


def infer() -> np.ndarray:
    options = mp.tasks.vision.ImageSegmenterOptions(
        base_options=mp.tasks.BaseOptions(
            model_asset_path=str(MODEL),
            delegate=mp.tasks.BaseOptions.Delegate.CPU,
        ),
        running_mode=mp.tasks.vision.RunningMode.IMAGE,
        output_category_mask=True,
        output_confidence_masks=False,
    )
    with mp.tasks.vision.ImageSegmenter.create_from_options(options) as segmenter:
        image = mp.Image.create_from_file(str(INPUT))
        result = segmenter.segment(image)
        if result.category_mask is None:
            raise RuntimeError("Image Segmenter returned no category mask")
        return np.array(result.category_mask.numpy_view().squeeze(), copy=True)


def observation(model_bytes: bytes) -> dict:
    make_input()
    input_bytes = INPUT.read_bytes()
    first = infer()
    second = infer()
    if first.shape != (HEIGHT, WIDTH) or first.dtype != np.uint8:
        raise RuntimeError(f"Unexpected mask shape or dtype: {first.shape}, {first.dtype}")
    labels, counts = np.unique(first, return_counts=True)
    if labels.tolist() != [0, 255]:
        raise RuntimeError(f"Expected binary 0/255 category labels, got {labels.tolist()}")
    if not np.array_equal(first, second):
        raise RuntimeError("Two CPU inference runs returned different masks")
    ys, xs = np.where(first == 0)
    mask_bytes = first.tobytes()
    Image.fromarray(first).save(MASK, format="PNG", optimize=False)
    return {
        "status": "pass",
        "mediapipe": mp.__version__,
        "python": platform.python_version(),
        "os": f"{platform.system()} {platform.release()} ({platform.machine()})",
        "runtime": "Tasks ImageSegmenter / IMAGE / CPU",
        "model": {
            "source": MODEL_URL,
            "license": "Apache-2.0 (official model card)",
            "sha256": sha256(model_bytes),
        },
        "input": {
            "source": "generated 256x256 RGB geometric silhouette",
            "sha256": sha256(input_bytes),
        },
        "mask": {
            "width": WIDTH,
            "height": HEIGHT,
            "labels": {str(int(label)): int(count) for label, count in zip(labels, counts, strict=True)},
            "foregroundLabel": 0,
            "foregroundPixels": int(np.count_nonzero(first == 0)),
            "foregroundBounds": [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1],
            "rawSha256": sha256(mask_bytes),
            "repeatMatches": True,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", action="store_true")
    args = parser.parse_args()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    model_bytes = ensure_model()
    result = observation(model_bytes)
    serialized = json.dumps(result, indent=2) + "\n"
    if args.record:
        EXPECTED.parent.mkdir(parents=True, exist_ok=True)
        EXPECTED.write_text(serialized)
    else:
        expected = json.loads(EXPECTED.read_text())
        if expected != result:
            raise RuntimeError("Observed output differs from expected/segment.json; review it before --record.")
    print(serialized, end="")


if __name__ == "__main__":
    main()
