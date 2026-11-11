# New Candidate Tools for the VCR Catalogue (research as of 1 November 2026)

The gaps where new tools would help VCR most are **verification and determinism checks** (odiff, VMAF, SSIMULACRA2/dssim), **caption timing** (WhisperX, stable-ts, libass), **local voiceover** (Kokoro, Piper), **delivery encoding** (SVT-AV1, ab-av1, ffmpeg-normalize, avifenc, img2webp) and **headless renderers for content that isn't motion graphics** (VHS, freeze, D2, Typst, f3d, glslViewer). All of these can be installed on Apple Silicon and run without a GUI. Several look free but carry licence risks that the `license` field should record: AGPL for dssim, GPL for Piper, pngquant and gifsicle, and per-voice or per-model terms on AI weights.

## TL;DR
- **Add first, as `candidate`, with a likely move to `catalogued`:** odiff, VMAF (libvmaf), ffmpeg-normalize, WhisperX, stable-ts, libass, fonttools, HarfBuzz utilities, Kokoro (kokoro-onnx), SVT-AV1, ab-av1, libavif, VHS, D2, Typst and f3d. Each fills a gap no current catalogue record covers: frame-diff CI, perceptual QA, loudness, word-timed captions, font subsetting and shaping, local TTS, AV1/AVIF delivery, terminal capture, and diagram or 3D stills.
- **Determinism fit is strongest** for tools whose output depends only on their inputs: odiff, dssim/SSIMULACRA2, D2, Typst, freeze, resvg-adjacent vector tools, oxipng and avifenc at fixed settings. **It is weakest** for wall-clock recorders (VHS runs ttyd in real time) and ML tools (WhisperX, Kokoro and RIFE may vary across onnxruntime or torch versions). For those, pin versions and store the outputs as fixtures rather than regenerating them.
- **Licences to flag in records:**
  - dssim: AGPL-3.0.
  - Piper (piper1-gpl): GPL-3.0 since v1.3.0.\[1\]
  - pngquant: GPL-3.0-or-later.
  - gifsicle: GPL-2.0.
  - python-lottie: AGPL.
  - asciinema agg: GPL-3.0-or-later. The repository README says "All code is licensed under the GPL, v3 or later", and Homebrew's formula agrees.
  - Model weights (Kokoro, Piper voices, Depth Anything, matting models) carry their own terms.

## Key Findings

1. **Verification has no tool in the catalogue today, and it matters most for VCR's core promise.** "Frame N is always identical" has to be tested. odiff checks pixels on PNG frames. dssim and SSIMULACRA2 give perceptual scores for stills. VMAF scores encoded deliveries. Together they let an agent assert both bit-identical re-renders and perceptual quality on encodes.
2. **Captioning is a whole pipeline, and VCR currently has only whisper-cpp.** The pipeline runs ASR with word timestamps (WhisperX, stable-ts), then subtitle formats (SRT/ASS), then burn-in (libass via the FFmpeg `subtitles`/`ass` filters, or browser-rendered kinetic captions in GSAP). Word-level JSON from WhisperX or stable-ts maps directly onto GSAP timelines for kinetic typography.
3. **Delivery quality is under-specified.** ffmpeg-normalize adds EBU R128 loudness compliance. SVT-AV1 plus ab-av1 adds VMAF-targeted AV1 encodes with machine-readable JSON output.\[2\] avifenc, img2webp and oxipng cover modern stills and animated-image delivery beyond gifski.
4. **Developer-content video is a distinct gap.** VHS (scripted terminal tapes), freeze (code and ANSI screenshots), agg (asciicast to GIF) and @shikijs/magic-move (animated code diffs that run in VCR's Chromium path) cover it.
5. **Several "obvious" candidates are weaker than they look.** Revideo is active on npm but has no GitHub releases and moved organisations. shiki-magic-move as a package name is archived. Glaxnimate's Python wheels are Linux-only. Use each with the caveats given in its entry.

## Details — Candidates by Gap Area

Maintenance labels: **active** means a release within 12 months, **slow** 12–36 months, **unmaintained** more than 36 months. "⚠️ unverified" means I could not confirm the field from a primary source in this pass. Where a year was inferred from surrounding release history, the entry says so.

### A. Verification, QA and Determinism Testing

**1. odiff** — https://github.com/dmtrKovalenko/odiff
- **Role:** A very fast pixel diff for frame-determinism checks.
- **Summary:** A SIMD image comparison tool written in Zig, with a CLI and a Node binding. It supports PNG, JPEG, WebP and TIFF, anti-aliasing detection, ignore regions, and NEON on Apple Silicon. In the README's benchmark on two cypress.io screenshots, odiff took 1.168 s, against 7.712 s for pixelmatch (6.67× slower) and 8.881 s for ImageMagick `compare` (7.65× slower).
- **Automation:** native-cli-or-scripting plus library-or-runtime (npm `odiff-bin`). Headless.
- **Licence:** MIT.\[3\]\[4\]\[5\]
- **Version and maintenance:** v4.5.0 (GitHub release 23 Jul; npm v4.5.0 published recently). Active.\[3\]\[6\]
- **Install:** `brew install odiff` or `pnpm add -D odiff-bin`. Check with `odiff --help`.\[7\]
- **Pairs with:** playwright, imagemagick, ffmpeg-ffprobe, sharp.
- **Use when:**
  - Asserting that a re-render of frame N matches the golden PNG.
  - Running CI across thousands of frames.
  - Producing visual diff masks for agent review.
- **Avoid when:**
  - You need perceptual scores (use dssim or SSIMULACRA2).
  - You are comparing encoded video (use VMAF).
- **VCR caveats:** Exit codes distinguish match, layout difference and pixel difference (0/21/22 as documented by the odiffr wrapper).\[8\] These are ideal for agent gating. Use threshold 0 with anti-aliasing off for strict determinism.
- **Verdict:** **Strong candidate.**

**2. VMAF (libvmaf / `vmaf` CLI)** — https://github.com/Netflix/vmaf
- **Role:** The perceptual video-quality metric for encode QA.
- **Summary:** Netflix's full-reference metric, usable through the `vmaf` CLI or FFmpeg's `libvmaf` filter.\[9\]\[10\] It is the industry-standard score for deciding whether an encode is good enough.
- **Automation:** native-cli-or-scripting.
- **Licence:** BSD-2-Clause-Patent. The repository LICENSE gives this SPDX identifier, and the README notes the change "from Apache 2.0 to BSD+Patent" on 2020-02-27.
- **Version and maintenance:** v3.2.0 (20 Jun 2026). Arch Linux already packages 3.2.1, so a newer patch release may exist. An HDR VMAF model was published 2026-10-26. Active.
- **Install:** `brew install libvmaf` ⚠️ formula name unverified. Check with `vmaf --version`.
- **Pairs with:** ffmpeg-ffprobe, gstreamer.
- **Use when:**
  - Choosing CRF/bitrate per delivery.
  - Detecting regressions after encoder upgrades.
- **Avoid when:**
  - Comparing raw PNG frames (odiff, dssim).
  - Working with alpha content (VMAF scores luma only).
- **VCR caveats:** Deterministic for fixed inputs and model. Pin the model version in fixtures.
- **Verdict:** **Strong candidate.**

**3. dssim** — https://github.com/kornelski/dssim
- **Role:** A perceptual (multi-scale SSIM) image difference score.
- **Summary:** A Rust CLI that scores structural dissimilarity in a perceptual colour space and can output a difference map.\[11\]\[12\]
- **Licence:** **AGPL-3.0** (Cargo.toml). Homebrew lists AGPL-3.0-or-later, and a commercial licence is offered.\[11\]\[13\]\[14\]
- **Version and maintenance:** crates.io 3.5.1 (date ⚠️ unverified). The latest GitHub release is 3.4.0 (5 Mar 2025). Active-to-slow.\[11\]\[15\]
- **Install:** `brew install dssim` (formula at 3.4.0). Check with `dssim -h`.\[14\]
- **Pairs with:** odiff, imagemagick, libvips.
- **Use when:**
  - You need tolerance-based approval of stills (for example after resvg or ImageMagick upgrades).
- **Avoid when:**
  - You need exact equality (odiff).
  - You plan to distribute it inside a product (AGPL).
- **VCR caveats:** Running it as an external CLI in CI is fine. Do not link it into a shipped product.
- **Verdict:** **Worth cataloguing.**

**4. SSIMULACRA2 (ssimulacra2_rs)** — https://github.com/rust-av/ssimulacra2
- **Role:** A modern perceptual still and video metric that tracks human ratings well.
- **Licence:** BSD-2-Clause.
- **Version and maintenance:**
  - The `ssimulacra2_rs` binary is at 0.5.2 (2024-06-13). That is slow, about 29 months old.
  - The `ssimulacra2` library is at 0.5.1 (2024-12-29).
  - A newer aggregate, **iqa-cli** (crates.io), exposes PSNR, SSIM, DSSIM, MS-SSIM, SSIMULACRA2 and Butteraugli with JSON output. Its release date is ⚠️ unverified.
- **Install:** `cargo install ssimulacra2_rs` or `cargo install iqa-cli`.
- **Pairs with:** odiff, ffmpeg-ffprobe.
- **Use when:**
  - Comparing image codecs and quality settings (AVIF, JXL, WebP).
  - Sanity-checking upscaler output (real-esrgan).
- **Avoid when:**
  - A pass/fail determinism check is all you need (odiff).
- **Verdict:** **Niche, keep in mind.** Prefer iqa-cli if its maintenance checks out.

### B. Captioning, Alignment and Typography

**5. WhisperX** — https://github.com/m-bain/whisperX
- **Role:** ASR with accurate word timestamps (wav2vec2 alignment) and optional diarisation.\[16\]
- **Summary:** A faster-whisper backend with VAD and batched inference, plus forced alignment for word-level timings.\[16\]
- **Automation:** native-cli-or-scripting plus library (Python).
- **Licence:** BSD-2-Clause, confirmed by the repository LICENSE ("BSD 2-Clause License, Copyright (c) 2024, Max Bain") and by PyPI. Diarisation uses pyannote models, which require accepting Hugging Face gated-model terms.
- **Version and maintenance:** v3.8.6 latest stable, with 3.8.7rc1 published 26 Jun (2026 inferred). Active, with word-timestamp fixes backported across 3.x lines.\[17\]
- **Install:** `uv tool install whisperx`. Check with `whisperx --help`.
- **Pairs with:** whisper-cpp, ffmpeg-ffprobe, gsap, demucs (run demucs first to isolate vocals).
- **Use when:**
  - You need word-timed JSON for kinetic captions.
  - You need multi-speaker labels.
- **Avoid when:**
  - You need a lightweight, dependency-free install (whisper-cpp).
  - You already have a script and only need alignment (stable-ts `--align`).
- **VCR caveats:** Its CUDA focus means Apple Silicon runs on CPU, which is slower. ML output can drift between versions, so commit the alignment JSON as a fixture.
- **Verdict:** **Strong candidate.**

**6. stable-ts** — https://github.com/jianfch/stable-ts
- **Role:** Stabilised Whisper word timestamps and **forced alignment of known text**.
- **Summary:** A CLI along the lines of `stable-ts audio.mp3 --align text.txt --language en`. It regroups words into natural subtitle segments, outputs SRT, VTT, ASS and JSON, and works with faster-whisper.\[18\]
- **Licence:** MIT ⚠️ unverified.
- **Version and maintenance:** 2.19.1 (16 Aug 2025). Slow, about 14.5 months old.\[19\]
- **Install:** `uv tool install stable-ts`.
- **Pairs with:** whisper-cpp, ffmpeg-ffprobe, gsap.
- **Use when:**
  - The script is authored (agent-written voiceover) and you need precise word timings.
- **Avoid when:**
  - You need diarisation (WhisperX).
- **Verdict:** **Strong candidate.** It is the cleanest route from script to word timings.

**7. libass** — https://github.com/libass/libass
- **Role:** The reference ASS/SSA subtitle renderer, used by FFmpeg's `ass`/`subtitles` filters.\[20\]
- **Licence:** ISC ⚠️ unverified.
- **Version and maintenance:** 0.17.5 (24 Jun, year not shown; probably 2026). Active.\[21\]
- **Install:** `brew install libass`. It is mostly consumed through an FFmpeg build with `--enable-libass`.
- **Pairs with:** ffmpeg-ffprobe, stable-ts, whisperx.
- **Use when:**
  - Burning styled, karaoke-timed (`\k`) captions in the FFmpeg delivery path without a browser pass.
- **Avoid when:**
  - Captions need bespoke motion (render them in the GSAP/Chromium scene instead).
- **VCR caveats:** Output is deterministic given the fonts. Pin font files in fixtures, because system font fallback breaks reproducibility.
- **Verdict:** **Worth cataloguing.** Record it as an FFmpeg capability rather than a separate binary.

**8. fonttools (pyftsubset, varLib.instancer)** — https://github.com/fonttools/fonttools
- **Role:** Font subsetting, variable-font instancing and font inspection.
- **Licence:** MIT.
- **Version and maintenance:** 4.68.0 (27 Oct 2026). Active.\[22\]\[23\]
- **Install:** `uv tool install fonttools`. Check with `pyftsubset --help`.
- **Pairs with:** satori, opentype-js, troika-three-text, msdfgen, resvg.
- **Use when:**
  - Shrinking fonts embedded in browser scenes.
  - Freezing a variable font to a static instance for tools without variable-font support.
- **Avoid when:**
  - You need glyph shaping or rendering (HarfBuzz).
- **Verdict:** **Strong candidate.** It anchors font fixtures for reproducibility.

**9. HarfBuzz utilities (hb-shape, hb-view, hb-subset)** — https://github.com/harfbuzz/harfbuzz
- **Role:** The ground truth for text shaping, and stills of shaped text.
- **Licence:** "Old MIT" ⚠️ unverified.
- **Version and maintenance:** 15.0.0 (22 Oct 2026). Active.\[24\]\[25\]
- **Install:** `brew install harfbuzz`. Check with `hb-shape --version`.
- **Pairs with:** fonttools, opentype-js, msdfgen.
- **Use when:**
  - Debugging complex-script or ligature captions.
  - Verifying that the browser and native paths shape text identically.
- **Avoid when:**
  - You want styled typography renders (do those in the browser or Typst).
- **Verdict:** **Worth cataloguing.**

**10. aeneas** — https://github.com/readbeyond/aeneas
- **Role:** Classic DTW forced alignment of text to audio.
- **Licence:** AGPL-3.0 ⚠️ unverified.
- **Maintenance:** Believed unmaintained (no release in years) ⚠️ unverified. It depends on espeak and has Python C-extension build issues on arm64.
- **Avoid when:** Always prefer stable-ts or WhisperX.
- **Verdict:** **Skip.** It is listed only so the reason for excluding it is on record.

### C. Voice and Audio for Video

**11. Kokoro (kokoro-onnx)** — https://github.com/thewh1teagle/kokoro-onnx
- **Role:** High-quality local TTS on ONNX Runtime with a small (82M-parameter) model.
- **Licence:** Code is MIT and the Kokoro model is Apache-2.0.\[26\] These are clean terms for commercial voiceover.\[27\]
- **Version and maintenance:** 0.6.1 (19 Aug 2026). Requires Python ≥3.10 and <3.14. Active.\[26\]
- **Install:** `uv add kokoro-onnx soundfile`, then download the model files from the project's releases.\[28\]
- **Pairs with:** stable-ts (align the generated VO back to the script), ffmpeg-normalize, pedalboard, sox.
- **Use when:**
  - The agent writes the script and needs scratch or final VO offline.
- **Avoid when:**
  - You need a cloned or custom voice.
  - You need many languages at broadcast quality (evaluate per project).
- **VCR caveats:** The same text, voice and runtime should give identical audio, but pin onnxruntime and cache the WAVs as fixtures.
- **Verdict:** **Strong candidate.**

**12. Piper (piper1-gpl)** — https://github.com/OHF-Voice/piper1-gpl
- **Role:** A fast local neural TTS engine with many voices.\[29\]
- **Licence:** **GPL-3.0** since v1.3.0, which embeds espeak-ng.\[1\] Each voice model has its own licence, so check before commercial use.
- **Version and maintenance:** v1.8.0 (4 Sep, 2026 inferred).\[30\] Active, but the README says the Open Home Foundation is seeking maintainers. The old `rhasspy/piper` repository was archived on 6 Oct 2025.\[29\]\[31\]
- **Install:** `uv tool install piper-tts`.\[29\]
- **Pairs with:** sox, ffmpeg-normalize.
- **Use when:**
  - You need non-English voices that Kokoro lacks.
  - You need very low-latency drafts.
- **Avoid when:**
  - Licence simplicity matters (Kokoro).
- **Verdict:** **Worth cataloguing**, with the GPL flag recorded.

**13. ffmpeg-normalize** — https://github.com/slhck/ffmpeg-normalize
- **Role:** EBU R128 two-pass loudness normalisation, plus RMS and peak modes, as a single CLI.\[32\]
- **Summary:** Includes presets (`--preset podcast`), batch/album mode, selective audio streams and skip-if-within-threshold. Since v1.38 it writes directly to the destination file.\[33\]
- **Licence:** MIT ⚠️ unverified (libraries.io shows "Other").\[32\]
- **Version and maintenance:** 1.43.0 (conda-forge and libraries.io).\[32\]\[34\] The GitHub release v1.36.0 is dated 2025-11-03. Active.\[35\]
- **Install:** `uvx ffmpeg-normalize in.mp4 -o out.mp4`.\[33\]
- **Pairs with:** ffmpeg-ffprobe, sox, pedalboard.
- **Use when:**
  - Hitting platform loudness targets (for example −14 LUFS for streaming or −23 LUFS for broadcast) on final mixes.
- **Avoid when:**
  - You need creative dynamics processing (pedalboard).
- **Verdict:** **Strong candidate.**

**14. madmom / BeatNet (beat and downbeat tracking)** — https://github.com/CPJKU/madmom
- **Role:** Beat-synchronised cuts and animation cues.
- **Licence:** Code BSD, but **madmom model files are CC BY-NC-SA** ⚠️ unverified.
- **Maintenance:** Releases are years old and arm64 builds are fiddly ⚠️ unverified.
- **Use when:** aubio and essentia beat trackers are not accurate enough.
- **Avoid when:** In most cases. aubio, essentia and librosa (already catalogued) cover this.
- **Verdict:** **Niche, keep in mind.** The non-commercial model terms are a blocker.

### D. Encoding and Delivery

**15. SVT-AV1** — https://gitlab.com/AOMediaCodec/SVT-AV1
- **Role:** The production AV1 encoder, used through FFmpeg `libsvtav1` or `SvtAv1EncApp`.
- **Licence:** BSD-3-Clause-Clear plus the AOM patent licence ⚠️ unverified.
- **Version and maintenance:** v4.2.0 (2026-07-14). Active.\[36\]\[37\]
- **Install:** `brew install svt-av1` ⚠️ unverified. Homebrew's ffmpeg typically links it.
- **Pairs with:** ffmpeg-ffprobe, ab-av1, vmaf.
- **Use when:**
  - Producing web delivery masters at the smallest size for a given quality.
- **Avoid when:**
  - You need alpha video (use ProRes 4444 or VP9 with alpha).
  - Targets need maximum compatibility (H.264).
- **Verdict:** **Strong candidate.** It may be catalogued as an FFmpeg capability.

**16. ab-av1** — https://github.com/alexheretic/ab-av1
- **Role:** Searches for the CRF that hits a target VMAF, then encodes. It supports SVT-AV1 and other FFmpeg encoders (for example libx265).\[2\]\[38\]
- **Summary:** v0.11.5 added `crf-search --stdout-format json`, giving newline-delimited JSON an agent can parse. It encodes to a temporary file and then renames, so outputs are atomic. svt-av1 quarter-step CRF requires svt-av1 4.0 or later.\[2\]
- **Licence:** MIT ⚠️ unverified.
- **Version and maintenance:** v0.11.7 (21 Aug, 2026 inferred). Active.\[2\]\[39\]
- **Install:** `brew install ab-av1` (formula listed by Repology).\[40\]
- **Pairs with:** ffmpeg-ffprobe, vmaf, svt-av1.
- **Use when:**
  - You want quality-targeted delivery without hand-tuning CRF.
- **Avoid when:**
  - You need parallel scene-chunked encodes of long files (Av1an).
- **Verdict:** **Strong candidate.**

**17. Av1an** — https://github.com/master-of-zen/Av1an
- **Role:** Scene-chunked parallel encoding with per-scene quality targeting.
- **Licence:** GPL-3.0 ⚠️ unverified.
- **Maintenance:** ⚠️ unverified. Its VapourSynth dependency (already catalogued) complicates macOS installs.
- **Use when:** Encoding long-form deliveries.
- **Avoid when:** Producing short motion-graphics clips (ab-av1 is simpler).
- **Verdict:** **Niche, keep in mind.**

**18. rav1e** — https://github.com/xiph/rav1e
- **Role:** A Rust AV1 encoder.
- **Licence:** BSD-2-Clause ⚠️ unverified.
- **Install:** `brew install rav1e` ⚠️.
- **Verdict:** **Skip** in favour of SVT-AV1, which is faster and the de facto standard. Mention it only in SVT-AV1's `notes`.

**19. libavif (avifenc / avifdec)** — https://github.com/AOMediaCodec/libavif
- **Role:** AVIF still and animated-AVIF encoding, including alpha.
- **Licence:** BSD-2-Clause ⚠️ unverified.
- **Version and maintenance:** v1.4.2 (2026-05-26). Active.\[41\]
- **Install:** `brew install libavif`. Check with `avifenc --version`.\[42\]
- **Pairs with:** sharp, libvips, imagemagick, gifski.
- **Use when:**
  - Producing alpha-capable animated web assets far smaller than GIF or APNG.
  - Producing posters and thumbnails.
- **Avoid when:**
  - The target platform lacks AVIF support (fall back to WebP or GIF).
- **VCR caveats:** It reads PNG frame sequences directly, so it fits VCR's alpha-PNG pipeline. Pin the codec (aom or svt) and speed settings for byte-stable output.
- **Verdict:** **Strong candidate.**

**20. libwebp tools (img2webp, gif2webp, cwebp)** — https://chromium.googlesource.com/webm/libwebp
- **Role:** Animated and still WebP with alpha.
- **Licence:** BSD-3-Clause ⚠️ unverified.
- **Install:** `brew install webp` ⚠️.
- **Pairs with:** gifski, sharp.
- **Use when:**
  - You need an animated alpha loop for web or chat platforms where WebP is supported.
- **Avoid when:**
  - Quality per byte matters most (AVIF).
- **Verdict:** **Worth cataloguing.**

**21. libjxl (cjxl / djxl)** — https://github.com/libjxl/libjxl
- **Role:** JPEG XL encoding, including lossless and high-bit-depth masters.
- **Licence:** Conflicting sources: BSD-3-Clause in packaging versus Apache-2.0 in older vendoring.\[43\]\[44\] Check the repository LICENSE.
- **Version and maintenance:** v0.12.0 (1 Jul, 2026 inferred), with v0.13.0 in preparation. Active.\[45\]\[46\]
- **Install:** `brew install jpeg-xl` ⚠️.
- **Use when:**
  - Archiving lossless intermediate stills compactly.
- **Avoid when:**
  - Delivering to the web, where browser support is still partial (use AVIF or WebP).
- **Verdict:** **Niche, keep in mind.**

**22. oxipng** — https://github.com/oxipng/oxipng
- **Role:** Lossless PNG optimiser in Rust that preserves alpha.\[5\]
- **Licence:** MIT.
- **Version and maintenance:** v10.2.1 (2 Sep, year not shown). Active.\[47\]
- **Install:** `brew install oxipng` ⚠️.
- **Pairs with:** resvg, playwright, sharp.
- **Use when:**
  - Shrinking golden PNG fixtures and stills deliverables without changing pixels.
- **Avoid when:**
  - Lossy reduction is acceptable (pngquant).
- **VCR caveats:** Pixel-identical by design, so it is safe to run in the fixture pipeline. Verify with odiff.
- **Verdict:** **Strong candidate.**

**23. pngquant / libimagequant** — https://pngquant.org/
- **Role:** Lossy palette quantisation with alpha.\[48\]
- **Licence:** **GPL-3.0-or-later**, with a commercial licence also available.\[48\]\[49\]
- **Version and maintenance:** 3.0.3 per pngquant.org (the repository has bumped to 3.0.4). No GitHub releases are published, so the date is ⚠️ unverified.\[48\]\[50\]\[51\]
- **Install:** `brew install pngquant` ⚠️.
- **Use when:**
  - Small PNG stickers or overlays for the web.
- **Avoid when:**
  - Files are fixtures or masters (it is lossy).
- **Verdict:** **Worth cataloguing**, with the GPL flag recorded.

**24. gifsicle** — https://github.com/kohler/gifsicle
- **Role:** GIF optimisation and editing (lossy, colour reduction, frame ops).\[52\]
- **Licence:** **GPL-2.0**.\[52\]\[53\]
- **Version and maintenance:** v1.98 (git tag, 15 Oct 2026). Active.\[53\]\[54\]
- **Install:** `brew install gifsicle` ⚠️.
- **Pairs with:** gifski, asciinema agg (agg's own docs recommend `gifsicle --lossy=80`).\[55\]
- **Use when:**
  - Post-optimising gifski or agg output.
- **Avoid when:**
  - Creating GIFs from frames (gifski is better quality).
- **Verdict:** **Worth cataloguing.**

**25. Bento4 / Shaka Packager** — https://github.com/axiomatic-systems/Bento4 and https://github.com/shaka-project/shaka-packager
- **Role:** fMP4, HLS and DASH packaging.
- **Licence and versions:** ⚠️ unverified (Bento4 is GPL-2.0 with commercial options; Shaka Packager is BSD).
- **Use when:** VCR ever needs adaptive streaming output.
- **Avoid when:** In most cases. VCR delivers files, and FFmpeg's HLS muxer covers simple needs.
- **Verdict:** **Niche, keep in mind.**

### E. Terminal, Code and Developer Content

**26. VHS** — https://github.com/charmbracelet/vhs
- **Role:** Scripted terminal recordings from `.tape` files, output as GIF, MP4, WebM or PNG frames.
- **Summary:** A declarative DSL (Type, Sleep, Wait, Env, Source, Screenshot) drives a real shell through ttyd and headless Chromium, then encodes with FFmpeg.\[56\]\[57\]\[58\]
- **Licence:** MIT ⚠️ unverified.
- **Version and maintenance:** v0.12.1 (24 Sep, 2026 inferred, after v0.11.0 on 2026-03-10). Active.\[56\]\[59\]
- **Install:** `brew install vhs` (pulls ttyd and ffmpeg) ⚠️. Check with `vhs --version`.
- **Pairs with:** ffmpeg-ffprobe, gifski, playwright.
- **Use when:**
  - CLI demos for product videos.
  - Tapes checked in as reproducible scripts.
- **Avoid when:**
  - You need frame-exact seekability. It records in **real time**, so timing jitter means output is *not* a pure function of t.
  - You need to composite precisely (render a terminal component in a browser scene instead).
- **VCR caveats:** Treat VHS output as a source asset, not a deterministic render. Mitigate with `Set TypingSpeed`, `Wait` and fixed fonts and themes.
- **Verdict:** **Strong candidate**, used as an asset generator.

**27. freeze** — https://github.com/charmbracelet/freeze
- **Role:** Images of code or ANSI terminal output (PNG, SVG, WebP) with window chrome, padding and shadows.\[60\]
- **Licence:** MIT ⚠️ unverified.
- **Version and maintenance:** v0.1.6 seen; the date is ⚠️ unverified (may be slow).\[61\]
- **Install:** `brew install charmbracelet/tap/freeze`.\[60\]
- **Pairs with:** resvg (rasterise its SVG output deterministically), satori.
- **Use when:**
  - Code stills or SVG layers to animate in GSAP.
  - Capturing a command's output with `--execute`.
- **Avoid when:**
  - You need animated code transitions (@shikijs/magic-move).
- **Verdict:** **Worth cataloguing.** Its SVG output is the VCR-friendly part.

**28. asciinema + agg** — https://github.com/asciinema/agg
- **Role:** Render asciicast v1, v2 or v3 recordings to GIF using gifski, with themes, speed, idle limiting and frame selection.\[62\]
- **Licence:** **GPL-3.0-or-later.** The repository README says "All code is licensed under the GPL, v3 or later", and Homebrew's agg formula lists the same. Earlier sources disagreed; the FreeBSD port's Apache-2.0 label is wrong.
- **Version and maintenance:** 1.7.0 is widely packaged. FreeBSD ports show 1.9.0 (port updated 2026-07-21). Active.\[63\]\[64\]
- **Install:** `cargo install --git https://github.com/asciinema/agg` (brew availability ⚠️ unverified).\[65\]
- **Pairs with:** gifski, gifsicle.\[55\]
- **Use when:**
  - Re-rendering an existing `.cast` with consistent theming. Rendering is deterministic from the cast's event timestamps.
- **Avoid when:**
  - Scripting a new demo (VHS).
- **Verdict:** **Worth cataloguing.** A `.cast` re-renders more deterministically than VHS capture.

**29. @shikijs/magic-move** — https://shiki.style/packages/magic-move
- **Role:** Animated code-diff transitions ("magic move") between code states, with Shiki highlighting.
- **Summary:** A framework-agnostic core plus Vue, React, Solid, Svelte and Web Component wrappers.\[66\] The old `shiki-magic-move` package was archived on 3 Jun 2026 and now re-exports this package.\[67\]
- **Licence:** MIT.
- **Version and maintenance:** 4.5.0 (published within the last month). Active.\[68\]
- **Install:** `pnpm add @shikijs/magic-move shiki`.
- **Pairs with:** gsap, playwright, motion, web-animations-api.
- **Use when:**
  - Code-walkthrough scenes in browser compositions.
- **Avoid when:**
  - You need a static code image (freeze).
- **VCR caveats:** It animates with CSS transitions by default, so it is **not** natively seekable. Drive it with the precompiled or renderer API and map its transitions onto the GSAP timeline, or sample under the deterministic `beginFrame` clock. Verify with odiff.
- **Verdict:** **Strong candidate**, as long as it is driven through GSAP.

**30. Code Hike** — https://codehike.org
- **Role:** MDX-based code walkthrough components.
- **Licence and version:** ⚠️ unverified.
- **Verdict:** **Niche, keep in mind.** It is oriented to documents rather than timelines, so magic-move fits VCR better.

### F. Diagrams, Typesetting and Vector Motion

**31. D2** — https://github.com/terrastruct/d2
- **Role:** A text-to-diagram language with a self-contained Go CLI that outputs SVG, PNG, PDF, PPTX and ASCII.\[69\]\[70\]
- **Summary:** Offers multiple layout engines.\[70\] The TALA layout engine is now open source under MPL-2.0.\[69\] Recent releases make SVG rendering about 10× faster and render Markdown labels as native SVG instead of `foreignObject`, which is better for resvg rasterisation.\[71\]
- **Licence:** MPL-2.0.
- **Version and maintenance:** v0.7.1 (19 Aug 2025) is confirmed.\[72\]\[73\] The releases page also lists v0.8.2 and v0.9.0 (dates ⚠️ unverified). Active.\[71\]
- **Install:** `brew install d2` ⚠️. Check with `d2 --version`.
- **Pairs with:** resvg, svgo, gsap, svg-js, mermaid-cli, graphviz.
- **Use when:**
  - Architecture or explainer diagrams whose SVG nodes you then animate in GSAP.
  - Diagrams that need steps or scenarios for build-up sequences.
- **Avoid when:**
  - Mermaid syntax is already in use (mermaid-cli).
  - The layout is a pure graph (graphviz).
- **Verdict:** **Strong candidate.**

**32. Typst** — https://github.com/typst/typst
- **Role:** A fast, deterministic typesetting CLI that outputs PDF, PNG and SVG, for title cards, equations, tables and data-driven stills.
- **Licence:** Apache-2.0.
- **Version and maintenance:** 0.14.2 (12 Dec 2025, a security fix). 0.15.0-rc.1 came out on 9 Jun 2026,\[74\] and 0.15.0 is reported as released on 15 Jun 2026 by a third-party changelog. Active.\[75\]
- **Install:** `brew install typst`, or `uv add typst` for the Python binding with arm64 wheels. Check with `typst --version`.
- **Pairs with:** resvg, svgo, manim-community, imagemagick.
- **Use when:**
  - Typographically rich stills or overlays, equations without a LaTeX install, or batch-generated cards from JSON with `--input`.
- **Avoid when:**
  - You need animated typesetting (Manim or GSAP).
- **VCR caveats:** Embed fonts through `--font-path` to avoid system font variation.
- **Verdict:** **Strong candidate.**

**33. Penrose** — https://github.com/penrose/penrose
- **Role:** Mathematical diagrams from domain, substance and style programs, optimised layouts and SVG output.
- **Licence:** MIT ⚠️. **Version:** ⚠️ unverified.
- **Use when:** Generating families of math or concept diagrams.
- **Avoid when:** Most cases, where D2 or Typst is simpler.
- **VCR caveats:** Layout uses optimisation with a seed, so pin the variation seed.
- **Verdict:** **Niche, keep in mind.**

**34. flubber** — https://github.com/veltman/flubber
- **Role:** Smooth SVG shape-to-shape morph interpolation.
- **Licence:** MIT ⚠️.
- **Maintenance:** Believed unmaintained (no release for years) ⚠️ unverified.
- **Use when:** Morphing arbitrary paths with mismatched point counts. It is a pure function of t and fits GSAP via `onUpdate`.
- **Avoid when:** GSAP's MorphSVG plugin is available (now free in GSAP 3.13+ ⚠️ unverified).
- **Verdict:** **Niche, keep in mind.** It is unique but stale.

**35. python-lottie** — https://gitlab.com/mattbas/python-lottie
- **Role:** Create, convert and render Lottie or TGS from Python. `lottie_convert.py` handles SVG, Lottie, PNG frames, WebP and GIF.\[76\]\[77\]
- **Licence:** AGPL-3.0 ⚠️ unverified.
- **Version and maintenance:** 0.7.2 (1 May 2025). Slow.\[78\]
- **Install:** `uv tool install lottie`. PNG export needs glaxnimate or cairosvg.\[79\]
- **Pairs with:** lottie-web, dotlottie, rive-web.
- **Use when:**
  - Programmatically generating Lottie JSON from an agent for app or web delivery.
- **Avoid when:**
  - Rendering Lottie to frames for video. Use lottie-web in Chromium with `goToAndStop`, which is seekable and already catalogued.
- **Verdict:** **Niche, keep in mind.**

**36. Glaxnimate** — https://glaxnimate.mattbas.org
- **Role:** An open-source vector animation editor with a headless Python API for SVG and Lottie conversion.\[80\]\[81\]
- **Licence:** GPL-3.0 ⚠️.
- **Version and maintenance:** The Python binding 0.6.0.3 (3 Mar 2026) ships **only a Linux x86-64 wheel**, so `pip` install on macOS arm64 is not available.\[81\]
- **Verdict:** **Skip** for VCR on macOS arm64.

**37. rlottie / Skottie** — https://github.com/Samsung/rlottie
- **Role:** Native Lottie rasterisers.
- **Licence:** rlottie is MIT plus third-party components ⚠️. **Maintenance:** ⚠️ unverified.
- **Verdict:** **Niche, keep in mind.** canvaskit-skia (already catalogued) exposes Skottie in the browser path, which makes rlottie mostly redundant.

### G. Shaders and Procedural

**38. glslViewer** — https://github.com/patriciogonzalezvivo/glslViewer
- **Role:** A headless GLSL shader renderer: render fragment and vertex shaders, or 3D models with shaders, to PNG sequences from the CLI, with uniforms such as `u_time`.\[82\]
- **Licence:** BSD-3-Clause (Homebrew).\[83\]
- **Version and maintenance:** 3.5.2 (date ⚠️ unverified).\[83\]\[84\]
- **Install:** `brew install glslviewer` (confirmed formula). Check with `glslViewer --version`.\[83\]
- **Pairs with:** ffmpeg-ffprobe, glslify, webgl, regl, twgl.
- **Use when:**
  - Rendering Shadertoy-style shaders natively at fixed time steps outside Chromium.
  - Shader preview and iteration with file watching.
- **Avoid when:**
  - Shaders must composite with DOM or GSAP layers (render them in WebGL in the browser scene).
- **VCR caveats:** Use its sequence or record mode with explicit time stepping. GPU float differences between machines can break bit-identical fixtures, so use perceptual tolerances (dssim) for shader fixtures.
- **Verdict:** **Worth cataloguing.**

**39. naga (naga-cli)** — https://github.com/gfx-rs/wgpu
- **Role:** Shader translation and validation between WGSL, GLSL, SPIR-V and MSL.
- **Licence:** MIT/Apache-2.0 ⚠️. **Version:** ⚠️ unverified (ships with wgpu releases).
- **Install:** `cargo install naga-cli`.
- **Pairs with:** webgpu, three-js-shading-language.
- **Use when:**
  - An agent must validate WGSL before a render or port GLSL to WGSL.
- **Verdict:** **Niche, keep in mind.**

**40. Material Maker** — https://github.com/RodZill4/material-maker
- **Role:** A Godot-based procedural texture and material graph editor.
- **Automation:** Primarily GUI, with CLI export ⚠️ unverified.
- **Licence:** MIT ⚠️.
- **Verdict:** **Niche, keep in mind.** Automation is weak.

### H. 3D Rendering (Headless)

**41. f3d** — https://github.com/f3d-app/f3d
- **Role:** A fast minimal 3D viewer with headless rendering to image. It handles glTF, USD, STEP, OBJ, PLY and **3D Gaussian splats (.splat)**, and offers turntables and HDRI lighting.
- **Summary:** v3.0 replaced the separate headless builds with `--rendering-backend` (EGL and others).\[85\] A later 3.x release added **headless rendering on macOS** and Windows, plus libf3d Python wheels and WASM bindings.\[86\]
- **Licence:** BSD-3-Clause ⚠️ unverified.
- **Version and maintenance:** v3.5.0 (5 Apr, 2026 inferred). Active.\[86\]
- **Install:** `brew install --cask f3d` ⚠️, or `uv add f3d` for the Python wheels.
- **Pairs with:** gltf-transform, blender, openusd, open3d, trimesh, meshoptimizer.
- **Use when:**
  - Quick deterministic thumbnails or contact sheets of 3D assets.
  - Gaussian-splat preview stills.
  - Asset QA in CI.
- **Avoid when:**
  - Producing beauty renders or animation (Blender).
  - The 3D content is composited in a scene (three-js).
- **Verdict:** **Strong candidate.**

**42. Mitsuba 3** — https://github.com/mitsuba-renderer/mitsuba3
- **Role:** A research-grade differentiable spectral path tracer with a Python API and arm64 wheels, including a Metal/LLVM variant ⚠️.
- **Licence:** BSD-3-Clause ⚠️. **Version:** ⚠️ unverified.
- **Use when:**
  - Physically accurate stills with seeded, reproducible sampling.
  - Inverse rendering.
- **Avoid when:** General motion work (Blender Cycles is already catalogued).
- **Verdict:** **Niche, keep in mind.**

**43. CadQuery / OpenSCAD** — https://github.com/CadQuery/cadquery and https://openscad.org
- **Role:** Parametric CAD to mesh for product shots.
- **Licence:** CadQuery is Apache-2.0 ⚠️ and OpenSCAD is GPL-2.0 ⚠️.
- **Notes:** OpenSCAD has a headless `-o out.png` render path, but its releases have historically been infrequent (development snapshots are more current) ⚠️ unverified.
- **Avoid when:** build123d (already catalogued) covers the Python CAD role. CadQuery is largely redundant with it.
- **Verdict:** OpenSCAD is **niche, keep in mind** (for its one-line CLI renders). CadQuery is **skip** (redundant).

**44. pyrender** — https://github.com/mmatl/pyrender
- **Role:** Minimal Python glTF renderer for offscreen rendering.
- **Maintenance:** Believed unmaintained ⚠️. Offscreen OSMesa/EGL support on macOS is poor.
- **Verdict:** **Skip.** Use f3d or Blender instead.

### I. Data Visualisation to Stills and Video

**45. vl-convert** — https://github.com/vega/vl-convert
- **Role:** Dependency-free Vega and Vega-Lite rendering to SVG, PNG and PDF from Python or a CLI (embedded Deno; no Node or browser needed).\[87\]\[88\]
- **Licence:** BSD-3-Clause.\[89\]
- **Version and maintenance:** vl-convert-python 1.9.0.post1 (21 Jan 2026), with 2.0.0rc7 in pre-release. Active.\[90\]\[91\]
- **Install:** `uv add vl-convert-python`.\[88\]
- **Pairs with:** d3, resvg, svgo, gsap.
- **Use when:**
  - Agent-generated chart stills from JSON specs.
  - Chart SVGs to animate in GSAP.
- **Avoid when:**
  - Charts need bespoke animation logic (d3 in the browser scene).
- **Verdict:** **Strong candidate.**

**46. Plotly + Kaleido** — https://github.com/plotly/Kaleido
- **Role:** Static export of Plotly figures.
- **Notes:** Kaleido v1 reportedly requires a local Chrome install ⚠️ unverified. That overlaps with Playwright, so it adds little.
- **Verdict:** **Skip** unless Plotly is already in use.

**47. gnuplot** — http://www.gnuplot.info
- **Role:** A classic scriptable plotter (`brew install gnuplot`) with SVG and PNG terminals.
- **Licence:** gnuplot licence (permissive but unusual) ⚠️.
- **Verdict:** **Niche, keep in mind.** vl-convert is a better fit for agents.

**48. Bar-chart-race generators** — https://github.com/dexplo/bar_chart_race
- **Role:** Matplotlib-based bar-chart-race videos.
- **Maintenance:** Believed unmaintained ⚠️.
- **Verdict:** **Skip.** Build races as d3 plus GSAP scenes in VCR's own timeline, which keeps them seekable.

### J. Image Processing and Local AI

**49. rembg** — https://github.com/danielgatis/rembg
- **Role:** Background removal to alpha PNG, through a CLI, a Python library or an HTTP server, with several model backends (U²-Net, BiRefNet, and others).\[92\]
- **Licence:** MIT for the code.\[93\] The weights of each model have their own terms, so record them per model.
- **Version and maintenance:** 2.0.86 (21 Oct 2026). Active.\[94\]
- **Install:** `uv tool install "rembg[cli]"` ⚠️ the extras name is unverified.
- **Pairs with:** segment-anything, sharp, imagemagick, real-esrgan.
- **Use when:**
  - Cutting product or people stills for alpha compositing.
  - Batch folder processing (`rembg p`).
- **Avoid when:**
  - Matting video with temporal stability (RobustVideoMatting).
  - You need prompt-based selection (segment-anything).
- **Verdict:** **Strong candidate.**

**50. RIFE (Practical-RIFE) / FILM** — https://github.com/hzwer/Practical-RIFE and https://github.com/google-research/frame-interpolation
- **Role:** ML frame interpolation for slow-motion, or smoothing low-fps sources.
- **Licence:** RIFE is MIT ⚠️ and FILM is Apache-2.0 ⚠️. **Versions:** ⚠️ unverified. Releases come as code or model drops rather than packaged tools.
- **Use when:** Retiming *footage* sources.
- **Avoid when:** Retiming VCR's own renders. Render at the target fps instead, because interpolation breaks the "pure function of t" guarantee.
- **Verdict:** **Niche, keep in mind.**

**51. Depth Anything V2** — https://github.com/DepthAnything/Depth-Anything-V2
- **Role:** Monocular depth maps for 2.5D parallax ("3D photo") moves.
- **Licence:** The README states: "Depth-Anything-V2-Small model is under the Apache-2.0 license. Depth-Anything-V2-Base/Large/Giant models are under the CC-BY-NC-4.0 license." Only the Small model (24.8M parameters) is safe for commercial use. Flag this in the record.
- **Pairs with:** three-js (displacement plane), comfyui.
- **Verdict:** **Worth cataloguing**, restricted to the Small model.

**52. RobustVideoMatting** — https://github.com/PeterL1n/RobustVideoMatting
- **Role:** Temporally stable human video matting to alpha.
- **Licence:** GPL-3.0 ⚠️.
- **Maintenance:** Believed unmaintained since about 2021–22 ⚠️.
- **Verdict:** **Niche, keep in mind.** It is still the reference for people matting, but it is stale and GPL.

**53. lutgen** — https://github.com/ozwaldorf/lutgen-rs
- **Role:** Generate Hald CLUTs from colour palettes, for palette-locked grading.
- **Licence and version:** ⚠️ unverified.
- **Pairs with:** opencolorio, ffmpeg-ffprobe (`haldclut` filter), imagemagick.
- **Verdict:** **Niche, keep in mind.**

### K. Declarative Video Frameworks (Reference Only, per ADR 0001)

**54. Revideo** — https://github.com/midrender/revideo
- **Role:** A TypeScript fork of Motion Canvas with headless rendering, a render-over-HTTP server and a React player.\[95\]\[96\]\[97\]
- **Licence:** MIT.
- **Version and maintenance:** `@revideo/core` 0.11.0 (published about 2 months ago).\[98\] The repository moved from redotvideo to midrender, publishes **no GitHub releases**, and requires Node ≥22.12. Active on npm.\[99\]\[100\]
- **Pairs with:** motion-canvas, remotion, ffmpeg-ffprobe.
- **Use when:**
  - Studying a generator-function timeline plus headless renderer design for VCR's in-house compositor.
- **Avoid when:**
  - Taking a production dependency (ADR 0001).
  - motion-canvas, already catalogued, would do.
- **Verdict:** **Worth cataloguing** as a reference.

**55. MoviePy v2** — https://github.com/Zulko/moviepy
- **Role:** Python clip composition over FFmpeg.
- **Licence:** MIT ⚠️. **Version:** v2.x ⚠️ unverified.
- **Use when:** Simple Python-side assembly scripts.
- **Avoid when:** VCR already has editly, mlt-melt and opentimelineio, and its own compositor is planned.
- **Verdict:** **Skip** (redundant).

## Recommendations

1. **Add immediately as `candidate` and prototype in this order:**
   1. odiff, wired into a `vcr verify` step comparing re-rendered frames against goldens.
   2. ffmpeg-normalize, in the delivery path.
   3. stable-ts and WhisperX, producing word-timed JSON into GSAP captions, with libass for the FFmpeg-only burn-in path.
   4. kokoro-onnx, for local VO.
   5. ab-av1 with SVT-AV1 and VMAF, for quality-targeted AV1.
   6. avifenc and oxipng, for stills and animated-image delivery.
2. **Add the asset generators:** VHS, freeze, agg, D2, Typst, vl-convert and f3d. Mark VHS as a *non-deterministic source asset* in `notes`.
3. **Add @shikijs/magic-move** only together with a documented GSAP-driven seek adapter. Gate it with odiff tests before promoting it.
4. **Licence hygiene:** Record AGPL (dssim), GPL (Piper, pngquant, gifsicle, asciinema agg, Av1an, RobustVideoMatting) and model-weight terms (Kokoro, Piper voices, Depth Anything, madmom, rembg models) in `license` and `notes`. Prefer running GPL and AGPL tools as external CLIs, never as linked libraries.
5. **Determinism policy for ML tools:** Commit generated artefacts (alignment JSON, TTS WAVs, mattes) as fixtures keyed by tool version. Never regenerate them inside a "frame N" render.

## Caveats

- **Gaps where no good open-source tool was found:**
  - A maintained, macOS-arm64-installable, seekable **native Lottie/Skottie frame renderer CLI**. The best path remains lottie-web or canvaskit in Chromium.
  - A maintained **kinetic typography generator**. Build it in GSAP instead.
  - A permissively licensed, maintained **video matting** model with temporal stability.
  - An open **EDL/AAF conversion CLI** beyond OpenTimelineIO adapters (already catalogued).
- **Deliberately excluded:**
  - aeneas: stale and AGPL.
  - Glaxnimate: no macOS arm64 wheel.\[81\]
  - pyrender: unmaintained.
  - rav1e: superseded in practice by SVT-AV1.
  - Kaleido: needs Chrome and duplicates Playwright.
  - bar_chart_race: unmaintained.
  - CadQuery and MoviePy: redundant with build123d and editly/mlt.
  - Coqui TTS forks: fragmented maintenance and CPML model licences on XTTS.
  - Terminalizer: slower Electron-based pipeline; VHS and agg are better.
- **Verification limits:**
  - Many dates show only day and month on GitHub. Where the year was inferred from adjacent releases, the entry says so.
  - Fields marked ⚠️ (several licences, Homebrew formula names, and versions for Penrose, flubber, Mitsuba, naga, RIFE, Code Hike and lutgen) need a check against the repository LICENSE and `brew info` before records are committed.
  - Sources still conflict on the libjxl licence (BSD-3 vs Apache-2.0). The asciinema agg licence is settled as GPL-3.0-or-later by its README and Homebrew formula.
- **Relative dates:** Relative dates such as "published 2 months ago" on npm come from registry pages as crawled. They should be converted to absolute dates by checking the registry when each record is written.

## Sources

1. [github.com](https://github.com/OHF-voice/piper1-gpl/releases)
2. [Releases · alexheretic/ab-av1 · GitHub](https://github.com/alexheretic/ab-av1/releases)
3. [odiff-bin - npm](https://www.npmjs.com/package/odiff-bin)
4. [fonttools 4.62.1 on PyPI - Libraries.io - security & maintenance data for open source software](https://libraries.io/pypi/fonttools)
5. [github.com](https://github.com/shssoichiro/OxiPNG)
6. [Releases · dmtrKovalenko/odiff · GitHub](https://github.com/dmtrKovalenko/odiff/releases)
7. [odiff bin no output](https://www.npmjs.com/package/odiff-bin-no-output)
8. [odiffr: Fast Pixel-by-Pixel Image Comparison Using 'odiff'](https://cran.rstudio.com/web/packages/odiffr/odiffr.pdf)
9. [GitHub - Netflix/vmaf: Perceptual video quality assessment based on multi-method fusion. · GitHub](https://github.com/Netflix/vmaf)
10. [github.com](https://github.com/kbostan/vmaf)
11. [dssim/Cargo.toml at main · kornelski/dssim · GitHub](https://github.com/kornelski/dssim/blob/main/Cargo.toml)
12. [dssim-core - crates.io: Rust Package Registry](https://crates.io/crates/dssim-core)
13. [GitHub - kornelski/dssim at dssim1-c · GitHub](https://github.com/kornelski/dssim/tree/dssim1-c)
14. [dssim — Homebrew Formulae](https://formulae.brew.sh/formula/dssim)
15. [Releases · kornelski/dssim · GitHub](https://github.com/kornelski/dssim/releases)
16. [GitHub - m-bain/whisperX: WhisperX: Automatic Speech Recognition with Word-level Timestamps (& Diarization) · GitHub](https://github.com/m-bain/whisperx)
17. [Releases · m-bain/whisperX · GitHub](https://github.com/m-bain/whisperX/releases)
18. [pypi.org](https://pypi.org/project/stable-ts/2.12.2/)
19. [stable-ts · PyPI](https://pypi.org/project/stable-ts/)
20. [github.com](https://github.com/Naituw/libass)
21. [Releases · libass/libass · GitHub](https://github.com/libass/libass/releases)
22. [fonttools](https://deps.dev/pypi/fonttools)
23. [Releases · fonttools/fonttools · GitHub](https://github.com/fonttools/fonttools/releases)
24. [Release 15.0.0 by khaledhosny · Pull Request #6442 · harfbuzz/harfbuzz · GitHub](https://github.com/harfbuzz/harfbuzz/pull/6442)
25. [Releases · harfbuzz/harfbuzz · GitHub](https://github.com/harfbuzz/harfbuzz/releases)
26. [kokoro-onnx · PyPI](https://pypi.org/project/kokoro-onnx/)
27. [GitHub - thewh1teagle/kokoro-onnx: TTS with kokoro and onnx runtime · GitHub](https://github.com/thewh1teagle/kokoro-onnx)
28. [https://github.com/thewh1teagle/kokoro-onnx](https://awesome.ecosyste.ms/projects/github.com/thewh1teagle/kokoro-onnx)
29. [piper1 gpl](https://github.com/OHF-Voice/piper1-gpl)
30. [Release v1.8.0 · OHF-Voice/piper1-gpl · GitHub](https://github.com/OHF-Voice/piper1-gpl/releases/tag/v1.8.0)
31. [Development has moved: https://github.com/OHF-Voice/piper1-gpl](https://github.com/rhasspy/piper)
32. [ffmpeg-normalize 1.43.0 on PyPI - Libraries.io - security & maintenance data for open source software](https://libraries.io/pypi/ffmpeg-normalize)
33. [pypi.org](https://pypi.org/project/ffmpeg-normalize/1.42.0/)
34. [ffmpeg-normalize - conda-forge](https://anaconda.org/conda-forge/ffmpeg-normalize)
35. [Releases · slhck/ffmpeg-normalize · GitHub](https://github.com/slhck/ffmpeg-normalize/releases)
36. [CHANGELOG.md · master · Alliance for Open Media / SVT-AV1 · GitLab](https://gitlab.com/AOMediaCodec/SVT-AV1/-/blob/master/CHANGELOG.md)
37. [v4.2.0 · Alliance for Open Media / SVT-AV1 · GitLab](https://gitlab.com/AOMediaCodec/SVT-AV1/-/releases/v4.2.0)
38. [ab-av1 - Wikidata](https://www.wikidata.org/wiki/Q117789811)
39. [FreshPorts -- multimedia/ab-av1: AV1 re-encoding using ffmpeg, svt-av1 & vmaf](https://www.freshports.org/multimedia/ab-av1)
40. [ab-av1 packages dissection - Repology](https://repology.org/project/ab-av1/information)
41. [Releases · AOMediaCodec/libavif · GitHub](https://github.com/AOMediaCodec/libavif/releases)
42. [github.com](https://github.com/AOMediaCodec/libavif)
43. [Source code](https://searchfox.org/firefox-main/source/media/libjxl/moz.yaml)
44. [FreshPorts -- graphics/libjxl: JPEG XL reference encoder/decoder](https://www.freshports.org/graphics/libjxl/)
45. [Releases · libjxl/libjxl · GitHub](https://github.com/libjxl/libjxl/releases)
46. [Issues · libjxl/libjxl · GitHub](https://github.com/libjxl/libjxl/issues)
47. [Releases · oxipng/oxipng · GitHub](https://github.com/shssoichiro/oxipng/releases)
48. [pngquant — lossy PNG compressor](https://pngquant.org/)
49. [Bump · kornelski/pngquant@515575a · GitHub](https://github.com/kornelski/pngquant/commit/515575a1e2389f18dd1cef8f3865854bc98495a1)
50. [Releases · kornelski/pngquant · GitHub](https://github.com/kornelski/pngquant/releases)
51. [Update lib · kornelski/pngquant@e3bdc7c · GitHub](https://github.com/kornelski/pngquant/commit/e3bdc7c9b8b814409555a7aa30adcfb3997fa115)
52. [Gifsicle (kohler/gifsicle)](https://context7.com/kohler/gifsicle)
53. [gifsicle - conda-forge](https://anaconda.org/conda-forge/gifsicle)
54. [Tags · kohler/gifsicle · GitHub](https://github.com/kohler/gifsicle/tags)
55. [github.com](https://github.com/fazlerabbi37-forks/agg)
56. [Releases · charmbracelet/vhs · GitHub](https://github.com/charmbracelet/vhs/releases)
57. [Release v0.8.0 · charmbracelet/vhs · GitHub](https://github.com/charmbracelet/vhs/releases/tag/v0.8.0)
58. [Release v0.4.0 · charmbracelet/vhs · GitHub](https://github.com/charmbracelet/vhs/releases/tag/v0.4.0)
59. [Release v0.12.1 · charmbracelet/vhs · GitHub](https://github.com/charmbracelet/vhs/releases/tag/v0.12.1)
60. [GitHub - charmbracelet/freeze: Generate images of code and terminal output 📸 · GitHub](https://github.com/charmbracelet/freeze)
61. [Releases: charmbracelet/freeze](https://github.com/charmbracelet/freeze/releases)
62. [agg - asciinema gif generator - asciinema docs](https://docs.asciinema.org/manual/agg/)
63. [FreshPorts -- graphics/asciinema-agg: Asciinema gif generator](https://www.freshports.org/graphics/asciinema-agg)
64. [agg-asciinema packages dissection - Repology](https://repology.org/project/agg-asciinema/information)
65. [github.com](https://github.com/asciinema/agg)
66. [@shikijs/magic-move](https://shiki.style/packages/magic-move)
67. [GitHub - shikijs/shiki-magic-move: Smoothly animated code blocks with Shiki · GitHub](https://github.com/shikijs/shiki-magic-move)
68. [@shikijs/magic-move - npm](https://www.npmjs.com/package/@shikijs/magic-move)
69. [D2 Blog](https://d2lang.com/blog/)
70. [D2 (Terrastruct) File Format — What It Is & How to Convert It](https://graphinout.com/format/d2-declarative-diagramming)
71. [Releases · d2lang/d2 · GitHub](https://github.com/terrastruct/d2/releases)
72. [Release v0.7.1 · terrastruct/d2 · GitHub](https://github.com/terrastruct/d2/releases/tag/v0.7.1)
73. [d2 command - oss.terrastruct.com/d2 - Go Packages](https://pkg.go.dev/oss.terrastruct.com/d2)
74. [Releases · typst/typst · GitHub](https://github.com/typst/typst/releases)
75. [Early Deep Dive into Typst 0.14.0](https://zenn.dev/monaqa/articles/2025-10-24-typst-updates-v0-14?locale=en)
76. [Files · master · Glax / python-lottie](https://gitlab.com/mattbas/python-lottie/-/tree/master)
77. [A framework to work with lottie files and telegram animated stickers (tgs)](https://pypi.org/project/lottie-ps)
78. [lottie · PyPI](https://translate.google.com/translate?u=https%3A%2F%2Fpypi.org%2Fproject%2Flottie%2F&hl=es&sl=en&tl=es&client=srp)
79. [Python Lottie](https://pypi.org/project/lottie/)
80. [pypi.org](https://pypi.org/project/glaxnimate/0.5.1/)
81. [Python Glaxnimate](https://pypi.org/project/glaxnimate/)
82. [github.com](https://github.com/heypoom/glslviewer)
83. [Homebrew Formulae: glslviewer](https://formulae.brew.sh/formula/glslviewer)
84. [Releases · patriciogonzalezvivo/glslViewer · GitHub](https://github.com/patriciogonzalezvivo/glslViewer/releases)
85. [File f3d.changes of Package f3d](https://build.opensuse.org/projects/home:simotek:cmake4/packages/f3d/files/f3d.changes?expand=0)
86. [Releases · f3d-app/f3d · GitHub](https://github.com/f3d-app/f3d/releases)
87. [vl-convert-python 2.0.0rc1 on PyPI - Libraries.io - security & maintenance data for open source software](https://libraries.io/pypi/vl-convert-python)
88. [GitHub - vega/vl-convert: Utilities for converting Vega-Lite specs from the command line and Python · GitHub](https://github.com/vega/vl-convert)
89. [vl-convert-python - PyPI](https://secure.software/pypi/packages/vl-convert-python)
90. [pypi.org](https://pypi.org/project/vl-convert-python/2.0.0rc7/)
91. [vl-convert-python · Python Simple Repository Browser](https://simple-repository.app.cern.ch/project/vl-convert-python)
92. [pypi.org](https://pypi.org/project/rembg/2.0.49/)
93. [rembg · 54.8M downloads on PyPI](https://pepy.tech/projects/rembg)
94. [rembg · PyPI](https://pypi.org/project/rembg/)
95. [Show HN: Revideo](https://news.ycombinator.com/item?id=40646741)
96. [Revideo: Create videos with code](https://www.producthunt.com/products/revideo)
97. [Video Preview with Player](https://docs.re.video/preview-with-player/)
98. [@revideo/core - npm](https://www.npmjs.com/package/@revideo/core)
99. [Releases · midrender/revideo · GitHub](https://github.com/midrender/revideo/releases)
100. [revideo/package.json at main · midrender/revideo · GitHub](https://github.com/midrender/revideo/blob/main/package.json)
