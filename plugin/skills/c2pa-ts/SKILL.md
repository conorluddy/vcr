---
name: c2pa-ts
description: Read and validate C2PA manifests in Node with the pure TypeScript c2pa-ts library. Load when a JS pipeline must read Content Credentials in-process; use c2patool for signing or any trust question.
---

# c2pa-ts

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Read a PNG's active manifest (title, claim generator, assertions) and run its validation, in Node, with no native binary.
- Evidence: 0.14.1, Node 22.19.0, macOS arm64, one PNG signed by c2patool's development signer. It read the title, `VCRFixture` 1.0 and the exact custom assertion payload, and `isValid` was true.
- KNOWN FAIL: for that file c2pa-ts emitted `signingCredential.trusted` where c2patool reports the signer untrusted. The README lists chain-of-trust validation as unimplemented, so never use its trust codes as a verdict; use `c2patool`.
- Untested: creating or signing manifests, JPEG, HEIC, MP3, MP4, browsers, real signers, timestamps.

## Capability map
- Read and validate: `createAsset`, `SuperBox.fromBuffer`, `ManifestStore.read`, `store.validate(asset)`. Tested on PNG. [README](https://github.com/TrustNXT/c2pa-ts#usage-examples).
- Create manifests: documented, untested (the README points to `jpeg-signing.test.ts`).
- Assertion types (actions, ingredient, thumbnail, metadata, CAWG variants) and formats (JPEG, PNG, HEIC/HEIF, MP3, MP4): see the README roadmap; only PNG and the generic custom assertion were exercised.

## Install and doctor
```sh
pnpm add @trustnxt/c2pa-ts@0.14.1 reflect-metadata
```
A project dependency; `vcr doctor` does not check it.

## Smoke test
```sh
pnpm install && examples/c2pa-ts-read-manifest/run.sh
# expect: a KNOWN FAIL line on stderr, then: c2pa-ts-read-manifest: OK (signerReportedUntrusted is a recorded KNOWN FAIL)
```

## Recipe (tested)
```js
import "reflect-metadata"; // first, or tsyringe throws at import
import { createAsset } from "@trustnxt/c2pa-ts/asset";
import { SuperBox, CBORBox } from "@trustnxt/c2pa-ts/jumbf";
import { ManifestStore } from "@trustnxt/c2pa-ts/manifest";

const asset = await createAsset(buffer);
const store = ManifestStore.read(SuperBox.fromBuffer(await asset.getManifestJUMBF()));
const { claim, assertions } = store.getActiveManifest();
claim.title; claim.claimGeneratorName; claim.claimGeneratorVersion;
const result = await store.validate(asset); // result.isValid, result.statusEntries[].code
```
- Custom assertions are `UnknownAssertion` with no payload field; read `assertion.sourceBox.contentBoxes.find((b) => b instanceof CBORBox).content`.
- `claimGeneratorInfo` was undefined for a c2patool 0.29.0 file; use the name and version fields.

## Troubleshooting
- "tsyringe requires a reflect polyfill": add `reflect-metadata` and import it first.
- `getManifestJUMBF()` returns nothing: the asset has no manifest; handle it before `SuperBox.fromBuffer`.

## Official docs
- [c2pa-ts](https://github.com/TrustNXT/c2pa-ts), [npm](https://www.npmjs.com/package/@trustnxt/c2pa-ts)
