# OpenCV.js threshold and contour bounds

## Intent and scope

- Tool: `@techstark/opencv-js` 5.0.0-release.1; record actual OpenCV core version from the initialized WASM API.
- Claim: threshold a generated grayscale matrix and find external contours with exact count, bounding rectangles and areas.
- Exclusions: image decoding, camera/video input, browser DOM/canvas APIs, other OpenCV modules or versions, and native OpenCV Python/C++.
- Source: https://github.com/TechStark/opencv-js; checked 2026-11-16. The package exports a readiness promise; contour processing uses `Mat`, `threshold`, and `findContours`.
- Environment: macOS 26.6 arm64, Node 22.19.0; WASM runtime in Node.
- Input: generated 12×10 grayscale matrix; only the matrix recipe is retained.
- Install plan: `npm install --save-exact @techstark/opencv-js@5.0.0-release.1` in this fixture directory; package and lockfile remain fixture-local.
- Outputs: ignored `output/` only.

## Plan, before running

- Generate a 12×10 grayscale matrix with background value 20 and two filled rectangles at `(1,1)` size `3×3` and `(7,2)` size `4×5`, value 200.
- Initialize the package WASM, threshold at 127 to 255 with `THRESH_BINARY`, then run `findContours(..., RETR_EXTERNAL, CHAIN_APPROX_SIMPLE)`.
- Assert OpenCV core version, two contours, bounding rectangles `(1,1,3,3)` and `(7,2,4,5)`, contour areas 4 and 12, binary-pixel count 29, and identical metrics in separate Node processes.
- Render the generated input/output matrices as small PGM/PNG inspection images; inspect exact pixels and geometry. Stop if WASM initialization fails or metrics differ.
- Reproduce via `npm ci && ./run.sh`.

## Observation

Executed twice in separate Node processes on 2026-11-16 by the maintainer on `Conors-MacBook-Pro-2.local`. The `@techstark/opencv-js` 5.0.0-release.1 WASM reported OpenCV core 5.0.0. Thresholding the 12×10 matrix yielded 29 foreground pixels and SHA-256 `b41e650dbf81149323bfe4ecbfa1a4ebc814639575ed2db39daf4da6520ae55c`; `findContours` returned exactly the declared bounds and areas. Input and threshold masks were inspected as tiny exact-pixel PNGs. This proves only this generated matrix and Node WASM route; it does not cover decoding or browser/video inputs.
