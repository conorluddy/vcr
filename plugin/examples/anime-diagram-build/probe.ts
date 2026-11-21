// Reads node, accent and connector state per frame, in sequential and reversed order, and asserts the predeclared diagram checks.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { openScenePage } from "@vcr/capture";

interface Probe { nodes: { id: string; opacity: number; accent: number }[]; connectors: { id: string; drawn: number }[] }
interface SceneWindow { __scene: { seek(t: number): void; probe(): Probe } }

const here = dirname(fileURLToPath(import.meta.url));
const fps = 30;
const buildEndFrame = 90;
const traceStartFrame = 93;
const traceEndFrame = 130;
const connectorSettleFrames = 12;
const scene = await openScenePage({ sceneFile: join(here, "scene.html"), width: 1280, height: 720 });
try {
  const frames = Math.round(scene.duration * fps);
  const readAt = (frame: number): Promise<Probe> =>
    scene.page.evaluate((t: number) => { const s = (window as unknown as SceneWindow).__scene; s.seek(t); return s.probe(); }, frame / fps);
  const sequential: Probe[] = [];
  for (let frame = 0; frame < frames; frame++) sequential.push(await readAt(frame));
  for (let frame = frames - 1; frame >= 0; frame--) {
    if (JSON.stringify(await readAt(frame)) !== JSON.stringify(sequential[frame])) throw new Error(`probe differs in reverse order at frame ${frame}: ${JSON.stringify(sequential[frame]?.nodes)} vs ${JSON.stringify(await readAt(frame))}`);
  }
  const at = (frame: number): Probe => { const p = sequential[frame]; if (!p) throw new Error(`no probe at ${frame}`); return p; };
  const nodeAt = (frame: number, index: number) => { const n = at(frame).nodes[index]; if (!n) throw new Error(`no node ${index}`); return n; };
  const connectorAt = (frame: number, index: number) => { const c = at(frame).connectors[index]; if (!c) throw new Error(`no connector ${index}`); return c; };
  const first = (test: (frame: number) => boolean): number => sequential.findIndex((_, frame) => test(frame));
  const nodeVisible = [0, 1, 2, 3].map((n) => first((f) => nodeAt(f, n).opacity > 0));
  const connectorStarted = [0, 1, 2].map((c) => first((f) => connectorAt(f, c).drawn > 0));
  const connectorComplete = [0, 1, 2].map((c) => first((f) => connectorAt(f, c).drawn === 1));
  const visible = (n: number): number => nodeVisible[n] ?? -1;

  // 2. order
  for (let n = 1; n < 4; n++) if (!(visible(n) > visible(n - 1) && visible(n - 1) >= 0)) throw new Error(`node ${n + 1} not after node ${n}: ${nodeVisible}`);
  for (let c = 0; c < 3; c++) {
    const started = connectorStarted[c] ?? -1;
    const complete = connectorComplete[c] ?? -1;
    if (!(started >= 0 && started < visible(c + 1))) throw new Error(`connector ${c + 1} does not start before node ${c + 2}`);
    if (!(complete >= 0 && complete <= visible(c + 1) + connectorSettleFrames)) throw new Error(`connector ${c + 1} completes too late`);
  }
  // 3. recede
  for (let n = 0; n < 3; n++) {
    const node = nodeAt(buildEndFrame, n);
    if (node.accent !== 0 || node.opacity !== 1) throw new Error(`node ${n + 1} not at rest at build end`);
  }
  // 4. trace
  let lastLit = -1;
  const litOrder: number[] = [];
  for (let frame = traceStartFrame; frame <= traceEndFrame; frame++) {
    const lit = at(frame).nodes.flatMap((node, index) => (node.accent > 0.5 ? [index] : []));
    const current = lit[0];
    if (lit.length > 1) throw new Error(`more than one lit node at frame ${frame}: ${lit}`);
    if (current === undefined) continue;
    if (current < lastLit) throw new Error(`lit node decreased at frame ${frame}`);
    if (current !== lastLit) litOrder.push(current);
    lastLit = current;
  }
  if (litOrder.join() !== "0,1,2,3") throw new Error(`lit order ${litOrder}`);
  // 1 and 5. frame 0 hidden, hold
  if (at(0).nodes.some((n) => n.opacity !== 0 || n.accent !== 0) || at(0).connectors.some((c) => c.drawn !== 0)) throw new Error("frame 0 not fully hidden");
  for (let frame = frames - 15; frame < frames; frame++) {
    const accents = at(frame).nodes.map((n) => n.accent).join();
    if (accents !== "0,0,0,1") throw new Error(`hold broken at frame ${frame}: ${accents}`);
  }
  mkdirSync(join(here, "output"), { recursive: true });
  writeFileSync(join(here, "output/probe.json"), `${JSON.stringify({
    frames, node_first_visible_frames: nodeVisible, connector_first_drawn_frames: connectorStarted, connector_complete_frames: connectorComplete,
    build_end_frame: buildEndFrame, build_end: at(buildEndFrame), trace_lit_order: litOrder, hold_accents: at(frames - 1).nodes.map((n) => n.accent), reverse_order_probe_matches: true,
  }, null, 2)}\n`);
} finally {
  await scene.close();
}
