import React from 'react';
import { createRoot } from 'react-dom/client';
import { Node, Shaders, GLSL } from 'gl-react';
import { Surface } from 'gl-react-dom';

const shaders = Shaders.create({
  gradient: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
void main() {
  gl_FragColor = vec4(uv.x, uv.y, 0.25, 1.0);
}`,
  },
});

function App() {
  return React.createElement(Surface, {
    width: 32,
    height: 24,
    pixelRatio: 1,
    webglContextAttributes: { alpha: false, antialias: false, preserveDrawingBuffer: true },
    onLoad: () => { window.glReactLoad = 'loaded'; },
    onLoadError: (error) => { window.glReactLoad = `error:${error.message}`; },
  }, React.createElement(Node, { shader: shaders.gradient, uniforms: {} }));
}

createRoot(document.querySelector('#root')).render(React.createElement(App));
