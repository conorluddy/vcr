#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p output
ffmpeg -v error -y -f lavfi -i testsrc=size=64x48:rate=1 -frames:v 1 output/input.png
ffmpeg -v error -y -i output/input.png -q:v 2 output/input.jpg
cat > output/cmd.txt <<'EOF'
set Xmp.dc.title LangAlt lang="x-default" VCR metadata fixture
set Xmp.dc.rights LangAlt lang="x-default" CC0 fixture; no rights claimed
set Exif.Image.Artist Ascii VCR fixture
set Iptc.Application2.Caption String VCR caption fixture
EOF
cp output/input.jpg output/tagged.jpg
exiv2 -q -m output/cmd.txt mo output/tagged.jpg
cp output/tagged.jpg output/stripped.jpg
exiv2 -q rm output/stripped.jpg
python3 check_output.py "$@"
