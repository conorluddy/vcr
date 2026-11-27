#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v openscad >/dev/null || { echo "openscad not on PATH. Install: brew install --cask openscad@snapshot" >&2; exit 1; }
VENV=output/venv
if [[ ! -x "$VENV/bin/python" ]]; then
  python3.12 -m venv "$VENV"
  "$VENV/bin/python" -m pip --disable-pip-version-check -q install -r requirements.txt
fi
rm -rf output/run && mkdir -p output/run
O=output/run
S=(--export-format asciistl)
openscad -o $O/default-manifold.stl "${S[@]}" part.scad >/dev/null 2>&1
openscad -o $O/default-manifold-2.stl "${S[@]}" part.scad >/dev/null 2>&1
openscad -o $O/default-cgal.stl "${S[@]}" --backend CGAL part.scad >/dev/null 2>&1
for backend in Manifold CGAL; do
  openscad -o "$O/override-$(echo "$backend" | tr A-Z a-z).stl" "${S[@]}" --backend "$backend" \
    -D width=50 -D depth=20 -D height=8 -D holeRadius=7 part.scad >/dev/null 2>&1
done
openscad -o $O/default-1.3mf part.scad >/dev/null 2>&1
sleep 2
openscad -o $O/default-2.3mf part.scad >/dev/null 2>&1
openscad -o $O/default.svg -D 'mode="projection"' part.scad >/dev/null 2>&1
CAMERA=(--imgsize 400,300 --camera 20,15,5,55,0,25,120 --render 1)
openscad -o $O/default.png "${CAMERA[@]}" part.scad >/dev/null 2>&1
openscad -o $O/default-2.png "${CAMERA[@]}" part.scad >/dev/null 2>&1
"$VENV/bin/python" -I checks.py $O
if [[ "${1:-}" == "--record" ]]; then cp $O/checks.json expected/checks.json; echo "recorded expected/"; exit 0; fi
diff expected/checks.json $O/checks.json
grep -q '"3mf_repeat_identical": false' $O/checks.json && echo "KNOWN FAIL: 3MF export is not byte-identical across runs (CreationDate, random UUIDs)"
grep -A12 '"cgal"' $O/checks.json | grep -q '"volume_relative_error_lt_1e-9": false' && echo "KNOWN FAIL: CGAL backend STL volume is off the analytic value by about 3e-9 (Manifold is within 1e-9)"
echo "openscad-parametric: OK"
