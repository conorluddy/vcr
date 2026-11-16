# Synfig CLI static-render fixture

## Intent and scope

- **Tool/version:** Synfig CLI 1.5.5, installed from Homebrew formula 1.5.5_4; PNG target.
- **Claim:** render an authored static `.sif` rectangle at time zero to a 160×120 PNG and check its color, transparency and repeated file bytes.
- **Exclusions:** Studio GUI, animation ranges, tweening, video targets, other layers, other platforms and visual quality beyond the pixel checks.
- **Documentation:** [Synfig CLI syntax](https://wiki.synfig.org/Doc%3ASynfig_CLI_Syntax), [render options](https://wiki.synfig.org/Render_options), [SIF format](https://wiki.synfig.org/Sif_Format). Checked 2026-11-16.
- **Environment:** macOS 26.6 arm64 (Darwin 25.6.0), Synfig 1.5.5_4, ImageMagick 7.1.2-35.
- **Input:** `scene.sif` is a small authored XML canvas with one red rectangle. No external media or sample project.
- **Side effects:** writes two PNG renders and CLI logs under ignored `output/`.

## Plan, before running

- **Commands:** `./run.sh --record`, then `./run.sh`. Each run renders the same SIF twice at `0s` and checks both PNGs with ImageMagick.
- **Checks:** exact Synfig version; 160×120 dimensions; center RGBA `[255,0,0,255]`; corner RGBA `[0,0,0,0]`; identical PNG bytes and expected SHA-256.
- **Stop conditions:** version mismatch, CLI render failure, wrong dimensions or pixel values, or differing repeat hashes.
- **Inspection:** inspect `output/first.png` at native size. The shape is a test input, not a quality sample.

## Observation, after running

- **Result:** pass. `./run.sh --record` succeeded and recorded the reference; a second clean-output run is the verification step.
- **Measurements:** 160×120 PNG; center pixel `[255,0,0,255]`; corner `[0,0,0,0]`; SHA-256 `e8c48e45f10183e8f41bf91a2c9f2281e6aa84e48e43c62443b9e2da0b4cec01`; repeated renders matched.
- **Runtime:** Synfig 1.5.5_4, PNG target, ImageMagick 7.1.2-35, macOS 26.6 arm64. The Synfig CLI logs an unavailable optional `mod_jpeg` module; it does not prevent PNG rendering.
- **Visual inspection:** inspected the output PNG; it contains the centered red rectangle on transparency.
- **Limits:** this validates only one static rectangle and the PNG target. It does not validate animation, Studio, video codecs, or other layers and formats.
