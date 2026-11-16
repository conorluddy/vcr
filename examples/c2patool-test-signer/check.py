#!/usr/bin/env python3
import json
import struct
import sys
from pathlib import Path

root = Path(__file__).parent
out = root / "output"
version = sys.argv[1]
source = json.loads((out / "source-summary.json").read_text())
report = json.loads((out / "readback.json").read_text())
source_bytes = (out / "source.png").read_bytes()
assert source_bytes[:8] == bytes.fromhex("89504e470d0a1a0a")
assert struct.unpack(">II", source_bytes[16:24]) == (source["width"], source["height"])
assert version == "c2patool 0.29.0", f"unexpected c2patool version: {version}"
active = report["active_manifest"]
assert active in report["manifests"], f"active manifest {active!r} missing"
manifest = report["manifests"][active]
assert manifest["title"] == "VCR c2patool fixture", manifest.get("title")
generator_info = manifest["claim_generator_info"]
assert len(generator_info) == 1
assert generator_info[0]["name"] == "VCRFixture"
assert generator_info[0]["version"] == "1.0"
custom = [a for a in manifest["assertions"] if a.get("label") == "org.contentauth.test"]
assert len(custom) == 1, [a.get("label") for a in manifest["assertions"]]
assert custom[0]["data"] == {"fixture": "c2patool-test-signer", "claim": "local test asset only"}
assert source["width"] == 64 and source["height"] == 48
assert manifest["ingredients"][0]["format"] == "image/png"
signer = manifest["signature_info"]
assert signer["common_name"] == "C2PA Signer"
assert signer["issuer"] == "C2PA Test Signing Cert"
validation = report["validation_results"]["activeManifest"]
assert any(item["code"] == "claimSignature.validated" for item in validation["success"])
assert any(item["code"] == "signingCredential.untrusted" for item in validation["failure"])
metrics = {
    "c2patoolVersion": version,
    "sourceWidth": source["width"],
    "sourceHeight": source["height"],
    "sourceSha256": source["sourceSha256"],
    "title": manifest["title"],
    "claimGeneratorInfo": manifest["claim_generator_info"],
    "customAssertionLabel": custom[0]["label"],
    "customAssertionData": custom[0]["data"],
    "assertionCount": len(manifest["assertions"]),
    "ingredientFormat": manifest["ingredients"][0]["format"],
    "testSignerCommonName": signer["common_name"],
    "testSignerIssuer": signer["issuer"],
    "signatureValidated": True,
    "signerUntrusted": True,
}
expected = root / "expected" / "metrics.json"
if sys.argv[2:] == ["--record"]:
    expected.write_text(json.dumps(metrics, indent=2) + "\n")
else:
    assert json.loads(expected.read_text()) == metrics, "manifest readback differs from expected"
print(json.dumps(metrics, indent=2))
