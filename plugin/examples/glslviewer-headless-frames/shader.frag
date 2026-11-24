// Hand-written fragment shader, a pure function of u_resolution and u_time.
// Expected 8-bit value at pixel (px, py) of a W x H frame at time t:
//   r = 255 * (px + 0.5) / W
//   g = 255 * (1 - (py + 0.5) / H)      (row 0 is the top of the PNG)
//   b = 255 * (0.5 + 0.5 * sin(t))
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    gl_FragColor = vec4(st.x, st.y, 0.5 + 0.5 * sin(u_time), 1.0);
}
