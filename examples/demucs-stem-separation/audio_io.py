# === PUBLIC API ===
# Float32 stereo read/write through the ffmpeg CLI, so numpy handles the samples and no
# audio library beyond numpy is needed. Reads never resample: callers check the native rate.

import json
import subprocess
from pathlib import Path

import numpy as np

FLOAT32_BYTES = 4


def probe_rate_and_channels(path: Path) -> tuple[int, int]:
    completed = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "a:0",
         "-show_entries", "stream=sample_rate,channels", "-of", "json", str(path)],
        check=True, capture_output=True, text=True,
    )
    stream = json.loads(completed.stdout)["streams"][0]
    return int(stream["sample_rate"]), int(stream["channels"])


def read_float32_stereo(path: Path) -> np.ndarray:
    """Returns shape (2, samples), float64. Mono input is duplicated to two channels."""
    completed = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-acodec", "pcm_f32le",
         "-ac", "2", "-"],
        check=True, capture_output=True,
    )
    interleaved = np.frombuffer(completed.stdout, dtype="<f4")
    return interleaved.reshape(-1, 2).astype(np.float64).T


def write_float32_wav(path: Path, stereo: np.ndarray, sample_rate_hz: int) -> None:
    """Writes shape (2, samples) as 32-bit float WAV at the given rate, without resampling."""
    interleaved = np.ascontiguousarray(stereo.T.astype("<f4"))
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sample_rate_hz), "-ac", "2",
         "-i", "-", "-c:a", "pcm_f32le", str(path)],
        input=interleaved.tobytes(), check=True,
    )
