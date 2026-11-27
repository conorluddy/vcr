// FlowmapLayer 'animated-straight' on a plain deck.gl MapView (no basemap). The layer reads Date.now() in its draw,
// so the scene replaces Date.now with a pure function of t; seek(t) sets it and redraws.
import { Deck, MapView } from '@deck.gl/core';
import { FlowmapLayer } from '@flowmap.gl/layers';

const locations = [
  { id: 'dub', lon: -6.26, lat: 53.35 }, { id: 'lon', lon: -0.12, lat: 51.51 }, { id: 'par', lon: 2.35, lat: 48.86 },
  { id: 'ber', lon: 13.4, lat: 52.52 }, { id: 'mad', lon: -3.7, lat: 40.42 }, { id: 'rom', lon: 12.5, lat: 41.9 },
  { id: 'ams', lon: 4.9, lat: 52.37 }, { id: 'vie', lon: 16.37, lat: 48.21 },
];
const flows = [
  ['dub', 'lon', 90], ['lon', 'dub', 70], ['lon', 'par', 60], ['par', 'ber', 40], ['mad', 'par', 50], ['rom', 'vie', 30],
  ['ams', 'ber', 45], ['dub', 'ams', 35], ['mad', 'rom', 25], ['vie', 'ber', 20], ['par', 'lon', 55], ['ber', 'rom', 15],
].map(([origin, dest, count]) => ({ origin, dest, count }));

let fakeNowMs = 0;
Date.now = () => fakeNowMs;

const canvas = document.querySelector('#deck-canvas');
const state = { renders: 0, errors: [] };
window.flowState = state;
const deck = new Deck({
  canvas, width: 960, height: 540, useDevicePixels: false,
  deviceProps: { type: 'webgl', webgl: { alpha: true, antialias: false, preserveDrawingBuffer: true } },
  views: new MapView({ id: 'map' }),
  initialViewState: { longitude: 4, latitude: 48, zoom: 3.6 },
  controller: false,
  layers: [],
  onAfterRender: () => { state.renders++; },
  onError: error => { state.errors.push(error.message); },
});

deck.setProps({
  layers: [new FlowmapLayer({
    id: 'flowmap', data: { locations, flows },
    getLocationId: l => l.id, getLocationLat: l => l.lat, getLocationLon: l => l.lon,
    getFlowOriginId: f => f.origin, getFlowDestId: f => f.dest, getFlowMagnitude: f => f.count,
    flowLinesRenderingMode: 'animated-straight',
    clusteringEnabled: false, locationLabelsEnabled: false, locationTotalsEnabled: true, darkMode: true, fadeEnabled: false,
  })],
});

window.__scene = {
  duration: 3,
  seek: t => {
    fakeNowMs = Math.round(t * 1000);
    requestAnimationFrame(() => deck.redraw('seek'));
  },
};
