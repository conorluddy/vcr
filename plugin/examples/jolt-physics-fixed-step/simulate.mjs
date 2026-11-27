// Fixed-step Jolt simulation: three spheres dropped on a floor, positions recorded every frame.
import Jolt from 'jolt-physics';
import { mkdirSync, writeFileSync } from 'node:fs';

const fps = 30;
const frameCount = 90;
const subSteps = 2;
const dropHeights = [4, 6, 8];

const jolt = await Jolt();
const settings = new jolt.JoltSettings();
const objectFilter = new jolt.ObjectLayerPairFilterTable(2);
objectFilter.EnableCollision(0, 1);
objectFilter.EnableCollision(1, 1);
const broadPhaseLayerInterface = new jolt.BroadPhaseLayerInterfaceTable(2, 2);
broadPhaseLayerInterface.MapObjectToBroadPhaseLayer(0, new jolt.BroadPhaseLayer(0));
broadPhaseLayerInterface.MapObjectToBroadPhaseLayer(1, new jolt.BroadPhaseLayer(1));
settings.mObjectLayerPairFilter = objectFilter;
settings.mBroadPhaseLayerInterface = broadPhaseLayerInterface;
settings.mObjectVsBroadPhaseLayerFilter = new jolt.ObjectVsBroadPhaseLayerFilterTable(
  broadPhaseLayerInterface, 2, objectFilter, 2);
const joltInterface = new jolt.JoltInterface(settings);
const bodyInterface = joltInterface.GetPhysicsSystem().GetBodyInterface();

const floorShape = new jolt.BoxShape(new jolt.Vec3(20, 0.5, 20));
const floor = bodyInterface.CreateBody(new jolt.BodyCreationSettings(
  floorShape, new jolt.RVec3(0, -0.5, 0), new jolt.Quat(0, 0, 0, 1),
  jolt.EMotionType_Static, 0));
bodyInterface.AddBody(floor.GetID(), jolt.EActivation_DontActivate);

const balls = dropHeights.map((height, index) => {
  const creation = new jolt.BodyCreationSettings(
    new jolt.SphereShape(0.5), new jolt.RVec3(index * 2 - 2, height, 0), new jolt.Quat(0, 0, 0, 1),
    jolt.EMotionType_Dynamic, 1);
  creation.mRestitution = 0.5;
  const body = bodyInterface.CreateBody(creation);
  bodyInterface.AddBody(body.GetID(), jolt.EActivation_Activate);
  return body;
});

const frames = [];
for (let frame = 0; frame < frameCount; frame++) {
  frames.push(balls.map((body) => {
    const position = body.GetPosition();
    return [position.GetX(), position.GetY(), position.GetZ()];
  }));
  joltInterface.Step(1 / fps, subSteps);
}

mkdirSync('output', { recursive: true });
writeFileSync('output/trajectory.json', JSON.stringify({ fps, frameCount, subSteps, frames }));
