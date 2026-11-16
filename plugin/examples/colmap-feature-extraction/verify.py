#!/usr/bin/env python3
import json
from pathlib import Path
import sqlite3
import sys

database = Path(sys.argv[1])
images_path = Path(sys.argv[2])
out = Path(sys.argv[3])
record = "--record" in sys.argv[4:]

connection = sqlite3.connect(database)
try:
    images = connection.execute("SELECT image_id, name, camera_id FROM images ORDER BY name").fetchall()
    measurements = []
    for image_id, name, camera_id in images:
        keypoints = connection.execute("SELECT rows, cols FROM keypoints WHERE image_id=?", (image_id,)).fetchone()
        descriptors = connection.execute("SELECT rows, cols FROM descriptors WHERE image_id=?", (image_id,)).fetchone()
        if keypoints is None or descriptors is None:
            raise SystemExit(f"missing keypoints/descriptors for {name}")
        if keypoints[0] <= 0 or keypoints[1] != 6 or descriptors[0] != keypoints[0] or descriptors[1] != 128:
            raise SystemExit(f"unexpected feature arrays for {name}: keypoints={keypoints}, descriptors={descriptors}")
        measurements.append({"image": name, "camera_id": camera_id, "keypoints": keypoints[0], "keypoint_columns": keypoints[1], "descriptor_rows": descriptors[0], "descriptor_columns": descriptors[1]})
finally:
    connection.close()

expected_names = sorted(path.name for path in images_path.glob("*.ppm"))
if [item[1] for item in images] != expected_names:
    raise SystemExit(f"database images {[item[1] for item in images]} differ from inputs {expected_names}")
if len(images) != 3:
    raise SystemExit(f"expected 3 images, got {len(images)}")

result = {"tool": "COLMAP", "version": "4.2.1_5", "image_count": len(images), "feature_type": "SIFT", "use_gpu": False, "images": measurements}
if record:
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, indent=2) + "\n")
else:
    expected = json.loads(out.read_text())
    expected_counts = [(item["image"], item["keypoints"], item["descriptor_columns"]) for item in expected["images"]]
    actual_counts = [(item["image"], item["keypoints"], item["descriptor_columns"]) for item in measurements]
    if expected_counts != actual_counts:
        raise SystemExit(f"feature measurements differ from expected: {actual_counts} != {expected_counts}")
print(json.dumps(result, indent=2))
