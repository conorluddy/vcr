import "reflect-metadata";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createAsset } from "@trustnxt/c2pa-ts/asset";
import { CBORBox } from "@trustnxt/c2pa-ts/jumbf";
import { SuperBox } from "@trustnxt/c2pa-ts/jumbf";
import { ManifestStore } from "@trustnxt/c2pa-ts/manifest";
import assert from "node:assert/strict";

const installed = JSON.parse(await readFile("node_modules/@trustnxt/c2pa-ts/package.json", "utf8"));
assert.equal(installed.version, "0.14.1");

const bytes = Buffer.from(await readFile("fixture/signed.png.base64", "utf8"), "base64"); // text copy: plugin/ must not ship media
const asset = await createAsset(bytes);
const store = ManifestStore.read(SuperBox.fromBuffer(await asset.getManifestJUMBF()));
const manifest = store.getActiveManifest();
const custom = manifest.assertions.assertions.filter((a) => a.label === "org.contentauth.test");
assert.equal(custom.length, 1);
const customData = custom[0].sourceBox.contentBoxes.find((b) => b instanceof CBORBox).content;
const validation = await store.validate(asset);
const codes = validation.statusEntries.map((s) => s.code);

const metrics = {
  c2paTsVersion: installed.version,
  fixtureSha256: createHash("sha256").update(bytes).digest("hex"),
  title: manifest.claim.title,
  claimGeneratorName: manifest.claim.claimGeneratorName,
  claimGeneratorVersion: manifest.claim.claimGeneratorVersion,
  customAssertionData: customData,
  assertionLabels: manifest.assertions.assertions.map((a) => a.label),
  isValid: validation.isValid,
  claimSignatureValidated: codes.includes("claimSignature.validated"),
  statusCodes: [...new Set(codes)].sort(),
};

// Predeclared checks; the last is the one expected to fail and is reported, not loosened.
assert.equal(metrics.title, "VCR c2patool fixture");
assert.equal(metrics.claimGeneratorName, "VCRFixture");
assert.equal(metrics.claimGeneratorVersion, "1.0");
assert.deepEqual(metrics.customAssertionData, { claim: "local test asset only", fixture: "c2patool-test-signer" });
assert.equal(metrics.isValid, true);
assert.equal(metrics.claimSignatureValidated, true);
metrics.signerReportedUntrusted = codes.includes("signingCredential.untrusted");
if (!metrics.signerReportedUntrusted) {
  console.error("KNOWN FAIL: c2patool reports this development signer as untrusted; c2pa-ts did not emit signingCredential.untrusted");
}
console.log(JSON.stringify(metrics, null, 2));
