---
name: ambientcg-api
description: Look up a CC0 PBR material on ambientCG by id, download its ZIP once with a pinned hash, and keep the licence source with it. Load once ambientCG has been chosen as the material source for a 3D or shader scene.
---

# ambientCG API

`vcr` below means `node <plugin-root>/cli/vcr.mjs`; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Pin one material by asset id and resolution, fetch it once, keep the SHA-256. Interpreting and applying the maps belongs to the `materials` skill and the renderer's guide.
- Hosted by one person for hobbyists; the docs say it may not be as reliable as an enterprise service and publish no rate limit or terms. Anonymous GET, few requests, cache everything.
- The API payload has no licence field. CC0 1.0 is stated at docs.ambientcg.com/license (files and previews; credit optional). Record that URL and the fetch date with the asset: ZIPs carry no licence file.
- VCR evidence covers one asset (`PavingStones036`, 1K-JPG) fetched on 2026-11-27 on macOS arm64. Later drift is unobserved.

## Capability map
| Area | Official reference | VCR |
| --- | --- | --- |
| v2 `full_json` (metadata, download sizes, maps) | [full_json](https://docs.ambientcg.com/api/v2/full_json/) | tested, one id |
| v2 `downloads_csv`, `categories` | [api](https://docs.ambientcg.com/api/) | untested |
| v3 `assets`, `categories`, `collections`, `rss` | [v3](https://docs.ambientcg.com/api/v3/) | `assets?id=` answered once; otherwise untested |
| `/get?file=<id>_<res>-<format>.zip` | [full_json](https://docs.ambientcg.com/api/v2/full_json/) | tested, 1K-JPG |
| Types: HDRI, 3DModel, Decal, Terrain and others | full_json `type` parameter | untested |

## Install and doctor
Nothing to install: `curl` and `unzip`. `vcr doctor` does not probe the service.

## Smoke test
```sh
cd examples/ambientcg-api-material && ./run.sh
# expect: KNOWN FAIL: API payload has no licence field; ...
# expect: OK: ambientcg-api-material (...)
```
First run needs network (about 9.4 MB); reruns read `output/cache/`.

## Recipe: pin and fetch one material
```sh
UA="vcr-fixture/1.0"   # generic; no names or emails
curl -fsSL -A "$UA" "https://ambientcg.com/api/v2/full_json?id=PavingStones036&include=downloadData,mapData" -o api.json
jq '.foundAssets[0] | {assetId, dataType, maps, sizes: [.downloadFolders.default.downloadFiletypeCategories.zip.downloads[] | {attribute, size}]}' api.json
curl -fsSL -A "$UA" -o PavingStones036_1K-JPG.zip "https://ambientcg.com/get?file=PavingStones036_1K-JPG.zip"
shasum -a 256 PavingStones036_1K-JPG.zip   # compare size with the API, then pin this hash
```
- Request `/get?file=`, which redirects to a tokenised storage URL; never store the redirect.
- `id=` takes several comma-separated ids; unknown ids are ignored, so check `numberOfResults`. `limit` is 1 to 250.
- Each 1K-JPG ZIP holds Color, Roughness, Displacement, AmbientOcclusion, NormalDX and NormalGL JPGs (1024x1024), plus `.blend`, `.mtlx`, `.tres`, `.usdc` and a preview PNG. Use NormalGL for Three.js and Blender, NormalDX for DirectX engines; colour is sRGB, the other maps are data (`MAT-TEXTURE-COLORSPACE`, `MAT-NORMAL-CONVENTION`).
- A hash mismatch against the pin means the service changed the file: stop and look, do not silently refetch.

## Troubleshooting
- `numberOfResults` 0: the id is wrong; ids are case-sensitive in the files, case-insensitive in v3 responses.
- Fixture fails on the CC0 sentence: the docs page was reworded; reread the licence before reusing the asset.
- Stale cache wanted gone: delete `examples/ambientcg-api-material/output/cache`.

## Official docs
- https://docs.ambientcg.com/api/
- https://docs.ambientcg.com/api/v2/full_json/
- https://docs.ambientcg.com/api/v3/
- https://docs.ambientcg.com/license/
