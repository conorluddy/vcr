precision mediump float;

#pragma glslify: cubicInOut = require(glsl-easings/cubic-in-out)

uniform float uProgress;

void main() {
  float eased = cubicInOut(uProgress);
  gl_FragColor = vec4(eased, 0.0, 0.0, 1.0);
}
