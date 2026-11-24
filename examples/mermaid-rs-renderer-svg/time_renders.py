#!/usr/bin/env python3
"""Prints wall-clock medians for mmdr and mmdc on the same input; facts only, never compared to expected/."""
import statistics
import subprocess
import sys
import time
from pathlib import Path

RUN_COUNT = 5


def medianWallClockMs(command: list[str]) -> float:
    durations = []
    for _ in range(RUN_COUNT):
        start = time.perf_counter()
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        durations.append((time.perf_counter() - start) * 1000)
    return statistics.median(durations)


def main() -> None:
    mmdrBinary, mmdcBinary, sourcePath, mmdcConfig, puppeteerConfig, outputDir = map(Path, sys.argv[1:7])
    mmdrCommand = [str(mmdrBinary), "-i", str(sourcePath), "-o", str(outputDir / "timing-mmdr.svg")]
    mmdcCommand = [
        str(mmdcBinary), "--input", str(sourcePath), "--output", str(outputDir / "timing-mmdc.svg"),
        "--configFile", str(mmdcConfig), "--puppeteerConfigFile", str(puppeteerConfig), "--quiet",
    ]
    print(f"median wall-clock over {RUN_COUNT} runs: mmdr {medianWallClockMs(mmdrCommand):.1f} ms; mmdc {medianWallClockMs(mmdcCommand):.1f} ms")


if __name__ == "__main__":
    main()
