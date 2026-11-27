struct vertexMain_Output {
  @builtin(position) pos: vec4f,
}

@vertex fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> vertexMain_Output {
  let corners = array<vec2f, 3>(vec2f(-1), vec2f(3, -1), vec2f(-1, 3));
  return vertexMain_Output(vec4f(corners[vertexIndex], 0f, 1f));
}

struct Params {
  time: f32,
  size: vec2f,
}

@group(0) @binding(0) var<uniform> params: Params;

@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let uv = (position.xy / params.size);
  return vec4f(uv.x, uv.y, params.time, 1f);
}