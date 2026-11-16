import {Alignment, Fit, Layout, Rive} from '@rive-app/canvas';

const canvas = document.getElementById('riveCanvas');
const rive = new Rive({
  src: '/runtime_nested_inputs.riv',
  canvas,
  autoplay: true,
  layout: new Layout({fit: Fit.Contain, alignment: Alignment.Center}),
  stateMachines: ['MainStateMachine'],
  onLoad: () => {
    rive.resizeDrawingSurfaceToCanvas();
    window.__ready = true;
  },
  onLoadError: (event) => { window.__error = String(event); },
});
window.__rive = rive;
