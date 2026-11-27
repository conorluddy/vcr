# ambientCG API: pin one CC0 1K material by id and verify it

## Intent and scope

- Tool/version: ambientCG API v2 `full_json` (hosted, unversioned service) plus the `/get?file=` download route. No install; `curl`, `unzip`, Node 22 and ImageMagick for the checks.
- Claim: a production can pin one material by asset id and resolution (`PavingStones036`, `1K-JPG`), fetch it once, verify it against the API-reported size and a recorded SHA-256, and read its licence from the official source.
- Exclusions: service stability and rate limits, v3, HDRIs and 3D models, other resolutions and formats, the `.blend`, `.mtlx`, `.tres` and `.usdc` members, rendering the maps, and legal sufficiency of CC0.
- Official documentation: https://docs.ambientcg.com/api/v2/full_json/ and https://docs.ambientcg.com/license/, checked 2026-11-27. Terms of use and rate limits are not published; the API page only warns the service is run by one person for hobbyists and educators.
- Network rules: anonymous GET only, User-Agent `vcr-fixture/1.0`, three requests on a cold run (API JSON, licence page, ZIP), none on reruns.
- Input: asset `PavingStones036`, 9.35 MB ZIP, released 2018-11-28.
- Output: ignored `output/` (`cache/` holds the fetched files, so reruns never refetch; delete it to refetch).

## Plan, before running

- Run `./run.sh --record`, then `./run.sh`.
- Hard checks (exit 1): API returns exactly one `Material` with the pinned id; the ZIP size equals the API-reported size; the licence page still carries the CC0 sentence; six maps are 1024x1024; NormalDX and NormalGL green-channel means sum to 255 within 3; the metrics diff against `expected/metrics.json`, including the SHA-256.
- Predeclared check that can fail: the API payload itself reports a licence field. Stays as `KNOWN FAIL` if absent.
- Look at colour, normal and roughness maps at native scale. Stop if they are not tileable paving.

## Observation

Executed 2026-11-27. Record and verify runs passed (second run fully offline from cache). The contact sheet showed grey cobble paving with moss, a blue-purple tangent-space normal map and a plausible roughness map. Size matched the API (9354813 bytes); SHA-256 `91223aa46aa4275bb30df310fba788d8bfb740f2b1e9796ac0eb9a14f367e9ce`.

- KNOWN FAIL: the API payload carries no licence field (searched keys for licence, copyright, rights). The CC0 statement exists only on the docs site, and the ZIP has no licence file. Licence evidence is therefore the docs page text plus the fetch date, not the API.
- Evidence is `partial` for that reason.
- Time stability: the hash is pinned from one fetch on one day. Volatile API fields (download counts, previews) are excluded from `expected/`. Whether the file ever changes is unobserved; a later hash mismatch is the signal. The tokenised redirect behind `/get` is not stable and is never stored.
