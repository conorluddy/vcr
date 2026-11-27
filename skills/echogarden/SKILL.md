---
name: echogarden
description: Align a known transcript to speech from Node with Echogarden's DTW engine and read word start and end times. Load when word timings are needed without Python; VCR evidence is partial, so check starts against the audio.
---

# Echogarden

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Forced alignment: known text plus audio in, per-word `startTime` and `endTime` out, from Node with no Python.
- Partial in VCR: on a generated sentence with 0.4 s silences, word order held but 2 of 10 starts were off by 0.5 s or more (max 0.68 s), and a second call on the same file changed three words. Do not use it for tight timing on gapped speech; use `whisperx`. Not tested: Whisper-guided alignment, real speech, other languages.

## Capability map
Documented areas ([README](https://github.com/echogarden-project/echogarden)): alignment (`align`, engines include `dtw`), synthesis, recognition, translation, speech-to-speech, voice-activity detection, source separation, and SRT/VTT/JSON output through the CLI. VCR exercised only `align` with `engine: "dtw"` through the Node API. Everything else is untested here, and engines other than `dtw` fetch models at run time with their own licences.

## Install and doctor
```text
pnpm add echogarden        # 3.4.0 validated; licence MIT AND GPL-3.0
npx echogarden --version
```
`vcr doctor` does not check it. The `dtw` engine downloaded nothing; set `XDG_CACHE_HOME` to an ignored directory before trying other engines.

## Smoke test
```text
pnpm install && examples/echogarden-forced-alignment/run.sh
# expect: KNOWN FAIL line for G3 and G4, then: echogarden-forced-alignment: OK
```
The OK means the run reproduced the recorded partial result, not that every check passed.

## Recipe
```js
import * as Echogarden from "echogarden";
const result = await Echogarden.align("input.wav", "the red fox", { engine: "dtw", language: "en" });
result.wordTimeline.map((w) => [w.text, w.startTime, w.endTime]); // seconds
```
Input 16 kHz mono PCM WAV was used. Align each phrase near its own audio rather than across long silences.

## Troubleshooting
- `result.timeline` holds one sentence entry; word entries are in `wordTimeline`.
- Timings for the same file differed between two calls in one process (brown, river, today); compare against known onsets before trusting them.

## Official docs
https://github.com/echogarden-project/echogarden (v3.4.0)
