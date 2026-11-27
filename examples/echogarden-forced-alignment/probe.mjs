import * as Echogarden from "echogarden";
const t = Date.now();
const r = await Echogarden.align("output/s.wav", "the red fox jumps over the quiet brown river today", { engine: "dtw", language: "en" });
console.log(Date.now() - t, JSON.stringify(r.timeline.map((w) => [w.text, w.startTime, w.endTime])));
console.log(Object.keys(r));
