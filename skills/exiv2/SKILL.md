---
name: exiv2
description: Write, read and strip JPEG metadata (XMP, EXIF, IPTC) with the Exiv2 CLI, including batch edits from a command file. Load when delivery needs title, rights, artist or caption tags set or removed and IPTC matters; ExifTool covers more formats and tags.
---

# Exiv2

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Use it to stamp title, rights, artist and caption metadata onto a delivered JPEG still in one pass from a command file, read it back, or strip it. Delivery wants stills clean and labelled deliberately; metadata is checked alongside the sRGB and format rules (`DELIVERY-STILL-SRGB`, `DELIVERY-STILL-FORMAT`), and in-file metadata is not something platforms honour, so keep titles in the manifest too (`DELIVERY-MANIFEST`).
- Pick exiv2 for a C++ library or a fast CLI, scripted `-m` command files, and IPTC. Pick [exiftool](../exiftool/SKILL.md) for the broadest format and tag coverage (PNG, MakerNotes, video and audio groups).
- The fixture validates only a generated 64x48 JPEG with XMP-dc Title and Rights, EXIF Artist and IPTC Caption written via `-m`, `-pa` read-back, `rm` strip, and an exiftool 13.50 cross-read, with Exiv2 0.28.9 on macOS 26.6 arm64, on copies of the files.
- Not established: PNG or other formats, other fields, MakerNotes, GPS, thumbnails, actions other than `mo`, `pr` and `rm`, the library API, editing originals you care about, Linux or Windows, release recency (the card still lists it unconfirmed).
- Exiv2 does not transcode or inspect pixels; use FFmpeg or ImageMagick. Licence is GPL-2.0-or-later.

## Capability map
Discovery only; the [Exiv2 repository and docs](https://github.com/Exiv2/exiv2) are the authority, and documentation is not VCR validation.
- Tested: `exiv2 -m cmdfile mo file` (modify from a command file with `set`), `exiv2 -pa file` (print all metadata), `exiv2 rm file` (strip), `-q`, `--version`.
- Documented, untested here: other actions (`in` insert, `ex` extract, `ad` add, `mv` move, `cp` copy), other print modes (`-pt`, `-pv`, `-pS`), key reference for [Exif, IPTC and XMP](https://exiv2.org/metadata.html), the C++ library API ([API docs](https://exiv2.org/doc/)), format support tables.

## Install and doctor
```text
brew install exiv2
exiv2 --version
vcr doctor
```
Not installed by this guide; check with `exiv2 --version`. Validated: 0.28.9.

## Smoke test
```text
vcr example create exiv2-metadata-roundtrip
cd examples/exiv2-metadata-roundtrip && ./run.sh
# expect: exiv2-metadata-roundtrip: OK
```
The fixture needs ffmpeg, exiftool 13.50 and python3 too. It edits copies and checks that decoded RGBA SHA-256 is unchanged.

## Recipes (tested on JPEG copies)
Command file `cmd.txt`:
```text
set Xmp.dc.title LangAlt lang="x-default" Title text
set Xmp.dc.rights LangAlt lang="x-default" Rights text
set Exif.Image.Artist Ascii Artist name
set Iptc.Application2.Caption String Caption text
```
```text
exiv2 -q -m cmd.txt mo out.jpg
exiv2 -pa out.jpg
exiv2 -q rm out.jpg
```
- `-pa` returned the exact strings; LangAlt values print with a `lang="x-default" ` prefix, which the checker strips before comparing.
- exiftool 13.50 read the same four values from the exiv2-written file (`Title`, `Rights`, `Artist`, `Caption-Abstract`), so the tags are not exiv2-private.
- After `rm`, `-pa` printed nothing and exited 0; exiftool showed no XMP, EXIF, IFD0, IFD1, ExifIFD or IPTC keys. Decoded pixels were identical at every step.
- Both `mo` and `rm` edit the file in place. The fixture ran them only on copies; copy anything you care about first.

## Troubleshooting
- Read-back missing or different: run `exiv2 -pa file` and `exiftool -a -G1 file` to see which key holds it, and check `exiv2 --version`; the fixture is pinned to 0.28.9.
- `exiv2: command not found`: install it, then rerun `vcr doctor`.
- A command-file line fails: each line needs key, type and value (`set Key Type value`); the types above are the ones tested.

## Official docs
- [Exiv2 repository](https://github.com/Exiv2/exiv2)
- [Metadata tag reference](https://exiv2.org/metadata.html)
- [Library API](https://exiv2.org/doc/)
