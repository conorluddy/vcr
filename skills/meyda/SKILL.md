---
name: meyda
description: Use Meyda to extract documented audio features from sample arrays or a Web Audio source. VCR evidence covers only offline RMS on a generated Float32Array with Meyda 5.6.3.
---

# Meyda

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`. Run it from the workspace (the directory holding `vcr.json`).

## Use cases and limits
- Meyda computes audio features such as RMS, spectral centroid, and rolloff from arrays or a Web Audio source. It does not decode arbitrary files or synthesize audio by itself.
- VCR has one deterministic offline fixture: RMS from a generated 512-sample constant Float32Array using the default Hanning window.
- No microphone, audio I/O, Web Audio node, real-world audio, other feature extractors, or sample-rate behavior is validated. Use a separate decoder or Web Audio workflow when the input is not already samples.

## Capability map
- **Array and Web Audio extraction:** see the [getting started guide](https://meyda.js.org/getting-started) and [API reference](https://meyda.js.org/reference/). The fixture exercises `Meyda.extract("rms", signal)` with a Float32Array only.
- **Feature definitions:** the [audio features guide](https://meyda.js.org/audio-features) documents RMS and spectral descriptors. Only RMS is tested by VCR.
- **Analyzer and browser integration:** documented for live Web Audio use, but untested by the VCR fixture.

## Install and doctor
Install the exact library version in the project that uses it:

```sh
npm install meyda@5.6.3
```

Meyda is a project dependency, not a machine executable. `vcr doctor` does not prove that a project's npm dependency resolves; check it from that project with `node -e 'import("meyda").then(() => console.log("meyda: OK"))'`.

## Smoke test
```sh
cd examples/meyda-rms && npm ci && ./run.sh
# expect: meyda-rms: OK
```
The fixture compares the RMS to an independent Hanning-window calculation and requires two Node processes to emit identical results.

## Troubleshooting
- `npm ci` or import fails: run from the example directory and preserve its pinned lockfile.
- RMS differs: check that the signal is 512 Float32 samples and that the default Hanning window is included in the independent calculation.
- A feature appears deterministic in the fixture: do not generalize that result to audio devices, browser callbacks, or other inputs; those paths are untested.

## Official docs
- [Meyda getting started](https://meyda.js.org/getting-started)
- [Meyda API reference](https://meyda.js.org/reference/)
- [Meyda audio features](https://meyda.js.org/audio-features)
- [Meyda 5.6.3 source](https://github.com/meyda/meyda/tree/v5.6.3)
