#!/usr/bin/env python3
import math
import struct
import wave
from pathlib import Path

OUT = Path(__file__).parent / "output"
OUT.mkdir(parents=True, exist_ok=True)
sample_rate = 48000
frames = 48000
amplitude = 0.25
frequency = 440
with wave.open(str(OUT / "tone.wav"), "wb") as target:
    target.setnchannels(1)
    target.setsampwidth(2)
    target.setframerate(sample_rate)
    target.writeframes(b"".join(
        struct.pack("<h", round(amplitude * 32767 * math.sin(2 * math.pi * frequency * i / sample_rate)))
        for i in range(frames)
    ))
