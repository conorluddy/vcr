// React Three Fiber scene seeked from t. No clock, no useFrame deltas: every transform is a pure
// function of the `t` prop. seek() commits t synchronously, then renders one frame with advance().
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Canvas, advance } from "@react-three/fiber";

const DURATION_S = 3;

function Shapes({ t }: { t: number }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <mesh position={[-1.8, Math.sin(t * 2) * 0.4, 0]} rotation={[t * 0.9, t * 1.3, 0]}>
        <torusKnotGeometry args={[0.6, 0.2, 128, 20]} />
        <meshStandardMaterial color="#c7f36b" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[t * 0.5, t, 0]} scale={0.8 + 0.3 * Math.sin(t * Math.PI)}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff7a59" roughness={0.5} />
      </mesh>
      <mesh position={[1.8, Math.cos(t * 2) * 0.4, 0]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#5ab0ff" flatShading />
      </mesh>
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
