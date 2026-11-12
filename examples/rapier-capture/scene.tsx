// react-three-rapier scene seeked from t. Physics is paused and only moves when seek(t) steps it.
// Each seek restores the world to the snapshot taken before the first step, then steps at 1/60 s from 0 to t,
// so a frame is a pure function of t. No clock, no useFrame deltas, no accumulator carried between seeks.
import { useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, advance } from "@react-three/fiber";
import { BallCollider, CuboidCollider, CylinderCollider, Physics, RigidBody, useRapier } from "@react-three/rapier";
// Deep import (see README): the published init() default builds new URL(..., "<deleted>"), which throws in browsers.
// World and init must come from the same module instance that Physics uses, hence the hoisted path.
import { World, init } from "@dimforge/rapier3d-compat";

const DURATION_S = 3;
const FIXED_STEP_S = 1 / 60;
const WASM_URL = "./output/bundle/rapier_wasm3d_bg.wasm";

type Vector3Tuple = [number, number, number];
type Pose = { position: Vector3Tuple; rotation: Vector3Tuple };
type PhysicsHandle = {
  step: (dt: number) => void;
  takeSnapshot: () => Uint8Array;
  replaceWorld: (next: World) => void;
};

// Set by SceneBridge once Physics has created its world. seek() reaches physics only through this handle.
let physics: PhysicsHandle | undefined;
// Taken at the first seek, when no step has run, so it is the rest state of every body.
let restSnapshot: Uint8Array | undefined;

const FLOOR_POSE: Pose = { position: [0, -1.1, 0], rotation: [0, 0, 0] };
const BALL_POSE: Pose = { position: [-1.0, 2.4, 0], rotation: [0, 0, 0] };
const BOX_POSE: Pose = { position: [0.2, 3.2, 0.1], rotation: [0.3, 0.4, 0.2] };
const CYLINDER_POSE: Pose = { position: [1.1, 4.0, -0.2], rotation: [0.7, 0, 0.5] };

function Body({ type, pose, children }: { type: "fixed" | "dynamic"; pose: Pose; children: ReactNode }) {
  return (
    <RigidBody type={type} position={pose.position} rotation={pose.rotation} restitution={0.35} friction={0.6}>
      {children}
    </RigidBody>
  );
}

// Every seek derives the world from the rest snapshot, so the frame does not depend on which frames were captured before.
// Resetting only body poses and velocities was measured to leave rapier state behind (mechanism not isolated, see README).
function seek(t: number): void {
  if (!physics) throw new Error("seek() called before react-three-rapier Physics was ready");
  restSnapshot ??= physics.takeSnapshot();
  physics.replaceWorld(World.restoreSnapshot(restSnapshot));
  // A zero-length step copies the restored rest poses onto the meshes; Physics only syncs meshes inside step().
  physics.step(0);
  const stepCount = Math.round(t / FIXED_STEP_S);
  for (let step = 0; step < stepCount; step += 1) physics.step(FIXED_STEP_S);
  requestAnimationFrame(() => advance(t * 1000));
}

// Mounted inside Physics, so its effect runs only once the WASM-backed world exists and the bodies have registered.
function SceneBridge() {
  const { step, world, setWorld } = useRapier();
  useEffect(() => {
    physics = {
      step,
      takeSnapshot: () => world.takeSnapshot(),
      replaceWorld: (next) => {
        world.free();
        setWorld(next);
      },
    };
    (window as unknown as { __scene: unknown }).__scene = { duration: DURATION_S, seek };
  }, [step, world, setWorld]);
  return null;
}

function Scene() {
  return (
    <Canvas
      frameloop="never"
      dpr={1}
      gl={{ alpha: true, antialias: false, preserveDrawingBuffer: true }}
      camera={{ position: [0, 1.6, 11], fov: 40 }}
      onCreated={({ camera }) => camera.lookAt(0, 0.6, 0)}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 6, 5]} intensity={1.4} />
      <Physics paused interpolate={false} timeStep={FIXED_STEP_S} gravity={[0, -9.81, 0]}>
        <Body type="fixed" pose={FLOOR_POSE}>
          <CuboidCollider args={[2.6, 0.1, 2.6]} />
          <mesh>
            <boxGeometry args={[5.2, 0.2, 5.2]} />
            <meshStandardMaterial color="#2b2f3a" roughness={0.8} />
          </mesh>
        </Body>
        <Body type="dynamic" pose={BALL_POSE}>
          <BallCollider args={[0.35]} />
          <mesh>
            <sphereGeometry args={[0.35, 32, 16]} />
            <meshStandardMaterial color="#ff7a59" roughness={0.4} />
          </mesh>
        </Body>
        <Body type="dynamic" pose={BOX_POSE}>
          <CuboidCollider args={[0.4, 0.4, 0.4]} />
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#c7f36b" roughness={0.5} />
          </mesh>
        </Body>
        <Body type="dynamic" pose={CYLINDER_POSE}>
          <CylinderCollider args={[0.3, 0.3]} />
          <mesh>
            <cylinderGeometry args={[0.3, 0.3, 0.6, 32]} />
            <meshStandardMaterial color="#5ab0ff" flatShading />
          </mesh>
        </Body>
        <SceneBridge />
      </Physics>
    </Canvas>
  );
}

// Load the WASM before React renders, so Physics finds the module already initialised and never calls the broken default.
await init({ module_or_path: WASM_URL });
createRoot(document.getElementById("root")!).render(<Scene />);
