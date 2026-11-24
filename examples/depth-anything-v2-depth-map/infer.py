"""Run Depth-Anything-V2-Small on one image on CPU and save its relative depth map.

Usage: infer.py <scene.png> <depth-prefix>
Writes <depth-prefix>.npy (float32, the pipeline's predicted_depth, unmodified) and
<depth-prefix>.png (8-bit grey, min-max normalised, for inspection only).
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from transformers import pipeline

MODEL_ID = "depth-anything/Depth-Anything-V2-Small-hf"


def writeGreyPreview(depthArray: np.ndarray, previewPath: Path) -> None:
    lowest = float(depthArray.min())
    highest = float(depthArray.max())
    if highest == lowest:
        normalised = np.zeros(depthArray.shape, dtype=np.uint8)
    else:
        normalised = np.round((depthArray - lowest) / (highest - lowest) * 255).astype(np.uint8)
    Image.fromarray(normalised, mode="L").save(previewPath)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: infer.py <scene.png> <depth-prefix>")
    scenePath = Path(sys.argv[1])
    depthPrefix = Path(sys.argv[2])
    depthPipeline = pipeline(task="depth-estimation", model=MODEL_ID, device="cpu")
    result = depthPipeline(Image.open(scenePath).convert("RGB"))
    depthArray = result["predicted_depth"].squeeze().detach().cpu().numpy().astype(np.float32)
    np.save(depthPrefix.with_name(depthPrefix.name + ".npy"), depthArray)
    writeGreyPreview(depthArray, depthPrefix.with_name(depthPrefix.name + ".png"))
    print(
        f"model={MODEL_ID} shape={list(depthArray.shape)} dtype={depthArray.dtype} "
        f"min={float(depthArray.min()):.6f} max={float(depthArray.max()):.6f}"
    )


if __name__ == "__main__":
    main()
