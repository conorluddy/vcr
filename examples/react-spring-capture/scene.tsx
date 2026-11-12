// react-spring DOM scene seeked from t. Every pose is a closed-form function of t, applied with SpringValue.set,
// so no spring is ever started and the spring solver never runs. The frame loop is harness-driven: react-spring
// hands its frame to requestAnimationFrame, and the scene runs that frame once per seek.
import { useLayoutEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { animated, Globals, to, useSpring, type SpringValue } from "@react-spring/web";

const DURATION_S = 3;
const ONE_TURN_RADIANS = Math.PI * 2;

// === FRAME LOOP ===

let sceneMilliseconds = 0;
let pendingSpringFrame: (() => void) | undefined;
// Replaces the rafz clock (performance.now) and its frame scheduler (window.requestAnimationFrame).
Globals.assign({
  now: () => sceneMilliseconds,
  requestAnimationFrame: (frame) => {
    pendingSpringFrame = frame;
  },
});

const springValuesOnStage: SpringValue<number>[] = [];

function runPendingSpringFrame(): void {
  const frame = pendingSpringFrame;
  pendingSpringFrame = undefined;
  frame?.();
  const activeCount = springValuesOnStage.filter((spring) => !spring.idle).length;
  if (activeCount > 0) {
    throw new Error(`react-spring: ${activeCount} spring(s) still active after a seek; nothing may animate between seeks`);
  }
}

// === POSES ===

type Pose = { x: number; y: number; rotateDeg: number; scale: number; opacity: number };
type Poses = { square: Pose; circle: Pose; bar: Pose };

function posesAt(seconds: number): Poses {
  const phase = (seconds / DURATION_S) * ONE_TURN_RADIANS;
  return {
    square: { x: 330 * Math.sin(phase), y: -170, rotateDeg: (360 * seconds) / DURATION_S, scale: 1, opacity: 1 },
    circle: {
      x: 0,
      y: 70 * Math.sin(2 * phase),
      rotateDeg: 0,
      scale: 0.8 + 0.3 * Math.sin((Math.PI * seconds) / DURATION_S),
      opacity: 1,
    },
    bar: {
      x: -330 * Math.sin(phase),
      y: 170,
      rotateDeg: (-180 * seconds) / DURATION_S,
      scale: 1,
      opacity: 0.5 + 0.5 * Math.cos(phase),
    },
  };
}

// === SHAPES ===

type ShapeProps = { pose: Pose; width: number; height: number; radius: string; color: string };

function Shape({ pose, width, height, radius, color }: ShapeProps) {
  const springs = useSpring({ x: 0, y: 0, rotateDeg: 0, scale: 1, opacity: 1 });

  useLayoutEffect(() => {
    springValuesOnStage.push(...(Object.values(springs) as SpringValue<number>[]));
  }, [springs]);

  // Committed by flushSync in seek, so these sets run inside the seek, before the harness settles a frame.
  useLayoutEffect(() => {
    springs.x.set(pose.x);
    springs.y.set(pose.y);
    springs.rotateDeg.set(pose.rotateDeg);
    springs.scale.set(pose.scale);
    springs.opacity.set(pose.opacity);
  }, [pose, springs]);

  return (
    <animated.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width,
        height,
        marginLeft: -width / 2,
        marginTop: -height / 2,
        borderRadius: radius,
        background: color,
        opacity: springs.opacity,
        transform: to(
          [springs.x, springs.y, springs.rotateDeg, springs.scale],
          (x, y, rotateDeg, scale) => `translate(${x}px, ${y}px) rotate(${rotateDeg}deg) scale(${scale})`,
        ),
      }}
    />
  );
}

// === SCENE ===

function Scene() {
  const [seconds, setSeconds] = useState(0);
  const poses = posesAt(seconds);

  useLayoutEffect(() => {
    (window as unknown as { __scene: unknown }).__scene = {
      duration: DURATION_S,
      seek: (nextSeconds: number) => {
        sceneMilliseconds = nextSeconds * 1000;
        flushSync(() => setSeconds(nextSeconds));
        requestAnimationFrame(runPendingSpringFrame);
      },
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Shape pose={poses.square} width={180} height={180} radius="28px" color="#c7f36b" />
      <Shape pose={poses.circle} width={170} height={170} radius="50%" color="#ff7a59" />
      <Shape pose={poses.bar} width={240} height={90} radius="45px" color="#5ab0ff" />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Scene />);
