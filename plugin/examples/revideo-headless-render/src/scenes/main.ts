import {linear} from '@revideo/core';
import {Rect, Txt, makeScene2D} from '@revideo/2d';

// Analytic reference: the rect's centre x moves from -100 to +100 over 2 s, linear.
export const RECT_START_X = -100;
export const RECT_END_X = 100;
export const SCENE_DURATION_SECONDS = 2;

export default makeScene2D('main', function* (view) {
  const rect = new Rect({width: 40, height: 40, fill: '#ff0000', x: RECT_START_X, y: 0});
  const label = new Txt({text: 'revideo', fill: '#ffffff', fontSize: 20, y: -60});
  view.add(label);
  view.add(rect);
  yield* rect.position.x(RECT_END_X, SCENE_DURATION_SECONDS, linear);
});
