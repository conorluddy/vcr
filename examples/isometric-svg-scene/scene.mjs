// Isometric scene as a pure function of time t in [0, 1]: a floor tile, a fixed block and a block that grows.
// Every id is passed explicitly because the library otherwise generates random ones.
import { IsometricCanvas, IsometricRectangle, PlaneView } from '@elchininet/isometric/node';

export function renderFrameSvg(t) {
  const canvas = new IsometricCanvas({ id: 'scene', width: 800, height: 600, scale: 40, backgroundColor: '#ffffff' });
  canvas.addChild(new IsometricRectangle({ id: 'floor', planeView: PlaneView.TOP, width: 6, height: 6, fillColor: '#e8edf2', strokeColor: '#9aa7b4' }));
  addBlock(canvas, 'a', { right: 3, left: 0, top: 0 }, 2, 2, 1, ['#4f9dde', '#2f6fa8', '#8ec5f5']);
  addBlock(canvas, 'b', { right: 0, left: 3, top: 0 }, 2, 2, 1 + 3 * t, ['#e0863a', '#a85e22', '#f5b87e']);
  return canvas.getSVGCode();
}

// Axes seen on screen: right runs down-right, left runs down-left, top runs up. TOP spans right x left,
// FRONT spans left x top (width along left) at a fixed right, SIDE spans right x top at a fixed left.
// A block shows its top and the two faces on its far-right and far-left sides.
function addBlock(canvas, name, { right, left, top }, width, depth, height, [topFill, frontFill, sideFill]) {
  const common = { strokeColor: '#1f2933' };
  canvas.addChildren(
    new IsometricRectangle({ ...common, id: `${name}-top`, planeView: PlaneView.TOP, right, left, top: top + height, width, height: depth, fillColor: topFill }),
    new IsometricRectangle({ ...common, id: `${name}-front`, planeView: PlaneView.FRONT, right: right + width, left, top, width: depth, height, fillColor: frontFill }),
    new IsometricRectangle({ ...common, id: `${name}-side`, planeView: PlaneView.SIDE, right, left: left + depth, top, width, height, fillColor: sideFill }),
  );
}
