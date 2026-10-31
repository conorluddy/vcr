# Produce and verify a native asset

Use when creating an asset, handing it between tools, or making a delivery
variant. Choose the checks relevant to the requested output. Native commands and
editable source remain the production interface; this guide adds no shared
renderer, timeline, adapter or asset API.

## Define the deliverable

Turn the brief into observable requirements before expensive work. Name the
intended consumer, format and useful limits: dimensions, duration, frame rate,
triangles, channels, transparency or file size. Specify units and tolerances.
For file size, distinguish bytes, decimal KB and KiB, and delivered file size
from compressed transfer size.

Separate these concerns in native files or clearly named sections:

- **Content:** geometry, text, data, footage or sound being authored.
- **Design:** colours, materials, typography and visual treatment.
- **Motion parameters:** local timing, easing, seeds or sampling, when applicable.
- **Production placement:** where the asset sits in a larger scene or sequence.

Keep presentation separate from the reusable asset. Export a model before adding
its studio floor; retain an overlay separately from its sample background, or a
clean audio stem alongside its demonstration mix. Include only the cameras,
lights, backgrounds and metadata needed by the consumer.

## Build through the native tool

Keep source, dependencies and a runnable recipe in the selected workspace.
Record versions; isolate approved dependencies and keep generated files and
caches in ignored directories. The installed plugin is read-only. Existing
installation permission carries forward; missing dependencies need the plan and
permissions described by the relevant toolkit guidance.

Use native operations. When an operation fails, investigate the source or a
native alternative before introducing a shared abstraction. Retain diagnostics.
A sandbox or GPU startup failure is environment evidence; record the changed
conditions of any permitted retry separately from asset failures.

Expose detail controls when variants are useful: tessellation, curve samples,
effects, frame size, audio quality or encoding. Preserve detailed source and use
distinct variant outputs. Choose which details carry identity at delivery scale.

## Verify the handoff

A successful export establishes that a file was written. Check it in the intended
consumer where practical, naming both versions and format/settings. Keep tool
execution, interchange compatibility and perceived quality as separate facts.

| Output | Useful source and consumer checks | Delivery checks |
| --- | --- | --- |
| 3D model | Dimensions, units, axes, normals/winding, intended parts and materials | Triangles, textures, file size; exclude presentation objects |
| SVG | ViewBox/bounds, fonts or outlines, clipping, IDs needed downstream; rasterise at target size | Dimensions, file size; preserve required editability |
| Video or sequence | Frame count, frame rate, duration, order, alpha and colour at the consumer | Codec/container, resolution, bitrate or total bytes; probe and play |
| Audio | Duration, sample rate, channels, clipping and alignment; listen | Format, requested loudness target, total bytes |
| Raster image | Dimensions, colour interpretation, transparency and visible edges | Format, compression, total bytes; inspect at delivery size |

Select meaningful assertions and tolerances from the job; this table is not a
requirement to run every check. Measure the actual deliverable, including
embedded textures or fonts. Record consumer requirements for compression
extensions if used.

For animation or simulation, record time units, frame conventions, seeds and
replay/cache requirements. Observe native sampling and determinism; catalogue
inclusion supplies no clock contract.

## Review at the intended scale

Inspect the final variant as appropriate: rendered model, rasterised vector,
still, representative video frames/playback or audio playback. Passing a size or
triangle budget cannot detect a disappearing seam, clipped text, broken alpha
edges, unreadable detail or audible artefacts.

When checks pass but the result looks or sounds wrong, fix source, export
settings or the variant strategy and repeat affected checks. Keep the budget
unless the user changes it. Never replace a baseline merely to make a regression
pass. Agent inspection does not imply human approval.

## Retain scoped evidence

For reusable fixtures, use the [fixture evidence template](../../../catalog/FIXTURE-EVIDENCE-TEMPLATE.md).
Record the plan before running, commands, inputs, settings, measurements,
versions/environment, inspection and limitations. Hashes identify a run; use
tolerances where byte equality is inappropriate. Retain failures and changed
conditions as well as the successful result.

Ordinary productions need a lightweight recipe and observations suited to the
task; they do not each require catalogue assessment. Local projects can remain
ignored. Deliberately retain useful small examples and operational lessons in
tracked harness files, respecting the media size policy.

The [build123d product fixture](../../../examples/build123d-product/evidence.md)
illustrates this pattern: CAD dimensions and STEP roundtrip were checked
separately from GLB scale, orientation, normals and tessellation in Blender.
Its evidence covers one part and environment, with no Three.js or general adapter
claim. Choose the other rows above for other outputs.

Catalogue tier and validation changes follow [candidate ingestion](../../../catalog/CANDIDATE-INGESTION.md)
and maintainer review. Installation facts belong in environment records. A
production success alone does not promote a tool or create an adapter.
