"""PhiFlow 2D smoke plume on the NumPy backend: closed box, inflow for a few steps, fixed step count."""
import numpy as np
from phi.flow import *

assert backend.default_backend().name == 'numpy', backend.default_backend().name
SIZE, STEPS, INFLOW_STEPS, DT = 64, 60, 15, 1.0
FRAMES = (0, 20, 40, 60)


def run():
    bounds = Box(x=100, y=100)
    velocity = StaggeredGrid(0, extrapolation.combine_sides(x=extrapolation.ZERO, y=(extrapolation.ZERO, extrapolation.ZERO_GRADIENT)), x=SIZE, y=SIZE, bounds=bounds)
    smoke = CenteredGrid(0, extrapolation.BOUNDARY, x=SIZE, y=SIZE, bounds=bounds)
    inflow = 0.2 * resample(Sphere(x=50, y=15, radius=5), to=smoke, soft=True)
    frames, trace = {0: smoke.values.numpy('x,y')}, []
    for step in range(1, STEPS + 1):
        smoke = advect.mac_cormack(smoke, velocity, DT)
        if step <= INFLOW_STEPS:
            smoke = smoke + inflow
        velocity = advect.semi_lagrangian(velocity, velocity, DT) + (smoke * (0, 0.1)) @ velocity
        velocity, _ = fluid.make_incompressible(velocity)
        s = smoke.values.numpy('x,y')
        trace.append((step, float(s.sum()), float((s * np.arange(SIZE)[None, :]).sum() / s.sum())))
        if step in FRAMES:
            frames[step] = s
    div = field.divergence(velocity).values.numpy('x,y')
    return frames, trace, float(np.abs(div).max())
