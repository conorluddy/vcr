"""Run the predeclared dam-break scene headlessly and write particle state summaries.

Usage:
  generate.py OUT.json            continuous run to step 500, frames recorded
  generate.py OUT.json --seek N   fresh run stopped after step N, one state recorded
"""
import hashlib
import importlib.metadata
import json
import os
import sys

import numpy as np
import pysplishsplash as sph

HERE = os.path.dirname(os.path.abspath(__file__))
SCENE_FILE = os.path.join(HERE, "scene.json")
OUTPUT_DIR = os.path.join(HERE, "output", "sph-out")
TIME_STEP_SECONDS = 0.002
LAST_STEP = 500
# Step 0 (t = 0) is not readable: calling getFluidModel before the first step, or running
# initSimulation again, corrupts the run. The first recorded state is after step 1.
FRAME_STEPS = [1, 125, 250, 375, 500]
CLOCK_TOLERANCE_SECONDS = TIME_STEP_SECONDS / 10
# Half a step before the wanted step count: the run stops once time reaches this value,
# which is after exactly the wanted number of steps.
STOP_AT_OFFSET_SECONDS = -TIME_STEP_SECONDS / 2


def hashPositions(positions: np.ndarray) -> str:
    return hashlib.sha256(np.ascontiguousarray(positions, dtype=np.float64).tobytes()).hexdigest()


def readPositions() -> np.ndarray:
    fluid = sph.Simulation.getCurrent().getFluidModel(0)
    particleCount = fluid.numActiveParticles()
    return np.array([np.array(fluid.getPosition(i), dtype=np.float64) for i in range(particleCount)])


def summarisePositions(positions: np.ndarray) -> dict:
    return {
        "particleCount": int(positions.shape[0]),
        "centreOfMassX": float(positions[:, 0].mean()),
        "centreOfMassY": float(positions[:, 1].mean()),
        "widthX": float(positions[:, 0].max() - positions[:, 0].min()),
        "minX": float(positions[:, 0].min()),
        "maxX": float(positions[:, 0].max()),
        "minY": float(positions[:, 1].min()),
        "maxY": float(positions[:, 1].max()),
        "maxAbsZ": float(np.abs(positions[:, 2]).max()),
        "hash": hashPositions(positions),
    }


def runScene(stopAtStep: int, recordSteps: set[int], frames: dict, trace: dict) -> None:
    base = sph.Exec.SimulatorBase()
    base.init(
        sceneFile=SCENE_FILE,
        programName="splishsplash-dam-break",
        useCache=False,
        outputDir=OUTPUT_DIR,
        initialPause=False,
        useGui=False,
        stopAt=stopAtStep * TIME_STEP_SECONDS + STOP_AT_OFFSET_SECONDS,
    )
    stepCount = {"value": 0}

    def onTimeStep() -> None:
        stepCount["value"] += 1
        step = stepCount["value"]
        expectedTime = step * TIME_STEP_SECONDS
        actualTime = sph.TimeManager.getCurrent().getTime()
        # SPlisHSPlasH keeps time in float32, so it drifts by about 1e-6 s per 0.6 s; the
        # tolerance only has to show one callback per fixed step, not exact clock equality.
        if abs(actualTime - expectedTime) > CLOCK_TOLERANCE_SECONDS:
            raise RuntimeError(f"step {step} at t={actualTime}, expected {expectedTime}")
        if step in recordSteps:
            recordState(step, frames, trace)

    base.setTimeStepCB(onTimeStep)
    base.run()
    frames["stepsRun"] = stepCount["value"]


def recordState(step: int, frames: dict, trace: dict) -> None:
    positions = readPositions()
    summary = summarisePositions(positions)
    trace[str(step)] = summary["hash"]
    frames[str(step)] = {"timeSeconds": round(step * TIME_STEP_SECONDS, 6), **summary, "positions": positions.tolist()}


def runContinuous(outputPath: str) -> None:
    frames: dict = {}
    trace: dict = {}
    runScene(LAST_STEP, set(FRAME_STEPS), frames, trace)
    result = {
        "stepSeconds": TIME_STEP_SECONDS,
        "frameSteps": FRAME_STEPS,
        "stepsRun": frames.pop("stepsRun"),
        "frames": frames,
        "trace": trace,
        "library": {"pySPlisHSPlasH": importlib.metadata.version("pySPlisHSPlasH")},
    }
    writeJson(outputPath, result)


def runSeek(outputPath: str, seekStep: int) -> None:
    frames: dict = {}
    trace: dict = {}
    runScene(seekStep, {seekStep}, frames, trace)
    writeJson(outputPath, {"seekStep": seekStep, "stepsRun": frames.pop("stepsRun"), "hash": trace[str(seekStep)]})


def writeJson(outputPath: str, payload: dict) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(outputPath)), exist_ok=True)
    with open(outputPath, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)
        handle.write("\n")


def main(argv: list[str]) -> int:
    if len(argv) == 2:
        runContinuous(argv[1])
        return 0
    if len(argv) == 4 and argv[2] == "--seek":
        runSeek(argv[1], int(argv[3]))
        return 0
    print(__doc__, file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
