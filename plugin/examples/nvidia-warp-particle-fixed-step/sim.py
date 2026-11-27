"""Particle sim in NVIDIA Warp, CPU backend. Constants are predeclared; metres and seconds."""
import hashlib
import json
import os
import sys

import numpy as np
import warp as wp

HERE = os.path.dirname(os.path.abspath(__file__))
wp.config.kernel_cache_dir = os.path.join(HERE, "output", "warp-cache")
wp.config.quiet = True
wp.init()

PARTICLE_COUNT = 64
STEP_SECONDS = 1.0 / 60.0
SUBSTEPS = 4
RADIUS = 0.05
GRAVITY = -9.8
SEED = 7
RESTITUTION = 0.4
REPULSION = 400.0
SPHERE_RADIUS = 0.5


@wp.kernel
def integrate(pos: wp.array(dtype=wp.vec3), vel: wp.array(dtype=wp.vec3), dt: float):
    i = wp.tid()
    p = pos[i]
    v = vel[i]
    f = wp.vec3(0.0, GRAVITY, 0.0)
    # fixed-order neighbour loop; each thread writes only its own slot
    for j in range(PARTICLE_COUNT):
        if j != i:
            d = p - pos[j]
            dist = wp.length(d)
            if dist < 2.0 * RADIUS and dist > 1.0e-6:
                f = f + d / dist * (2.0 * RADIUS - dist) * REPULSION
    v = v + f * dt
    p = p + v * dt
    c = wp.vec3(0.0, 1.0, 0.0)
    n = p - c
    nl = wp.length(n)
    if nl < SPHERE_RADIUS + RADIUS:
        nn = n / nl
        p = c + nn * (SPHERE_RADIUS + RADIUS)
        vn = wp.dot(v, nn)
        if vn < 0.0:
            v = v - nn * vn * (1.0 + RESTITUTION)
    if p[1] < RADIUS:
        p = wp.vec3(p[0], RADIUS, p[2])
        if v[1] < 0.0:
            v = wp.vec3(v[0] * 0.9, -v[1] * RESTITUTION, v[2] * 0.9)
    pos[i] = p
    vel[i] = v


@wp.kernel
def accumulate_speed(vel: wp.array(dtype=wp.vec3), total: wp.array(dtype=float)):
    wp.atomic_add(total, 0, wp.length(vel[wp.tid()]))


def initial_positions():
    rng = np.random.RandomState(SEED)
    xz = rng.uniform(-0.3, 0.3, size=(PARTICLE_COUNT, 2))
    y = 2.0 + 0.12 * np.arange(PARTICLE_COUNT)  # stacked heights: no overlapping starts
    return np.stack([xz[:, 0], y, xz[:, 1]], axis=1).astype(np.float32)


def state_hash(p, v):
    return hashlib.sha256(p.tobytes() + v.tobytes()).hexdigest()[:16]


def simulate(frame_count, keep_frames=()):
    """Step from frame 0. Returns hash per frame 0..frame_count, final pos, final vel, kept positions."""
    pos = wp.array(initial_positions(), dtype=wp.vec3, device="cpu")
    vel = wp.zeros(PARTICLE_COUNT, dtype=wp.vec3, device="cpu")
    hashes = [state_hash(pos.numpy(), vel.numpy())]
    kept = {0: pos.numpy().copy()} if 0 in keep_frames else {}
    dt = STEP_SECONDS / SUBSTEPS
    for frame in range(1, frame_count + 1):
        for _ in range(SUBSTEPS):
            wp.launch(integrate, dim=PARTICLE_COUNT, inputs=[pos, vel, dt], device="cpu")
        p, v = pos.numpy(), vel.numpy()
        hashes.append(state_hash(p, v))
        if frame in keep_frames:
            kept[frame] = p.copy()
    return hashes, pos.numpy(), vel.numpy(), kept


def atomic_speed_sums(vel_array):
    """Measured, not gated: atomic float accumulation on the CPU backend, repeated."""
    vel = wp.array(vel_array, dtype=wp.vec3, device="cpu")
    sums = []
    for _ in range(5):
        total = wp.zeros(1, dtype=float, device="cpu")
        wp.launch(accumulate_speed, dim=PARTICLE_COUNT, inputs=[vel, total], device="cpu")
        sums.append(float(total.numpy()[0]))
    return sums


if __name__ == "__main__":
    # sim.py trace FRAMES OUT.json [FRAMES_NPZ] | sim.py seek FRAME  (fresh process prints one hash)
    if sys.argv[1] == "seek":
        frame = int(sys.argv[2])
        print(simulate(frame)[0][frame])
    else:
        frames, out = int(sys.argv[2]), sys.argv[3]
        keep = tuple(range(0, frames + 1, 100))
        hashes, pos, vel, kept = simulate(frames, keep)
        json.dump({
            "warp": wp.config.version,
            "hashes": hashes,
            "final_positions": np.round(pos, 5).tolist(),
            "final_max_speed": round(float(np.linalg.norm(vel, axis=1).max()), 5),
            "atomic_speed_sums": atomic_speed_sums(vel),
        }, open(out, "w"))
        if len(sys.argv) > 4:
            np.savez(sys.argv[4], **{f"f{k}": v for k, v in kept.items()})
