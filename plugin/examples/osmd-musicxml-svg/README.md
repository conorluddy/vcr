# OpenSheetMusicDisplay MusicXML to SVG score

## Intent and scope

- Tool/version: `opensheetmusicdisplay` 3.0.0 (VexFlow-based), `jsdom` 27.0.0, `@napi-rs/canvas` 1.2.1 (text measurement only).
- Claim: a self-authored MusicXML score (`score.musicxml`, 4 bars, 10 notes, 1 rest, lyrics, title) becomes one SVG in Node with no browser, whose notes carry semantic classes (`vf-stavenote`, `vf-notehead`), byte-identical across separate processes, and rasterises through resvg.
- Exclusions: Chromium rendering, PNG backend, cursor API, multi-page or multi-system layout, `.mxl` input, other fonts, recolouring or animation of notes, audio sync.
- Official documentation: https://opensheetmusicdisplay.org and https://github.com/opensheetmusicdisplay/opensheetmusicdisplay; checked 2026-11-27.
- Environment: macOS 26.6 arm64; Node 22.19.0; resvg 0.47.0; ImageMagick for the size check.
- Input: `score.musicxml`, written for this fixture.
- Output: ignored `output/` (`score.svg`, `score.png`, `metrics.json`).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Assert: SVG hash identical across two `node render.mjs` processes; 4 `vf-measure`, 11 `vf-stavenote`, 11 `vf-notehead`; lyric `Sol` present as `<text>`; viewBox and hash match `expected/metrics.json`; resvg at `--width 1800` gives 1800x696.
- Inspect the PNG at native size. Stop if clef, time signature, pitches or lyrics are wrong, or if the hash differs between runs.

## Observation

Executed on 2026-11-27 on `Conors-MacBook-Pro-2.local`. Both runs passed. The PNG was inspected: treble clef, 4/4, C4 to C5 scale steps with correct stems, ledger lines, whole note, half rest, final barline, lyrics under each note, title and part label. Text (title, lyrics, part name, measure number) is `<text font-family="Times New Roman">`, not paths, so resvg falls back to an installed font and layout was measured with the canvas package's default font. Noteheads, clef and stems are paths. The lead said 2.3.1; npm shows 3.0.0 (2026-11-26). The package is a CJS bundle: `import('opensheetmusicdisplay')` yields `default.OpenSheetMusicDisplay`, and jsdom needs `HTMLCanvasElement.prototype.getContext` patched. Byte identity holds on one machine; font metrics elsewhere may move layout.
