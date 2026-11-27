# Openverse licence filters and attribution fields

## Intent and scope

- Tool/version: Openverse API v1 (`https://api.openverse.org/v1/images/`), live service, no version string; code MIT (WordPress/openverse). Checked 2026-11-27.
- Claim: an anonymous search filtered to `license=cc0` or `license=pdm` returns results whose licence fields say so, `license_type=commercial,modification` returns no NC or ND licence, and one fetched item's attribution fields (title, creator, licence, version, licence URL, landing URL, source, attribution string) are complete.
- Exclusions: exact ids and counts (the index changes), whether the source site still serves the file, whether a licence label is correct at the source (Openverse aggregates and does not verify), audio, the registered-client flow, thumbnails and downloads, trademark, privacy and personality rights.
- Terms: anonymous use only, no account or client registered. `User-Agent: vcr-fixture/1.0`. Openverse indexes media and does not host it.
- Rate limits seen: `GET /v1/` answered `20/min` burst and `200/day` sustained; `GET /v1/images/` answered `100/min` and `1000/day` on the same day. Treat the lower as the safe figure; a run uses 4 requests.
- Environment: macOS arm64, Node 22 (global `fetch`), no dependencies, no install.

## Plan, before running

- `./run.sh --record`, then `./run.sh`.
- Predeclared checks (all structural): cc0 and pdm searches non-empty with every result's `license` equal to the filter and a `license_url`; commercial,modification results non-empty with no `nc`/`nd` in `license`; detail has every field in the list and an `attribution` string naming title, creator and CC0/Public Domain.
- Failure handling: 502/503/504 retried up to 4 times with back-off; if the API stays unreachable the script exits 3 and `run.sh` prints SKIPPED and exits 0, which verifies nothing. A failed check is printed as `KNOWN FAIL` and stays in `expected/metrics.json` as `false`.

## Observation

Executed 2026-11-27. The search endpoint returned 504 on the first five attempts while `/v1/` and `/images/stats/` answered 200, then recovered; the retry loop exists for that. Record and verify runs both passed all 7 checks. The saved `output/sample-detail.json` (ignored) held a CC0 Flickr image with a ready-made attribution sentence ("... is marked with CC0 1.0. To view the terms, visit ..."). Not established: that the labels are right at the source, or that a download succeeds.
