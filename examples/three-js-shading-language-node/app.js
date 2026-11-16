import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  NoToneMapping,
  WebGPURenderer,
  MeshBasicNodeMaterial,
  RenderTarget,
  RGBAFormat,
  UnsignedByteType,
} from 'three/webgpu';
import { uniform, uv, vec4 } from 'three/tsl';

const canvas = document.querySelector('#render-target');
const width = 32;
const height = 24;
let renderer;
let autoBackendError = null;
let requestedBackend = 'automatic';

async function initialize(forceWebGL = false) {
  const target = forceWebGL ? canvas.cloneNode(false) : canvas;
  if (forceWebGL) canvas.replaceWith(target);
  const instance = new WebGPURenderer({ canvas: target, antialias: false, alpha: false, forceWebGL });
  instance.setPixelRatio(1);
  instance.setSize(width, height, false);
  instance.outputColorSpace = SRGBColorSpace;
  instance.toneMapping = NoToneMapping;
  await instance.init();
  return { target, instance };
}

try {
  ({ instance: renderer } = await initialize(false));
} catch (error) {
  autoBackendError = String(error?.message ?? error);
}
if (!renderer || renderer.backend?.isWebGPUBackend !== true) {
  if (renderer) renderer.dispose();
  requestedBackend = 'forced-WebGL2';
  ({ instance: renderer } = await initialize(true));
}
const backend = renderer.backend?.isWebGPUBackend === true
  ? 'webgpu'
  : renderer.backend?.isWebGLBackend === true ? 'webgl2-fallback' : 'unknown';
if (backend === 'unknown') throw new Error('Unable to identify the active Three.js renderer backend');

const scene = new Scene();
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 1;
const geometry = new PlaneGeometry(2, 2);
const target = new RenderTarget(width, height, {
  format: RGBAFormat,
  type: UnsignedByteType,
  depthBuffer: false,
  stencilBuffer: false,
});
target.texture.colorSpace = SRGBColorSpace;
const blue = uniform(0.25);
const material = new MeshBasicNodeMaterial();
material.colorNode = vec4(uv().x, uv().y, blue, 1.0);
scene.add(new Mesh(geometry, material));

window.threeReady = {
  backend,
  requestedBackend,
  autoBackendError,
  rendererClass: renderer.constructor.name,
  glVersion: renderer.backend?.gl?.getParameter?.(renderer.backend.gl.VERSION) ?? null,
  gpuAdapter: renderer.backend?.device?.adapter?.info?.description ?? null,
};
window.renderAt = async (value) => {
  blue.value = value;
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  const data = await renderer.readRenderTargetPixelsAsync(target, 0, 0, width, height);
  renderer.setRenderTarget(null);
  return Array.from(data);
};
await window.renderAt(0.25);
window.threeReady.done = true;
