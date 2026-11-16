#!/usr/bin/env python3
import wave
from pathlib import Path

OUTPUT = Path(__file__).parent / "output" / "input.wav"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
values = [0, 8192, -8192, 16384, -16384, 32767, -32768, 0]
frames = (values * 100)
with wave.open(str(OUTPUT), "wb") as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(8000)
    wav.writeframes(b"".join(value.to_bytes(2, "little", signed=True) for value in frames))
