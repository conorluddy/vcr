// @dsCard height=205
import { RulerSlider } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 312 }}>
    <RulerSlider label="Weight" value={0.85} min={0.1} max={3} step={0.05} decimalPlaces={2} unit="PX" />
    <RulerSlider label="Variants" value={20} min={4} max={40} />
    <RulerSlider label="Variants" value={20} min={4} max={40} size="mobile" />
  </div>,
);
