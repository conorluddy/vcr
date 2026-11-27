#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

for tool in ultrahdr_app exiftool magick ffmpeg; do
  command -v "$tool" >/dev/null || {
    echo "libultrahdr-gainmap-encode: '$tool' not found on PATH. Install: brew install libultrahdr exiftool imagemagick ffmpeg" >&2
    exit 127
  }
done
python3 -c "import numpy" 2>/dev/null || {
  echo "libultrahdr-gainmap-encode: python3 needs numpy. Install: python3 -m pip install numpy" >&2
  exit 127
}

mkdir -p output expected
rm -f output/*

python3 generate_input.py output

encode() {
  ultrahdr_app -m 0 -w 128 -h 96 \
    -p output/hdr_128x96.rgba1010102 -a 5 -t 1 -C 1 \
    -y output/sdr_128x96.rgba8888 -b 3 -c 0 \
    -z "$1" >/dev/null
}
encode output/uhdr.jpg
encode output/uhdr-repeat.jpg

# Negative control: a plain JPEG with no gain map
magick -size 128x96 -depth 8 rgba:output/sdr_128x96.rgba8888 output/plain.jpg

ultrahdr_app -m 1 -P -j output/uhdr.jpg > output/probe.txt
ultrahdr_app -m 1 -j output/uhdr.jpg -o 1 -O 5 -z output/decoded-hlg.rgba1010102 >/dev/null
ultrahdr_app -m 1 -j output/uhdr.jpg -o 3 -O 3 -z output/decoded-srgb.rgba8888 >/dev/null
plain_probe_status=0
ultrahdr_app -m 1 -P -j output/plain.jpg > output/probe-plain.txt 2>&1 || plain_probe_status=$?
echo "$plain_probe_status" > output/probe-plain.status
ultrahdr_app -h 0 > output/usage.txt 2>&1 || true

checks_status=0
python3 check_output.py output || checks_status=$?
[[ -f output/metrics.json ]] || { echo "libultrahdr-gainmap-encode: checker produced no metrics" >&2; exit 1; }

if [[ "${1:-}" == "--record" ]]; then
  cp output/metrics.json expected/metrics.json
  echo "libultrahdr-gainmap-encode: recorded observed metrics (checks exit ${checks_status})"
  exit 0
fi

# Failing predeclared checks stay in expected/ as KNOWN FAIL; exit 0 only while the run reproduces that record.
diff -u expected/metrics.json output/metrics.json
echo "libultrahdr-gainmap-encode: OK (reproduces the recorded result; see KNOWN FAIL lines above)"
