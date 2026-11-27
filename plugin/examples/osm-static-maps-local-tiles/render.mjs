// Local loopback tile server (synthetic checker tiles) -> osm-static-maps -> output/map.png.
// No request leaves 127.0.0.1, so the OpenStreetMap tile policy is not engaged.
import http from "node:http";
import zlib from "node:zlib";
import fs from "node:fs";
import osmsm, { closeBrowser } from "osm-static-maps";

const TILE_COLOURS = [[200, 220, 200], [170, 200, 170]];
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); };
function flatTilePng([r, g, b]) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(256, 0); ihdr.writeUInt32BE(256, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.from(Array.from({ length: 256 }, () => [r, g, b]).flat())]);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(Buffer.concat(Array(256).fill(row)))), chunk("IEND", Buffer.alloc(0))]);
}
const tiles = TILE_COLOURS.map(flatTilePng);

const requests = [];
const server = http.createServer((req, res) => {
  const match = /^\/(\d+)\/(\d+)\/(\d+)\.png$/.exec(req.url);
  if (!match) { res.writeHead(404).end(); return; }
  requests.push(req.url);
  res.writeHead(200, { "content-type": "image/png" }).end(tiles[(Number(match[2]) + Number(match[3])) % 2]);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

const geojson = { type: "FeatureCollection", features: [
  { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-6.30, 53.33], [-6.24, 53.33], [-6.24, 53.36], [-6.30, 53.36], [-6.30, 53.33]]] }, pathOptions: { color: "#ff0000", fillColor: "#ff0000", fillOpacity: 1 } },
] };
const png = await osmsm({ geojson, width: 640, height: 360, center: "-6.27,53.345", zoom: 12, tileserverUrl: `http://127.0.0.1:${port}/{z}/{x}/{y}.png`, attribution: "VCR fixture / synthetic tiles", timeout: 30000 });
await closeBrowser(); // the typings claim osmsm.closeBrowser; at runtime it is a named export
server.close();
fs.mkdirSync("output", { recursive: true });
fs.writeFileSync("output/map.png", png);
fs.writeFileSync("output/requests.json", JSON.stringify([...new Set(requests)].sort(), null, 1) + "\n");
console.log(`rendered ${png.length} bytes, ${new Set(requests).size} distinct local tile urls`);
