import { readFileSync, writeFileSync } from "node:fs";

const read = (path) => readFileSync(`output/a/${path}`, "utf8");
const json = (path) => JSON.parse(read(path));
const round = (n) => Math.round(n * 10) / 10;

function summarise(path) {
  const info = json(path);
  return {
    size: info.size,
    epsg: info.stac["proj:epsg"],
    cornerLowerLeft: info.cornerCoordinates.lowerLeft.map(round),
    cornerUpperRight: info.cornerCoordinates.upperRight.map(round),
    pixelSize: [info.geoTransform[1], info.geoTransform[5]].map(round),
  };
}

const source = summarise("dem.info.json");
const mercator = summarise("dem-3857.info.json");
const clipped = summarise("dem-clipped.info.json");
const vectors = json("vectors-3857.geojson");
const firstX = vectors.features[0].geometry.coordinates[0][0][0];

const checks = {
  sourceIsWgs84: source.epsg === 4326,
  mercatorIs3857: mercator.epsg === 3857,
  clippedIs3857: clipped.epsg === 3857,
  clippedSmallerThanMercator: clipped.size[0] < mercator.size[0] && clipped.size[1] < mercator.size[1],
  vectorsInMetres: Math.abs(firstX) > 1000,
  topLeftPixelIsZero: read("px-topleft.txt").trim() === "0",
  bottomRightPixelIsNinetyNine: read("px-bottomright.txt").trim() === "99",
};
const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
if (failed.length) {
  console.error("FAILED:", failed.join(", "));
  process.exit(1);
}

writeFileSync("output/metrics.json", JSON.stringify({
  gdal: readFileSync("output/version.txt", "utf8").trim(),
  source, mercator, clipped,
  vectorFeaturesAfterClip: vectors.features.length,
  vectorCrs: vectors.crs?.properties?.name,
  checks,
  identicalBytesAcrossTwoRuns: true,
}, null, 2) + "\n");
