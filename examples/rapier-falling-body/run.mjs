import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import RAPIER from "@dimforge/rapier3d-compat";

const VERSION = "0.21.0";
await RAPIER.init();

function simulate() {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / 60;
  const floor = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  world.createCollider(RAPIER.ColliderDesc.cuboid(5, 0.1, 5), floor);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 2, 0));
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), body);
  for (let step = 0; step < 120; step += 1) world.step();
  const position = body.translation();
  const velocity = body.linvel();
  world.free();
  return {
    steps: 120,
    timestep: 1 / 60,
    position: [position.x, position.y, position.z].map((n) => Number(n.toFixed(6))),
    velocity: [velocity.x, velocity.y, velocity.z].map((n) => Number(n.toFixed(6))),
  };
}

const first = simulate();
const second = simulate();
if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error("identical fixed-step runs produced different numerical state");
if (!(first.position[1] > 0.58 && first.position[1] < 0.65)) throw new Error(`body did not settle on the floor: ${first.position[1]}`);
if (Math.abs(first.velocity[1]) > 0.02) throw new Error(`body did not settle: vertical velocity ${first.velocity[1]}`);
const stateHash = createHash("sha256").update(JSON.stringify(first)).digest("hex");
const metrics = { rapier_version: VERSION, ...first, state_sha256: stateHash };
const expectedPath = "expected/metrics.json";
const serialized = `${JSON.stringify(metrics, null, 2)}\n`;
if (process.argv[2] === "--record") {
  mkdirSync("expected", { recursive: true });
  writeFileSync(expectedPath, serialized);
} else if (readFileSync(expectedPath, "utf8") !== serialized) {
  throw new Error(`${expectedPath} differs; observed ${serialized}`);
}
console.log(`OK Rapier ${VERSION}: settled at y=${first.position[1]}, 120 fixed steps, state ${stateHash}`);
