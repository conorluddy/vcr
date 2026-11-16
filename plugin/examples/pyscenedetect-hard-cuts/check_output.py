import json
import sys
from importlib.metadata import version
from pathlib import Path

from scenedetect import ContentDetector, SceneManager, open_video

probe = json.loads(Path("output/probe.json").read_text())["streams"][0]
assert probe["width"] == 96 and probe["height"] == 64
assert probe["avg_frame_rate"] == "24/1" and probe["nb_read_frames"] == "96"

video = open_video("output/known-cuts.mp4", backend="opencv")
manager = SceneManager()
manager.auto_downscale = False
manager.add_detector(ContentDetector(threshold=10.0, min_scene_len=1))
processed = manager.detect_scenes(video=video, frame_skip=0)
scenes = manager.get_scene_list(start_in_scene=True)
cuts = [int(start.frame_num) for start, _ in scenes[1:]]
expected_boundaries = [24, 48, 72]
assert len(cuts) == len(expected_boundaries), f"expected 3 boundaries, got {cuts}"
assert all(abs(actual - expected) <= 1 for actual, expected in zip(cuts, expected_boundaries)), f"detected {cuts}, expected near {expected_boundaries}"
assert processed == 96, f"expected 96 processed frames, got {processed}"

metrics = {
    "scenedetect_version": version("scenedetect"),
    "opencv_version": version("opencv-python"),
    "width": int(probe["width"]),
    "height": int(probe["height"]),
    "fps": probe["avg_frame_rate"],
    "frames": int(probe["nb_read_frames"]),
    "processed_frames": processed,
    "content_threshold": 10.0,
    "min_scene_len_frames": 1,
    "expected_cut_frames": expected_boundaries,
    "detected_cut_frames": cuts,
}
expected_file = Path("expected/metrics.json")
serialized = json.dumps(metrics, indent=2, sort_keys=True) + "\n"
if sys.argv[1:] == ["--record"]:
    expected_file.parent.mkdir(parents=True, exist_ok=True)
    expected_file.write_text(serialized)
elif not expected_file.exists() or expected_file.read_text() != serialized:
    raise SystemExit(f"metrics differ from {expected_file}:\n{serialized}")
print(f"OK PySceneDetect {metrics['scenedetect_version']}: cuts {cuts} in {processed} frames at {metrics['fps']} fps")
