---
name: opencv-js
description: Run OpenCV computer-vision operations through the JavaScript/WebAssembly package. Load for browser or Node image analysis; use Sharp for ordinary resize and format conversion.
---

# OpenCV.js

Inside the VCR repository, vcr is pnpm vcr. From an installed plugin, vcr is node <plugin-root>/cli/vcr.mjs.

## Use cases and limits
- OpenCV.js exposes OpenCV operations to JavaScript through WebAssembly. VCR validated @techstark/opencv-js 5.0.0-release.1 in Node: thresholding a generated 12×10 grayscale matrix and finding two external contours with exact bounds and areas.
- The fixture does not cover image decoding, browser/camera/video input, other OpenCV modules, or performance. The package is a JavaScript/WASM build, not native OpenCV; check the required API against this package's exported surface.
- Use Sharp for ordinary resize/convert and PySceneDetect for video cut detection.

## Capability map
- [OpenCV.js tutorials for 5.0](https://docs.opencv.org/5.0/js_tutorials/) cover browser loading and module workflows. The [TechStark package README](https://github.com/TechStark/opencv-js/tree/v5.0.0-release.1) documents its Node/browser wrapper and initialization promise.
- [Thresholding](https://docs.opencv.org/5.0/js_tutorials/js_imgproc/js_thresholding/js_thresholding.html) maps grayscale values to a binary mask; [contour tutorials](https://docs.opencv.org/5.0/js_tutorials/js_imgproc/js_contours/js_table_of_contents_contours.html) cover contour extraction and features.
- The fixture exercises Mat, threshold, findContours, boundingRect, and contourArea only. Other modules and browser input paths remain untested by VCR.

## Install and doctor
From a copied example, install the exact fixture dependencies:

    cd examples/opencv-js-contours && npm ci

For a project, use pnpm add @techstark/opencv-js. Run vcr doctor to record machine-level tools; package readiness is project-local and is not evidence that a native OpenCV executable is installed.

## Smoke test
    vcr example create opencv-js-contours
    cd examples/opencv-js-contours && ./run.sh
    # expect: OK: opencv-js-contours

The fixture checks 29 foreground pixels, boxes (1,1,3,3) and (7,2,4,5), contour areas 4 and 12, and matching metrics in separate Node processes. Generated PGM/PNG files stay under ignored output/.

## Troubleshooting
- Initialization never resolves: await the package's default readiness promise before using cv; the fixture imports cvReadyPromise.
- A matrix or contour assertion changes: verify row/column order, threshold mode, and the OpenCV core version reported by WASM before recording new expected metrics.
- Mat or contour memory grows: release created matrices and vectors with .delete(), as the fixture does.

## Official docs
- [OpenCV.js 5.0 tutorials](https://docs.opencv.org/5.0/js_tutorials/)
- [Thresholding](https://docs.opencv.org/5.0/js_tutorials/js_imgproc/js_thresholding/js_thresholding.html) and [contours](https://docs.opencv.org/5.0/js_tutorials/js_imgproc/js_contours/js_table_of_contents_contours.html)
- [TechStark package release 5.0.0-release.1](https://github.com/TechStark/opencv-js/releases/tag/v5.0.0-release.1)
