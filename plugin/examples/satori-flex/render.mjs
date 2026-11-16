import { createElement as h } from "react";
import satori from "satori";
import { mkdir, writeFile } from "node:fs/promises";

const tree = h("div", {
  style: { display: "flex", width: 320, height: 180, backgroundColor: "#102030", padding: 20, gap: 12 },
  children: [
    h("div", { style: { width: 80, height: 60, backgroundColor: "#ff0000" } }),
    h("div", { style: { width: 120, height: 100, backgroundColor: "#00ff00" } }),
  ],
});
const svg = await satori(tree, { width: 320, height: 180, fonts: [] });
await mkdir(new URL("./output/", import.meta.url), { recursive: true });
await writeFile(new URL("./output/layout.svg", import.meta.url), svg);
