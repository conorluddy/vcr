// drei helpers (RoundedBox, Center, Line) inside an R3F scene seeked from t. No clock and no useFrame:
// every transform and every line vertex is a pure function of the `t` prop. seek() commits t with
// flushSync, then renders one frame with advance(). Excluded: Float (reads a clock), Text, Environment.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Canvas, advance } from "@react-three/fiber";
import { Center, Line, RoundedBox } from "@react-three/drei";

const DURATION_S = 3;
const LINE_POINT_COUNT = 160;

// One full loop over the duration, so frame 0 and the duration match.
function phaseAt(t: number): number {
  return (2 * Math.PI * t) / DURATION_S;
}

function wavePoints(phase: number): [number, number, number][] {
  return Array.from({ length: LINE_POINT_COUNT }, (_, index) => {
    const u = index / (LINE_POINT_COUNT - 1);
    return [-2.6 + 5.2 * u, -1.5 + 0.25 * Math.sin(2 * Math.PI * 3 * u + phase), 0];
  });
}

function Shapes({ t }: { t: number }) {
  const phase = phaseAt(t);
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <RoundedBox
        args={[1.2, 1.2, 1.2]}
        radius={0.2}
        smoothness={6}
        position={[-1.9, 0.3 * Math.sin(phase), 0]}
        rotation={[t * 0.9, t * 1.3, 0]}
      >
        <meshStandardMaterial color="#c7f36b" roughness={0.35} />
      </RoundedBox>
      <group position={[1.9, 0.3 * Math.cos(phase), 0]} rotation={[0, t * 1.1, 0]} scale={0.9 + 0.1 * Math.sin(phase)}>
        <Center>
          <mesh>
            <torusKnotGeometry args={[0.5, 0.18, 128, 20]} />
            <meshStandardMaterial color="#ff7a59" roughness={0.5} />
          </mesh>
        </Center>
      </group>
      <Line points={wavePoints(phase)} color="#5ab0ff" lineWidth={3} />
    </>
  );
}

let setSceneTime: (t: number) => void = () => {};

function Scene() {
  const [t, setT] = useState(0);
  setSceneTime = setT;
  return (
    <Canvas
      frameloop="never"
      dpr={1}
      gl={{ alpha: true, antialias: false, preserveDrawingBuffer: true }}
      camera={{ position: [0, 1.2, 5], fov: 40 }}
      onCreated={() => {
        (window as unknown as { __scene: unknown }).__scene = { duration: DURATION_S, seek };
      }}
    >
      <Shapes t={t} />
    </Canvas>
  );
}

// Commit t synchronously, then draw on the animation frame the harness settles, as three-capture does.
function seek(t: number): void {
  flushSync(() => setSceneTime(t));
  requestAnimationFrame(() => advance(t * 1000));
}

createRoot(document.getElementById("root")!).render(<Scene />);
