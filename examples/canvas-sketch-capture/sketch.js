import canvasSketch from 'canvas-sketch';

const settings = {
  dimensions: [64, 48],
  units: 'px',
  pixelRatio: 1,
  scaleToFit: false,
  canvas: document.querySelector('#sketch-canvas'),
  context: '2d',
  animate: false,
  hotkeys: false
};

const sketch = () => ({ context }) => {
  context.clearRect(0, 0, 64, 48);
  context.fillStyle = 'rgb(255, 64, 32)';
  context.fillRect(8, 10, 16, 12);
};

window.startCanvasSketch = async () => {
  const manager = await canvasSketch(sketch, settings);
  manager.render();
  return {
    width: manager.props.canvasWidth,
    height: manager.props.canvasHeight,
    canvas: manager.props.canvas
  };
};
