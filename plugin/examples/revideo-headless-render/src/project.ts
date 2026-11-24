import {makeProject} from '@revideo/core';
import main from './scenes/main';

export default makeProject({
  scenes: [main],
  settings: {
    shared: {
      size: {x: 320, y: 180},
      background: '#000000',
      range: [0, 2],
    },
    rendering: {
      fps: 30,
    },
  },
});
