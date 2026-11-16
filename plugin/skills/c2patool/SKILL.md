---
name: c2patool
description: Inspect or add C2PA manifests to supported media with the c2patool CLI. Load when a workflow needs signed Content Credentials or a machine-readable manifest report.
---

# c2patool

`vcr` below means `node <plugin-root>/cli/vcr.mjs`, where the plugin root is two directories above this SKILL.md; inside the VCR repository it is `pnpm vcr`.

## Use cases and limits
- Use it to inspect a C2PA manifest or add a signed manifest to supported media.
- A valid signature does not prove assertions are true, identify a trusted signer, or establish complete provenance. The fixture uses the built-in untrusted development signer; never use it for production credentials.
- Evidence covers one locally generated PNG with c2patool 0.29.0 on macOS arm64. Other formats, trusted signers, timestamp services and platforms are untested. For ordinary codec/container metadata, use ffprobe or MediaInfo.

## Capability map
- CLI usage covers reading reports, manifest creation and command-line options ([usage](https://github.com/contentauth/c2patool/blob/main/docs/usage.md)). The manifest guide documents claim structure and assertions ([manifest](https://github.com/contentauth/c2patool/blob/main/docs/manifest.md)); signing options and development credentials are described separately ([signing](https://github.com/contentauth/c2patool/blob/main/docs/signing.md)).
- VCR tests signing a generated PNG, reading its JSON report, custom assertion data, signature validation and explicit untrusted signer status. Other media, assertion types, trust configuration and production signing remain untested here.

## Install and doctor
```text
brew install c2patool
c2patool -V   # expect: c2patool 0.29.0
```
The evidence ran 0.29.0 on macOS 26.6 arm64. `vcr doctor` checks the configured `c2patool -V` command; it does not configure certificates or establish signer trust.

## Smoke test
```text
vcr example create c2patool-test-signer
cd examples/c2patool-test-signer && ./run.sh
# expect: JSON reports "signatureValidated": true and "signerUntrusted": true
```
The fixture checks a 64×48 RGB input, title and claim-generator fields, a custom assertion, signature validation and an untrusted test signer. Signed output contains changing signature data, so stable manifest fields—not signed bytes—are compared.

## Troubleshooting
- A self-signed certificate may be rejected by c2patool. The validated fixture uses the built-in test signer; it is intentionally untrusted and is not a workaround for production signing.
- A manifest can validate cryptographically while its signing credential is untrusted. Treat those as separate report fields.

## Official docs
- [c2patool usage](https://github.com/contentauth/c2patool/blob/main/docs/usage.md), [manifest](https://github.com/contentauth/c2patool/blob/main/docs/manifest.md), and [signing](https://github.com/contentauth/c2patool/blob/main/docs/signing.md) (fixture checked 2026-11-16; tested version 0.29.0).
