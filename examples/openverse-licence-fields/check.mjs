// Anonymous GET only. No client registration, no account. Generic User-Agent.
import { writeFileSync } from "node:fs";

const base = "https://api.openverse.org/v1/images/";
const headers = { "User-Agent": "vcr-fixture/1.0" };
const transientStatuses = [502, 503, 504];
let requestCount = 0;
let rateHeaders = {};

async function getJson(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    requestCount++;
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(60000) });
      rateHeaders = Object.fromEntries([...response.headers].filter(([k]) => k.startsWith("x-ratelimit-limit")));
      if (response.ok) return await response.json();
      if (!transientStatuses.includes(response.status)) throw new Error(`HTTP ${response.status} for ${url}`);
    } catch (error) {
      if (String(error).startsWith("Error: HTTP")) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 8000 * attempt));
  }
  return null;
}

const search = (query) => getJson(`${base}?q=moon&page_size=10&${query}`);
const cc0 = await search("license=cc0");
const pdm = await search("license=pdm");
const commercial = await search("license_type=commercial,modification");
if (!cc0 || !pdm || !commercial) process.exit(3);
const detail = await getJson(`${base}${cc0.results[0].id}/`);
if (!detail) process.exit(3);

const checks = {};
const failures = [];
function record(name, isOk, observed) {
  checks[name] = isOk;
  if (!isOk) failures.push(`${name}: ${observed}`);
}

const restricted = /(^|-)(nc|nd)(-|$)/;
record("cc0 search has results", cc0.results.length > 0, cc0.results.length);
record("cc0 results all license=cc0 with a creativecommons.org licence_url", cc0.results.every((r) => r.license === "cc0" && r.license_url?.includes("creativecommons.org")), "mixed");
record("pdm search has results", pdm.results.length > 0, pdm.results.length);
record("pdm results all license=pdm with a licence_url", pdm.results.every((r) => r.license === "pdm" && r.license_url), pdm.results.map((r) => r.license).join(","));
record("commercial,modification results contain no nc or nd", commercial.results.length > 0 && commercial.results.every((r) => !restricted.test(r.license)), commercial.results.map((r) => r.license).join(","));

const requiredFields = ["id", "title", "creator", "license", "license_version", "license_url", "foreign_landing_url", "url", "attribution", "source"];
const missing = requiredFields.filter((f) => !detail[f]);
record("detail has every attribution field", missing.length === 0, `missing ${missing}`);
record("attribution text names title, creator and licence", ["title", "creator"].every((f) => detail.attribution?.includes(detail[f])) && /CC0|Public Domain/i.test(detail.attribution ?? ""), detail.attribution);

writeFileSync("output/metrics.json", JSON.stringify({ checks, rateLimitHeaders: rateHeaders }, null, 2) + "\n");
writeFileSync("output/sample-detail.json", JSON.stringify(detail, null, 2) + "\n");
console.log(`requests made: ${requestCount}; failed checks: ${failures.length}`);
failures.forEach((m) => console.log(`KNOWN FAIL ${m}`));
