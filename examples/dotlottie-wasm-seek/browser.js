import { DotLottie } from '@lottiefiles/dotlottie-web';

DotLottie.setWasmUrl('/output/dotlottie-player.wasm');
await DotLottie.preload();
const canvas = document.querySelector('#target');
const player = new DotLottie({
  canvas,
  src: '/output/owned-animation.lottie',
  autoplay: false,
  loop: false,
  layout: { fit: 'contain', align: [0, 0] },
  renderConfig: { autoResize: false, devicePixelRatio: 1, freezeOnOffscreen: false },
});
window.dotLottiePlayer = player;
window.dotLottieLoadState = new Promise((resolve, reject) => {
  player.addEventListener('load', () => resolve(true));
  player.addEventListener('loadError', (event) => reject(event.error));
  player.addEventListener('renderError', (event) => reject(event.error));
});
