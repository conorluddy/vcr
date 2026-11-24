"""Measure two generativepy frame runs against the predeclared checks.

Usage: check.py RUN_A_DIR RUN_B_DIR
Prints JSON to stdout and exits 1 when any gating check fails.
Reads PNGs with pycairo only; no numpy or image library is imported here.
"""
import cairo
import hashlib
import json
import os
import sys

FRAME_COUNT = 48
EXPECTED_WIDTH_PX = 320
EXPECTED_HEIGHT_PX = 240
MIDDLE_FRAME = 24
COLOUR_TOLERANCE = 3
OPAQUE_ALPHA = 255
MIN_OPAQUE_ALPHA_AT_LEFT_EDGE = 247
MAX_TRANSPARENT_ALPHA_AT_RIGHT_EDGE = 8
YELLOW_RGB = (255, 204, 26)
MAGENTA_RGB = (230, 51, 179)

# (frame, x, y, label); the analytic expectations below are checked against these.
PROBE_POINTS = [
    (0, 240, 100, 'yellow_orbit_frame0'),
    (24, 80, 100, 'yellow_orbit_frame24'),
    (12, 160, 50, 'magenta_counter_orbit_frame12'),
    (0, 2, 208, 'gradient_left_edge_frame0'),
    (0, 318, 208, 'gradient_right_edge_frame0'),
]


# === PUBLIC API ===

def main(argv):
    if len(argv) != 3:
        sys.exit('usage: check.py RUN_A_DIR RUN_B_DIR')
    runA = argv[1]
    runB = argv[2]
    sequentialHashesA = sequential_hashes(runA)
    sequentialHashesB = sequential_hashes(runB)
    shuffledHashesA = shuffled_hashes(runA)
    frameSurfaces = [read_surface(runA, 'sequential', frame) for frame in range(FRAME_COUNT)]

    probes = [probe_record(frameSurfaces[frame], frame, x, y, label) for frame, x, y, label in PROBE_POINTS]
    middleAlpha = alpha_range(frameSurfaces[MIDDLE_FRAME])
    checks = {
        'frame_count_is_48': len(sequentialHashesA) == FRAME_COUNT and len(sequentialHashesB) == FRAME_COUNT
                             and len(shuffledHashesA) == FRAME_COUNT,
        'dimensions_are_320x240': all(dimensions_match(surface) for surface in frameSurfaces),
        'frames_differ_across_time': len(set(sequentialHashesA)) >= 2,
        'shuffled_equals_sequential': shuffledHashesA == sequentialHashesA,
        'rerun_byte_identical': sequentialHashesA == sequentialHashesB,
        'middle_frame_alpha_range_0_to_255': middleAlpha['min'] == 0 and middleAlpha['max'] == OPAQUE_ALPHA,
        'analytic_probes_match': analytic_probes_match(probes),
    }
    measurements = {
        'distinct_sequential_hashes': len(set(sequentialHashesA)),
        'frame_hashes_digest_sha256': digest_of(sequentialHashesA),
        'middle_frame_alpha': middleAlpha,
        'probes': probes,
        'rerun_frame_hashes_digest_sha256': digest_of(sequentialHashesB),
        'stride_bytes': frameSurfaces[0].get_stride(),
    }
    print(json.dumps({'checks': checks, 'measurements': measurements}, indent=2, sort_keys=True))
    return 0 if all(checks.values()) else 1


# === HELPERS ===

def frame_file_name(frame):
    return f'frame{frame:08d}.png'


def read_surface(runDirectory, folderName, frame):
    return cairo.ImageSurface.create_from_png(os.path.join(runDirectory, folderName, frame_file_name(frame)))


def sha256_of_file(path):
    with open(path, 'rb') as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def sequential_hashes(runDirectory):
    return [sha256_of_file(os.path.join(runDirectory, 'sequential', frame_file_name(frame)))
            for frame in range(FRAME_COUNT)]


def shuffled_hashes(runDirectory):
    return [sha256_of_file(os.path.join(runDirectory, 'shuffled', frame_file_name(frame)))
            for frame in range(FRAME_COUNT)]


def dimensions_match(surface):
    return surface.get_width() == EXPECTED_WIDTH_PX and surface.get_height() == EXPECTED_HEIGHT_PX


def pixel_bgra(surface, x, y):
    offset = y * surface.get_stride() + x * 4
    data = surface.get_data()
    return tuple(data[offset:offset + 4])


def alpha_range(surface):
    data = surface.get_data()
    alphas = data[3::4]
    return {'min': min(alphas), 'max': max(alphas)}


def probe_record(surface, frame, x, y, label):
    blue, green, red, alpha = pixel_bgra(surface, x, y)
    return {'frame': frame, 'x': x, 'y': y, 'label': label, 'bgra_premultiplied': [blue, green, red, alpha]}


def analytic_probes_match(probes):
    byLabel = {probe['label']: probe for probe in probes}
    return (
        colour_close(byLabel['yellow_orbit_frame0'], YELLOW_RGB)
        and colour_close(byLabel['yellow_orbit_frame24'], YELLOW_RGB)
        and colour_close(byLabel['magenta_counter_orbit_frame12'], MAGENTA_RGB)
        and byLabel['gradient_left_edge_frame0']['bgra_premultiplied'][3] >= MIN_OPAQUE_ALPHA_AT_LEFT_EDGE
        and byLabel['gradient_right_edge_frame0']['bgra_premultiplied'][3] <= MAX_TRANSPARENT_ALPHA_AT_RIGHT_EDGE
    )


def colour_close(probe, expectedRgb):
    blue, green, red, alpha = probe['bgra_premultiplied']
    actualRgb = (red, green, blue)
    return alpha == OPAQUE_ALPHA and all(
        abs(actual - expected) <= COLOUR_TOLERANCE for actual, expected in zip(actualRgb, expectedRgb))


def digest_of(hashes):
    return hashlib.sha256(''.join(hashes).encode('ascii')).hexdigest()


if __name__ == '__main__':
    sys.exit(main(sys.argv))
