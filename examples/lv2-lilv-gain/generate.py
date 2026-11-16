import math
import wave
from pathlib import Path


path = Path(__file__).parent / "output" / "input.wav"
path.parent.mkdir(parents=True, exist_ok=True)
sample_rate = 48000
samples = [round(9000 * math.sin(2 * math.pi * 440 * i / sample_rate)) for i in range(256)]
with wave.open(str(path), "wb") as output:
    output.setnchannels(1)
    output.setsampwidth(2)
    output.setframerate(sample_rate)
    output.writeframes(b"".join(int(sample).to_bytes(2, "little", signed=True) for sample in samples))
