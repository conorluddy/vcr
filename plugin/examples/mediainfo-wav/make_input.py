#!/usr/bin/env python3
import sys
import wave
from pathlib import Path

path = Path(sys.argv[1])
path.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(path), "wb") as out:
    out.setnchannels(1)
    out.setsampwidth(2)
    out.setframerate(8000)
    out.writeframes(b"\0\0" * 8000)
