import {Circle, makeScene2D} from '@motion-canvas/2d';
import {createRef, waitFor} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();
  view.add(<Circle ref={circle} size={24} fill={'lightseagreen'} />);
  yield* waitFor(0.2);
});
