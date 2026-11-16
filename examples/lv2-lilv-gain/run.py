import hashlib
import json
import os
import platform
import shutil
import struct
import subprocess
import sys
import wave
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"
EXPECTED = ROOT / "expected" / "result.json"
URI = "https://example.org/vcr/mono-gain"
BUNDLE = OUTPUT / "lv2" / "vcr-mono-gain.lv2"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def capture(args, env=None):
    result = subprocess.run(args, cwd=ROOT, env=env, capture_output=True)
    require(result.returncode == 0, f"Command failed ({result.returncode}): {args}\n{result.stdout.decode(errors='replace')}\n{result.stderr.decode(errors='replace')}")
    return result.stdout


for executable in ("clang", "lv2apply", "lv2info", "lv2ls", "ffmpeg"):
    require(shutil.which(executable), f"Missing required executable: {executable}")

lv2_version = capture(["pkg-config", "--modversion", "lv2"]).decode().strip()
lilv_version = capture(["pkg-config", "--modversion", "lilv-0"]).decode().strip()
OUTPUT.mkdir(parents=True, exist_ok=True)
BUNDLE.mkdir(parents=True, exist_ok=True)
shutil.copy2(ROOT / "manifest.ttl", BUNDLE / "manifest.ttl")
shutil.copy2(ROOT / "plugin.ttl", BUNDLE / "plugin.ttl")
subprocess.run([
    "clang", "-dynamiclib", "-fPIC", "-I/opt/homebrew/include",
    str(ROOT / "lv2_gain.c"), "-o", str(BUNDLE / "mono_gain.dylib"),
], cwd=ROOT, check=True)

env = {**os.environ, "LV2_PATH": str(OUTPUT / "lv2")}
uris = capture(["lv2ls"], env=env).decode().splitlines()
require(URI in uris, f"Lilv did not discover {URI}: {uris}")
info = capture(["lv2info", URI], env=env).decode()
require("VCR Mono Gain Example" in info, f"Plugin metadata is absent from lv2info output:\n{info}")

input_wav = OUTPUT / "input.wav"
require(input_wav.is_file(), "Missing generated input; run generate.py first")
with wave.open(str(input_wav), "rb") as source:
    require((source.getnchannels(), source.getsampwidth(), source.getframerate(), source.getnframes()) == (1, 2, 48000, 256), "Unexpected source WAV contract")
    source_pcm = source.readframes(source.getnframes())
source_values = [int.from_bytes(source_pcm[i:i + 2], "little", signed=True) / 32768 for i in range(0, len(source_pcm), 2)]

outputs = []
for index in (1, 2):
    destination = OUTPUT / f"output-{index}.wav"
    capture(["lv2apply", "-c", "gain", "0.5", "-i", str(input_wav), "-o", str(destination), URI], env=env)
    decoded = capture([
        "ffmpeg", "-v", "error", "-i", str(destination), "-f", "f32le",
        "-acodec", "pcm_f32le", "-ac", "1", "-ar", "48000", "pipe:1",
    ])
    require(len(decoded) % 4 == 0, "Decoded output has an incomplete float sample")
    output_values = [struct.unpack_from("<f", decoded, offset)[0] for offset in range(0, len(decoded), 4)]
    require(len(output_values) == len(source_values), f"Output sample count differs: {len(output_values)}")
    errors = [abs(actual - original * 0.5) for actual, original in zip(output_values, source_values)]
    max_error = max(errors, default=0.0)
    require(max_error <= 1.0 / 32768, f"Output does not match 0.5 gain: max error {max_error}")
    outputs.append({
        "frames": len(output_values),
        "sample_rate": 48000,
        "channels": 1,
        "max_sample_error": max_error,
        "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
    })

require(outputs[0] == outputs[1], f"Two host runs differ: {outputs}")
metrics = {
    "lv2_spec_headers": lv2_version,
    "lilv": lilv_version,
    "plugin_uri": URI,
    "host": platform.platform(),
    "operation": "mono gain 0.5 via lv2apply",
    "outputs": outputs,
    "repeat_bytes_match": True,
}
rendered = json.dumps(metrics, indent=2) + "\n"
if "--record" in sys.argv[1:]:
    EXPECTED.parent.mkdir(parents=True, exist_ok=True)
    EXPECTED.write_text(rendered)
else:
    require(EXPECTED.is_file(), f"Missing {EXPECTED}; rerun with --record after reviewing measurements")
    require(json.loads(EXPECTED.read_text()) == metrics, f"Metrics differ from expected/result.json:\n{rendered}")
print(rendered, end="")
