---
name: exiftool
description: Read, write and strip image metadata (XMP, EXIF) with the ExifTool CLI. Load when delivery needs title, rights or artist tags set or removed; use FFmpeg for transcoding.
---

# ExifTool

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use it to stamp title, rights and artist metadata onto a delivered still, read it back as JSON, or strip it.
- The fixture validates only XMP-dc Title/Rights and EXIF Artist on a generated 64x48 PNG and JPEG, on copies of the files, with ExifTool 13.50 on macOS 26.6 arm64. The catalogue card's `version_seen` is 13.59; the tested build was 13.50, so claims hold for 13.50 only.
- Not established: TIFF, HEIC, MP4, WAV or other formats, other fields, IPTC, MakerNotes, GPS, thumbnails, editing originals in place, agreement with another reader, Linux or Windows.
- ExifTool does not transcode or inspect pixels; use FFmpeg or ImageMagick. MediaInfo is a separate reader for audio/video.

## Capability map
Discovery only; the [ExifTool documentation](https://exiftool.org/exiftool_pod.html) is the authority.
- Tested: write tags (`-XMP-dc:Title=`, `-EXIF:Artist=`), JSON read (`-j` with named tags), group listing (`-a -G1`), strip (`-all=`), `-overwrite_original`, `-q`.
- Documented, untested here: [tag name reference](https://exiftool.org/TagNames/index.html) (EXIF, XMP, IPTC, MakerNotes, video and audio groups), copy between files (`-tagsFromFile`), batch and recursive runs, `-csv`, conditional selection (`-if`), date shifting, `-ver` and format write-support tables.

## Install and doctor
```text
brew install exiftool
exiftool -ver
vcr doctor
```
Not installed by this guide; check with `exiftool -ver`. Validated: 13.50.

## Smoke test
```text
vcr example create exiftool-metadata-roundtrip
cd examples/exiftool-metadata-roundtrip && ./run.sh
# expect: exiftool-metadata-roundtrip: OK
```
The fixture needs ffmpeg and python3 too. It writes, reads and strips copies, and checks that decoded RGBA SHA-256 is unchanged.

## Recipes (tested on PNG and JPEG copies)
```text
exiftool -q -overwrite_original -XMP-dc:Title="Title" -XMP-dc:Rights="Rights" -EXIF:Artist="Artist" out.png
exiftool -j -XMP-dc:Title -XMP-dc:Rights -EXIF:Artist out.png
exiftool -q -overwrite_original -all= out.png
```
- Read-back returned the exact strings on both formats; `-G1` showed XMP-dc for Title and Rights, IFD0 for Artist.
- After `-all=`, no XMP, EXIF, IFD0, IFD1 or ExifIFD key remained and decoded pixels were identical.
- `-overwrite_original` replaces the file; the fixture only ran it on copies. Work on a copy of anything you care about.

## Troubleshooting
- Read-back missing or different: run `exiftool -a -G1 file` to see which group holds the tag, and check `exiftool -ver`; the fixture is pinned to 13.50.
- `exiftool: command not found`: install it, then rerun `vcr doctor`.
- A `file_original` backup appears: you omitted `-overwrite_original` (default ExifTool behaviour, documented, not seen in the fixture).

## Official docs
- [ExifTool CLI reference](https://exiftool.org/exiftool_pod.html)
- [Tag names](https://exiftool.org/TagNames/index.html)
- [Source and licence](https://github.com/exiftool/exiftool)
