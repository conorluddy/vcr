---
type: discovery-digest
run_date: 2026-11-16
iso_week: 2026-W47
topics: [photosensitivity, flash-detection, device-frames, ios-simulator, webgpu-simulation, pen-plotter, audio-analysis, fluid-simulation, video-processing, generative-art]
seeds: []
searches_used: 30
---
# Discovery leads — 2026-11-16

Summary line: 3 leads (1 in a new category: accessibility and compliance; `pysph` joins the proposed "fluid / particle simulation" category). Thin week: no strong candidates.

## Leads
### iris-pse-detection (`iris-pse-detection`) — worth cataloguing
- [x] triage: assess
- URL: https://github.com/tokoroten/iris-pse-detection (PyPI: https://pypi.org/project/iris-pse-detection/). Upstream: https://github.com/electronicarts/IRIS
- Role: Python port of Electronic Arts' IRIS photosensitive-epilepsy risk detector. CLI `iris video.mp4`, plus a `VideoAnalyser` / `Configuration` library API. Checks luminance and red-saturation flashes over a 1-second transition window, with extended-failure (4 s+) and optional pattern detection.
- Category: 🆕 new category: accessibility and compliance (joins the category first proposed by `video-safety-check`, 2026-11-01)
- Gap vs neighbours: no catalogue record covers flash or photosensitivity checks. `video-safety-check` (2026-11-01, not re-verified this run) is the other flash-checker lead. Caption tools (`ttconv`, `libass`) render or convert captions and do not check flashing, so this is a different axis.
- Route: native-cli-or-scripting
- Licence: MIT (repo and PyPI). Upstream EA IRIS licence: unverified.
- Version + date: 1.1.2, uploaded 2026-01-22 (PyPI). Repo shows no release or commit dates on the page.
- Stars: 2. Last push: unverified.
- Install: `pip install iris-pse-detection` (Python ≥3.10). macOS arm64 wheel availability: unverified. Video decoder dependency: not stated in the README.
- Caveats: PyPI classifier is "Development Status :: 4 - Beta". Two stars and 18 commits suggest a single-maintainer port. The README says results can differ slightly from C++ IRIS at boundary values. Treat output as a screening aid, not a conformance verdict (the same limit applies to any flash checker).
- Found via: WebSearch (photosensitivity / WCAG 2.3.1 flash analysis), PyPI JSON, repo page.

### Vork (`vork`) — niche, keep in mind
- [x] triage: retire
  Reason (2026-11-27): LICENSE read. "vork Preview License" is source-available, not OSI/free: no redistribution of modifications, no sublicensing, no hosted service, later versions may be paid; npm latest is 0.6.2 (lead said 0.5.0). Fails the free-software gate, so no catalogue record. Revisit if it moves to an OSI licence.
- URL: https://github.com/voyager-so/vork
- Role: "Headless 3D and VFX engine for agents. Research preview." A CLI that renders a `scene.json` or `.glb` to PNG stills, or to MP4 over a frame range. Rust and Slang on Vulkan or Metal, with TypeScript and Python SDKs for authoring scenes.
- Category: existing 3D and rendering area, near `blender` and `pov-ray`
- Gap vs neighbours: a headless scene-to-MP4 path with a scripting SDK. Overlaps `blender` for stills and `three-js` for web scenes. Determinism and seek behaviour are not documented, which is the main open question.
- Route: native-cli-or-scripting
- Licence: source-available, not an OSI licence. The LICENSE terms were not read. The page says "free during the research preview". Cannot classify until the terms are read.
- Version + date: a "Vork 0.5.0" mention is not confirmed as the latest release. Release date: unverified.
- Stars: ~1.6k (repo page). Last push: unverified.
- Install: `npm install -g @voyager-so/vork`, or `install.sh` / `install.ps1` from GitHub Releases. Local rendering needs an Apple Silicon Mac, or an NVIDIA or AMD GPU with Vulkan ray queries. A cloud-GPU option exists, which would send scene content to a third party.
- Caveats: research preview; determinism undocumented; licence not classifiable yet.
- Found via: Show HN (2026-11-09, 6 points), then repo page.

### pysph (`pysph`) — niche, keep in mind
- [x] triage: defer
- Triage reason (2026-11-27): Cython/OpenCL build with unverified macOS arm64 install; splishsplash covers SPH. Revisit with an approved install window.
- URL: https://github.com/pypr/pysph (PyPI: https://pypi.org/project/pysph/)
- Role: Python-first Smoothed Particle Hydrodynamics framework, with Cython and PyOpenCL back ends and OpenMP or MPI. Runs write output directories and includes `pysph view`. A fixed-step simulation that could bake particle output for later surfacing (`splashsurf` is already reported).
- Category: joins the proposed "fluid / particle simulation" category (first raised by `splishsplash`, 2026-11-01)
- Gap vs neighbours: `splishsplash` (SPlisHSPlasH) is the reported fluid solver. PySPH is a different, Python-scripted SPH framework, so overlap is high. Neither is catalogued.
- Route: library-or-runtime
- Licence: BSD per PyPI metadata. GitHub reports NOASSERTION, which is a discrepancy. LICENSE.txt not read.
- Version + date: 1.0b2 is the PyPI release, uploaded 2025-05-23, which is beyond the ~12-month activity window. GitHub last push: 2026-08-23 (from search metadata).
- Stars: 551 (GitHub search metadata).
- Install: `pip install pysph`. Cython and OpenCL build; macOS arm64 install unverified. The README points to external docs for install steps. Apple has deprecated OpenCL on macOS, so the OpenCL back end is a doubtful path there; the OpenMP or CPU route is unverified.
- Caveats: latest PyPI version is a beta. The README does not name the output file formats.
- Found via: GitHub topic search (fluid-simulation), PyPI JSON, repo page.

## Seen but rejected
- Particles4All (matsuoka-601) — MIT WebGPU browser app, no build step, no headless or frame-export path, no release.
- f0e/blur — GPL-3.0, GUI-first (prebuilt installers); its `blur-cli` depends on VapourSynth, which is already a candidate. Linux needs manual dependencies.
- Open HashLMG (Hash-7777) — GPL-3.0 Tauri desktop app. Model-driven storyboards, output varies between runs, not scriptable.
- EpiScan (KaliPhobos) — GUI-first, headless mode only planned, no standard cited (no WCAG or Harding reference), no numeric thresholds, and the author disclaims validity.
- epi-lens — browser tool and extension, not scriptable (named in search results only, not inspected).
- nape-js — TypeScript 2D physics, NOASSERTION licence; overlaps `matter-js` and `pymunk`.
- NeoSimulator (lynnswap) — simulator GUI app, not scriptable; same lane as `sim-use`.
- Astral3D (mlt131220) — Vue and Three.js editor app, GUI-oriented.
- Kutta, lineboi3000, Infinite Shaders, Frankaa, shaderfrog — interactive browser or GUI toys, not scriptable renderers.
- Kapso, Yogurt, Obeya, Rystic — not in scope (meeting, agent or productivity tools).
- Show HN Rick and Morty explainer generator (usediorama) — hosted product, not a tool.
- endolith/waveform-analysis — Python scripts collection, MIT, last push 2026-08-25. Not inspected further; overlaps `librosa` and `essentia`.
- Realtime_PyAudio_FFT — real-time streaming analysis to OSC, not offline or deterministic.
- mtg-jamendo-dataset, awesome-audio-dsp — dataset and list, not tools.
- Show HN: Local AI Video Agent (wiyomi), Scatter, Apertrue Witness — apps or services, not scriptable tools.

## Method notes
- GitHub API access is scoped to conorluddy/vcr. Other repos (Particles4All, pysph, f0e/blur, nape-js, EpiScan) were verified from public web pages via WebFetch, and PyPI from its JSON API. Those GitHub API calls were refused as out of scope.
- GitHub topic searches: 6 topics (photosensitivity, device-frames, ios-simulator, webgpu-simulation, pen-plotter, audio-analysis) plus 5 keyword queries (fluid-simulation, webgpu particles, video-processing ffmpeg, generative-art, photosensitive epilepsy flash). The photosensitivity and webgpu-simulation topics returned no results. Most other hits were already reported or were GUI apps.
- Show HN (past 7 days, hn.algolia.com): 8 queries (motion graphics, video cli, svg animation, shader, CAD, accessibility video, ffmpeg, maps tiles). Vork and Open HashLMG came from here.
- Not run this week: the stargazer-overlap pass (seed build123d, vpype or resvg), the reverse-dependency pass, the Homebrew new-formulae feed and Changelog Nightly. These are the next candidates to cover.
- Unverified: IRIS upstream licence; iris-pse-detection stars and last push; macOS install for iris-pse-detection and pysph; Vork licence, release date and determinism; `video-safety-check` (2026-11-01) not re-verified.
- Dedupe: checked against 13 prior digests (2026-11-01 to 2026-11-15), the `catalog/tools` and `catalog/retired` records, and remote `discovery/*` branches (W44–W46). No open discovery PRs. Nothing in this digest repeats a prior lead.
