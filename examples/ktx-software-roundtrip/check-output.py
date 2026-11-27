"""Apply the predeclared checks to the ktx outputs in a directory and write metrics JSON."""
import hashlib, json, os, sys

work, out = sys.argv[1], sys.argv[2]
info = json.load(open(os.path.join(work, "info.json")))
compare = json.load(open(os.path.join(work, "compare.json")))
validate = json.load(open(os.path.join(work, "validate.json")))
block = info["dataFormatDescriptor"]["blocks"][0]
metrics = {
    "validate": {"valid": validate["valid"], "messages": validate["messages"]},
    "info_valid": info["valid"],
    "header": {k: info["header"][k] for k in ("vkFormat", "pixelWidth", "pixelHeight", "levelCount", "supercompressionScheme")},
    "colorModel": block["colorModel"],
    "transferFunction": block["transferFunction"],
    "level0_byteLength": info["index"]["levels"][0]["byteLength"],
    "roundtrip": compare,
    "ktx2_sha256": hashlib.sha256(open(os.path.join(work, "a.ktx2"), "rb").read()).hexdigest(),
}
failures = []
if validate != {"$schema": validate["$schema"], "valid": True, "messages": []}:
    failures.append("validate")
if metrics["header"]["levelCount"] != 9:
    failures.append("levelCount != 9")
if metrics["header"]["pixelWidth"] != 256:
    failures.append("size")
if metrics["colorModel"] != "KHR_DF_MODEL_UASTC":
    failures.append("not UASTC")
if compare["psnr_db"] < 40:
    failures.append("psnr < 40 dB")
if compare["max_abs_error"] > 16:
    failures.append("max error > 16")
with open(out, "w") as handle:
    json.dump(metrics, handle, indent=2, sort_keys=True)
    handle.write("\n")
if failures:
    print("predeclared check failed:", failures, file=sys.stderr)
    sys.exit(1)
