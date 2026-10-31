"""Original synthetic CAD fixture; outputs are regenerable, never source assets."""
import json
import math
import platform
from importlib.metadata import version
from pathlib import Path
import xml.etree.ElementTree as ET

from build123d import (
    Axis, Box, Cylinder, ExportSVG, Pos, Unit, export_gltf, export_step,
    fillet, import_step,
)

out = Path(__file__).parent / "output"
out.mkdir(exist_ok=True)
assert version("build123d") == "0.13.0", "Fixture requires build123d 0.13.0"
part = Box(60, 40, 12)
part = fillet(part.edges().filter_by(Axis.Z), 4)
part -= Pos(15, 0, 0) * Cylinder(3, 20)
expected_volume = (60 * 40 - (4 - math.pi) * 4**2 - math.pi * 3**2) * 12
assert part.is_valid
assert len(part.solids()) == 1
size = list(part.bounding_box().size)
assert all(abs(a - b) < 1e-6 for a, b in zip(size, [60, 40, 12]))
assert abs(part.volume - expected_volume) < 1e-4
export_step(part, out / "part.step")
assert abs(import_step(out / "part.step").volume - expected_volume) < 1e-4
for name, linear, angular in [("coarse", 0.5, 0.5), ("fine", 0.05, 0.1)]:
    assert export_gltf(part, out / f"part-{name}.glb", unit=Unit.MM,
                       binary=True, linear_deflection=linear, angular_deflection=angular)
visible, hidden = part.project_to_viewport((100, -120, 90))
svg = ExportSVG(scale=5)
svg.add_layer("Visible")
svg.add_shape(visible, layer="Visible")
svg.write(out / "part.svg")
root = ET.parse(out / "part.svg").getroot()
assert root.tag.endswith("svg")
assert any(n.tag.split("}")[-1] in {"path", "line", "polyline", "circle", "ellipse"}
           for n in root.iter())
viewbox = [float(v) for v in root.attrib["viewBox"].replace(",", " ").split()]
assert viewbox[2] > 0 and viewbox[3] > 0
report = {"build123d": version("build123d"), "python": platform.python_version(),
          "platform": platform.platform(), "machine": platform.machine(),
          "dimensions_mm": size, "volume_mm3": part.volume,
          "expected_volume_mm3": expected_volume, "visible_edges": len(visible),
          "hidden_edges": len(hidden), "svg_viewbox": viewbox}
(out / "cad-checks.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))
