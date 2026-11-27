// Fixed-step Box2D v3 simulation: three circles dropped on a floor, positions recorded every frame.
// argv[2] picks the wasm build (compat or deluxe), argv[3] the output path.
import { mkdirSync, writeFileSync } from 'node:fs';

const build = process.argv[2] ?? 'compat';
const outputPath = process.argv[3] ?? 'output/trajectory.json';
const fps = 30;
const frameCount = 90;
const subStepCount = 4;
const dropHeights = [4, 6, 8];
const radius = 0.5;

const { default: Box2DFactory } = await import(`box2d3-wasm/${build}`);
const box2d = await Box2DFactory();
const { b2DefaultWorldDef, b2CreateWorld, b2DefaultBodyDef, b2CreateBody, b2DefaultShapeDef,
  b2MakeBox, b2CreatePolygonShape, b2CreateCircleShape, b2World_Step, b2Body_GetPosition,
  b2DestroyWorld, b2Vec2, b2BodyType, b2Circle } = box2d;

const worldDef = b2DefaultWorldDef();
worldDef.gravity = new b2Vec2(0, -10);
const worldId = b2CreateWorld(worldDef);

const floorDef = b2DefaultBodyDef();
floorDef.position = new b2Vec2(0, -0.5);
const floorId = b2CreateBody(worldId, floorDef);
b2CreatePolygonShape(floorId, b2DefaultShapeDef(), b2MakeBox(20, 0.5));

const balls = dropHeights.map((height, index) => {
  const bodyDef = b2DefaultBodyDef();
  bodyDef.type = b2BodyType.b2_dynamicBody;
  bodyDef.position = new b2Vec2(index * 2 - 2, height);
  const bodyId = b2CreateBody(worldId, bodyDef);
  const shapeDef = b2DefaultShapeDef();
  shapeDef.material.restitution = 0.5;
  const circle = new b2Circle();
  circle.radius = radius;
  b2CreateCircleShape(bodyId, shapeDef, circle);
  return bodyId;
});

const frames = [];
for (let frame = 0; frame < frameCount; frame++) {
  frames.push(balls.map((bodyId) => {
    const position = b2Body_GetPosition(bodyId);
    const xy = [position.x, position.y];
    position.delete();
    return xy;
  }));
  b2World_Step(worldId, 1 / fps, subStepCount);
}
b2DestroyWorld(worldId);

mkdirSync('output', { recursive: true });
writeFileSync(outputPath, JSON.stringify({ build, fps, frameCount, subStepCount, frames }));
