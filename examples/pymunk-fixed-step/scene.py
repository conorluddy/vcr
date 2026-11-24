"""Predeclared pymunk scene: static floor, three boxes, two circles and one ball.

Pure module: no clock, no randomness, no file or network access. Every body starts
at the fixed pose listed in BODY_SPECS. Units are pixels, seconds and radians.
"""
from dataclasses import dataclass
from typing import Literal

import pymunk

STEP_SECONDS = 1.0 / 60.0
TOTAL_STEPS = 900
GRAVITY_PX_PER_S2 = (0.0, -900.0)
SOLVER_ITERATIONS = 10
BODY_MASS = 1.0
SHAPE_ELASTICITY = 0.3
SHAPE_FRICTION = 0.7
FLOOR_HALF_WIDTH_PX = 400.0
FLOOR_RADIUS_PX = 2.0


@dataclass(frozen=True)
class BodySpec:
    name: str
    kind: Literal["box", "circle"]
    start_x_px: float
    start_y_px: float
    start_angle_rad: float
    size_px: float  # box side length, or circle radius


BODY_SPECS: tuple[BodySpec, ...] = (
    BodySpec("ball", "circle", -250.0, 200.0, 0.0, 10.0),
    BodySpec("box_a", "box", 0.0, 300.0, 0.0, 40.0),
    BodySpec("box_b", "box", 30.0, 380.0, 0.4, 40.0),
    BodySpec("box_c", "box", 60.0, 460.0, 0.9, 30.0),
    BodySpec("circle_a", "circle", 120.0, 250.0, 0.0, 15.0),
    BodySpec("circle_b", "circle", 150.0, 330.0, 0.0, 12.0),
)


# === PUBLIC API ===

def build_space() -> tuple[pymunk.Space, dict[str, pymunk.Body]]:
    space = pymunk.Space()
    space.gravity = GRAVITY_PX_PER_S2
    space.iterations = SOLVER_ITERATIONS
    floor = pymunk.Segment(
        space.static_body,
        (-FLOOR_HALF_WIDTH_PX, 0.0),
        (FLOOR_HALF_WIDTH_PX, 0.0),
        FLOOR_RADIUS_PX,
    )
    floor.elasticity = SHAPE_ELASTICITY
    floor.friction = SHAPE_FRICTION
    space.add(floor)
    bodies = {spec.name: add_body(space, spec) for spec in BODY_SPECS}
    return space, bodies


# === HELPERS ===

def add_body(space: pymunk.Space, spec: BodySpec) -> pymunk.Body:
    if spec.kind == "box":
        moment = pymunk.moment_for_box(BODY_MASS, (spec.size_px, spec.size_px))
        body = pymunk.Body(BODY_MASS, moment)
        shape = pymunk.Poly.create_box(body, (spec.size_px, spec.size_px))
    else:
        moment = pymunk.moment_for_circle(BODY_MASS, 0.0, spec.size_px)
        body = pymunk.Body(BODY_MASS, moment)
        shape = pymunk.Circle(body, spec.size_px)
    body.position = (spec.start_x_px, spec.start_y_px)
    body.angle = spec.start_angle_rad
    shape.elasticity = SHAPE_ELASTICITY
    shape.friction = SHAPE_FRICTION
    space.add(body, shape)
    return body
