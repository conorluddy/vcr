// Motion scene seeked from t. Three motion.div elements whose style is bound to motion values;
// each value is animated by a paused animate() control and seeked by setting its .time to t.
// Controls are stopped at build time, which releases motion's frameloop (a paused control keeps
// it running at rAF rate). Setting .time on a stopped control applies f(t) synchronously.
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { animate, motion, motionValue, type AnimationPlaybackControls } from "motion/react";

const DURATION_S = 3;

const circleX = motionValue(0);
const squareRotate = motionValue(0);
const squareScale = motionValue(1);
const dotY = motionValue(0);
const dotOpacity = motionValue(1);

// Yoyo across the middle: the circle reaches its right-hand end at t = 1.5 s, exactly frame 45.
const timelines: AnimationPlaybackControls[] = [
  animate(circleX, [-300, 300], { duration: DURATION_S / 2, ease: "easeInOut", repeat: 1, repeatType: "reverse", autoplay: false }),
  animate(squareRotate, [0, 270], { duration: DURATION_S, ease: "easeInOut", autoplay: false }),
  animate(squareScale, [0.6, 1.2, 0.6], { duration: DURATION_S, times: [0, 0.5, 1], ease: "easeInOut", autoplay: false }),
  animate(dotY, [0, -160, 0], { duration: DURATION_S, times: [0, 0.5, 1], ease: "easeInOut", autoplay: false }),
  animate(dotOpacity, [0.2, 1, 0.2], { duration: DURATION_S, times: [0, 0.5, 1], ease: "easeInOut", autoplay: false }),
];
for (const timeline of timelines) timeline.stop();

// Pure function of t: every control is set to the same time, so the last seek fixes the whole frame.
function seek(seconds: number): void {
  for (const timeline of timelines) timeline.time = seconds;
}

function Scene() {
  return (
    <div id="stage">
      <motion.div className="shape" style={{ left: 550, top: 150, width: 180, height: 180, borderRadius: 90, background: "#c7f36b", x: circleX }} />
      <motion.div className="shape" style={{ left: 540, top: 260, width: 200, height: 200, background: "#ff7a59", rotate: squareRotate, scale: squareScale }} />
      <motion.div className="shape" style={{ left: 1000, top: 470, width: 140, height: 140, borderRadius: 20, background: "#5ab0ff", y: dotY, opacity: dotOpacity }} />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
// flushSync so the elements exist before the harness's first seek and first screenshot.
flushSync(() => root.render(<Scene />));
(window as unknown as { __scene: unknown }).__scene = { duration: DURATION_S, seek };
