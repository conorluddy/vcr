---
name: delivery
description: Prepare creative masters, delivery files and sidecars or diagnose encoded output defects. Use when choosing target-specific exports or checking delivered media against its intended destination.
---

# Delivery

Advisory and uncalibrated.

Consult each applicable rule in the referenced section before applying its limits; never use thresholds from memory. Read one section at a time and preserve provisional status.

Read the [delivery routes](../../references/delivery/README.md), then the relevant sections. Establish each destination, placement, upload route, master and variants; verify current destination requirements from their authoritative sources before selecting settings. Keep the master and delivery derivatives identifiable using existing workspace records; do not invent a separate manifest.

Scale the work to the affected destination or defect. Select format, dimensions, frame rate, colour signalling, audio and sidecars for each target; use an alpha-capable format where transparency is required and preserve a suitable master for future derivatives. Preserve the source's intent through the encode (`DELIVERY-FPS-NATIVE`, `DELIVERY-RANGE-LIMITED`, `DELIVERY-CAPTION-SIDECAR`). When diagnosing a defect, compare the decoded file with its master at affected times and inspect the relevant signal and timing, not merely the header (`DELIVERY-LEGAL-RANGE`, `DELIVERY-DURATION-MATCH`). For a suspected colour shift, compare the affected decoded image and source alongside declared tags and conversion; for stutter, inspect frame timestamps and duplicates; for sync, compare a visible event and its audible onset. Change the implicated export setting only after isolating the cause, then re-encode and compare the affected passage. For loops, inspect the file seam (`DELIVERY-LOOP-SEAM`); the motion and sound pillars own content continuity.

Preserve the master's native frame rate and timing unless the verified target requires a conversion; record and inspect any necessary conversion.

Use §8 and §13 for appropriate manual QC: distinguish metadata, container and timestamp inspection from decoded-signal checks, visual playback and audio sync. A simulated re-encode can reveal vulnerabilities but is not proof of destination behavior. No delivery gate is implemented; report target, files, methods, observed evidence and unassessed checks. Route caption accuracy and access decisions to accessibility; encoded audio quality to sound; version completeness to adaptation. Human approval remains separate from QC.
