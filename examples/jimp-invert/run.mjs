import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { intToRGBA, Jimp, rgbaToInt } from "jimp";

const version = JSON.parse(await readFile(new URL("./node_modules/jimp/package.json", import.meta.url), "utf8")).version;
const image = new Jimp({ width: 2, height: 1, color: 0x00000000 });
image.setPixelColor(rgbaToInt(10, 20, 30, 255), 0, 0);
image.setPixelColor(rgbaToInt(200, 100, 50, 128), 1, 0);
image.invert();
await mkdir("output", { recursive: true });
await image.write("output/inverted.png");
const reopened = await Jimp.read("output/inverted.png");
const pixels = [0, 1].map((x) => intToRGBA(reopened.getPixelColor(x, 0)));
const png = await readFile("output/inverted.png");
const summary = {
  jimp: version,
  width: reopened.width,
  height: reopened.height,
  pixels,
  png_sha256: createHash("sha256").update(png).digest("hex"),
};
await writeFile("output/summary.json", `${JSON.stringify(summary, null, 2)}\n`);
