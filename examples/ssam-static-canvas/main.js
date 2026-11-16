import { ssam } from "ssam";

const sketch = ({ wrap, context, width, height }) => {
  wrap.render = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ff0000";
    context.fillRect(0, 0, 16, 16);
    context.fillStyle = "#00ff00";
    context.fillRect(16, 0, 16, 16);
    context.fillStyle = "#0000ff";
    context.fillRect(0, 16, 16, 16);
    context.fillStyle = "#ffffff";
    context.fillRect(16, 16, 16, 16);
    window.__ssamDrawCount = (window.__ssamDrawCount ?? 0) + 1;
  };
};

ssam(sketch, {
  dimensions: [32, 32],
  duration: 1000,
  playFps: 30,
  exportFps: 30,
});
