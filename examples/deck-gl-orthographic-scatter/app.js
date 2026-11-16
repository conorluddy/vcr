import { COORDINATE_SYSTEM, Deck, OrthographicView } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';

const canvas = document.querySelector('#deck-canvas');
const points = [
  { id: 'red-left', position: [-12, 0], color: [255, 0, 0, 255] },
  { id: 'blue-right', position: [12, 0], color: [0, 0, 255, 255] },
];
const layer = new ScatterplotLayer({
  id: 'fixture-points',
  data: points,
  coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
  getPosition: point => point.position,
  getFillColor: point => point.color,
  getRadius: 6,
  radiusUnits: 'pixels',
  radiusMinPixels: 6,
  radiusMaxPixels: 6,
  filled: true,
  stroked: false,
  antialiasing: false,
  pickable: false,
});
const state = { renderCount: 0, errors: [], outsideRequests: [] };
window.deckState = state;
const deck = new Deck({
  canvas,
  width: 64,
  height: 32,
  useDevicePixels: false,
  deviceProps: {
    type: 'webgl',
    webgl: { alpha: true, antialias: false, preserveDrawingBuffer: true },
  },
  views: new OrthographicView({ id: 'ortho', flipY: true }),
  initialViewState: { target: [0, 0, 0], zoom: 0 },
  controller: false,
  layers: [layer],
  onAfterRender: ({ device, gl }) => {
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    state.renderCount++;
    state.renderer = {
      deviceType: device.type,
      contextVersion: gl.getParameter(gl.VERSION),
      vendor: debug ? gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) : 'unavailable',
      renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      canvasSize: [canvas.width, canvas.height],
    };
    if (!state.projected) {
      const viewport = deck.getViewports()[0];
      state.projected = viewport.project([-12, 0]).slice(0, 2).concat(viewport.project([12, 0]).slice(0, 2));
      state.deckInitialized = deck.isInitialized;
      state.ready = true;
    }
  },
  onError: error => state.errors.push(error.message),
});
window.deckInstance = deck;
window.forceRedraw = () => deck.redraw('evidence-repeat');
