// @dsCard height=118
import { ChoiceGrid } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 312 }}>
    <ChoiceGrid aria-label="Aspect" options={["Square", "Portrait", "Landscape"]} value="Portrait" />
    <ChoiceGrid
      aria-label="Palette"
      options={["Warm", "Cool", "Neutral"]}
      swatchColors={["#c8703a", "#3a6fc8", "#8d9094"]}
      value="Cool"
    />
  </div>,
);
