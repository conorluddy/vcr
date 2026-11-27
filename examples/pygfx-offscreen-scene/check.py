import hashlib
import json
import random

import numpy as np
import pygfx
import wgpu
from PIL import Image

from scene import HEIGHT, WIDTH, build

FPS, FRAMES = 12, 24
times = [i / FPS for i in range(FRAMES)]


def digest(frame):
    return hashlib.sha256(frame.tobytes()).hexdigest()


render = build()
sequential = [render(t) for t in times]
order = list(range(FRAMES))
random.Random(7).shuffle(order)
shuffled = {i: render(times[i]) for i in order}
repeat = [render(t) for t in times]
fresh = build()
fresh_frames = [fresh(t) for t in times]

hashes = [digest(f) for f in sequential]
background = np.array([16, 20, 24])
covered = [int((np.abs(f[..., :3].astype(int) - background).sum(axis=2) > 12).sum()) for f in sequential]
checks = {
    "versions": pygfx.__version__ == "0.18.0" and wgpu.__version__ == "0.33.0",
    "shape": all(f.shape == (HEIGHT, WIDTH, 4) and f.dtype == np.uint8 for f in sequential),
    "repeat_same_renderer": [digest(f) for f in repeat] == hashes,
    "shuffled_equals_sequential": all(digest(shuffled[i]) == hashes[i] for i in range(FRAMES)),
    "fresh_renderer_equals": [digest(f) for f in fresh_frames] == hashes,
    "frames_differ": len(set(hashes)) == FRAMES,
    "loop_closes": hashes[0] == digest(render(2.0)),
    "background_corner": tuple(int(v) for v in sequential[0][2, 2][:3]) == (16, 20, 24),
    "subject_visible": min(covered) > 2000,
}
Image.fromarray(np.hstack([sequential[i] for i in (0, 3, 6, 9)])).save("output/contact.png")
print(json.dumps({
    "frames": FRAMES,
    "size": [WIDTH, HEIGHT],
    "checks": checks,
    "frame_sha256_first3": hashes[:3],
    "all_passed": all(checks.values()),
}, indent=2))
