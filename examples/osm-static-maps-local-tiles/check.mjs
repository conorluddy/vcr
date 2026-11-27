import { execFileSync } from "node:child_process";
import fs from "node:fs";

const probe = (x, y) => execFileSync("magick", ["output/map.png", "-format", `%[fx:int(255*p{${x},${y}}.r)],%[fx:int(255*p{${x},${y}}.g)],%[fx:int(255*p{${x},${y}}.b)]`, "info:"]).toString().trim();
const size = execFileSync("magick", ["identify", "-format", "%wx%h", "output/map.png"]).toString();
const requests = JSON.parse(fs.readFileSync("output/requests.json", "utf8"));
const metrics = {
  size,
  tileRequests: requests,
  probes: { lightTile: probe(500, 50), darkTile: probe(300, 50), insidePolygon: probe(320, 180), attributionPixel: probe(490, 357) },
};
fs.writeFileSync("output/metrics.json", JSON.stringify(metrics, null, 2) + "\n");

const failures = [];
if (size !== "640x360") failures.push(`size ${size}`);
if (!requests.length || !requests.every((url) => /^\/12\/\d+\/\d+\.png$/.test(url))) failures.push("unexpected tile requests");
if (metrics.probes.lightTile !== "200,220,200") failures.push(`lightTile ${metrics.probes.lightTile}`);
if (metrics.probes.darkTile !== "170,200,170") failures.push(`darkTile ${metrics.probes.darkTile}`);
const [r, , b] = metrics.probes.insidePolygon.split(",").map(Number);
if (!(b > r + 20)) failures.push(`polygon fill not blue-tinted: ${metrics.probes.insidePolygon}`);
if (metrics.probes.attributionPixel !== "238,244,238") failures.push(`attribution box ${metrics.probes.attributionPixel}`);
if (failures.length) { console.error("FAIL: " + failures.join("; ")); process.exit(1); }
