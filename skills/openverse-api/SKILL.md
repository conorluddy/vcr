---
name: openverse-api
description: Search Openverse for openly licensed images, filtered by licence, and read each result's licence and attribution fields. Load when candidate photos need machine-readable rights before they are chosen; not for reproducible renders or for storing the file.
---

# Openverse API

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Find candidate images whose licence is in the data: `license`, `license_version`, `license_url`, `creator`, `foreign_landing_url`, `attribution`.
- Openverse indexes, it does not host. `url` points at the source site; fetch and keep a local copy, then record rights evidence. By ADR 0011 an item with no copy and evidence is inspiration, never output.
- The label is aggregated from the source and not verified by Openverse. Check the landing page before commercial use.
- Results change. Record the id, `foreign_landing_url` and licence at selection time; never assume a query reproduces.
- For icons use `iconify`; for choosing and briefing imagery use the image-director agent.

## Capability map
Documented surface: `/v1/images/` and `/v1/audio/` search, `/{id}/` detail, `/{id}/related/`, `/{id}/thumb/`, `/v1/images/stats/` (sources), and OAuth client registration for higher limits; reference at https://api.openverse.org/v1/. Exercised by the fixture: image search with `license`, `license_type`, `q`, `page_size`, and the detail endpoint. Untested: audio, `related`, thumbnails, downloads, registration (never done here).

## Install and doctor
Nothing to install; plain HTTPS GET. Send a generic `User-Agent`.
Anonymous limits seen 2026-11-27: `/v1/` 20/min and 200/day, `/v1/images/` 100/min and 1000/day (response headers `x-ratelimit-limit-*`). Search returned 504 several times before recovering: retry with back-off.

## Smoke test
```text
examples/openverse-licence-fields/run.sh
# expect: requests made: 4; failed checks: 0  then  OK: openverse-licence-fields   (fails if the API is unreachable)
```

## Recipes
```text
GET /v1/images/?q=moon&license=cc0&page_size=10          # CC0 only; license=pdm for public domain mark
GET /v1/images/?q=moon&license_type=commercial,modification   # drops NC and ND
GET /v1/images/<id>/                                     # detail; use .attribution for a credits line
```
Check `license` per result anyway, and keep `license_type` filters in the query you record.

## Troubleshooting
- 504 from search while `/v1/` answers 200: transient; retry.
- Unfiltered searches return `by-nc-sa` and similar; filter before use.

## Official docs
https://api.openverse.org/v1/ and https://github.com/WordPress/openverse (MIT code).
