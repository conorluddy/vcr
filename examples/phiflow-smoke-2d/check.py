"""Predeclared checks; prints JSON. Frames go to output/frames/ as PNG and .npy."""
import hashlib, json, os
import numpy as np
import phi, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sim import run, FRAMES, INFLOW_STEPS, SIZE


def digest(frames):
    return hashlib.sha256(b''.join(frames[k].tobytes() for k in sorted(frames))).hexdigest()


frames, trace, max_div = run()
frames2, _, _ = run()
os.makedirs('output/frames', exist_ok=True)
for step, a in frames.items():
    np.save(f'output/frames/smoke_{step:03d}.npy', a)
    plt.imsave(f'output/frames/smoke_{step:03d}.png', a.T, origin='lower', cmap='gray', vmin=0, vmax=1)
mass = [t[1] for t in trace]
settled = mass[INFLOW_STEPS - 1:]  # from the last inflow step on
drift = (max(settled) - min(settled)) / settled[0]
centroid = [t[2] for t in trace]
checks = {
    'phiflow_version_3_4_0': phi.__version__ == '3.4.0',
    'four_frames_saved_64x64': sorted(frames) == list(FRAMES) and all(a.shape == (SIZE, SIZE) for a in frames.values()),
    'rerun_in_process_bit_identical': digest(frames) == digest(frames2),
    'mass_grows_every_inflow_step': all(mass[i + 1] > mass[i] for i in range(INFLOW_STEPS - 1)),
    'mass_drift_after_inflow_below_2_percent': drift < 0.02,
    'velocity_divergence_max_below_1e-4': max_div < 1e-4,
    'centroid_rises_over_10_cells_after_inflow': centroid[-1] - centroid[INFLOW_STEPS - 1] > 10,
    'smoke_not_below_minus_0.05': min(a.min() for a in frames.values()) > -0.05,
    'final_frame_not_blank': frames[FRAMES[-1]].max() > 0.05,
}
print(json.dumps({'sha256': digest(frames), 'mass_after_inflow': round(mass[INFLOW_STEPS - 1], 6),
                  'mass_final': round(mass[-1], 6), 'mass_drift': round(drift, 6),
                  'max_divergence': float(f'{max_div:.3g}'), 'centroid_final_cells': round(centroid[-1], 3),
                  'checks': {k: bool(v) for k, v in checks.items()}, 'all_passed': bool(all(checks.values()))}, indent=2))
