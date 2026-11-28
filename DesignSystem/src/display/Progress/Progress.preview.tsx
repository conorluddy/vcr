// @dsCard height=80
import { Progress } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 312 }}>
    <Progress valuePercent={62} label="Generating round 4" />
    <Progress valuePercent={15} label="Exporting" />
  </div>,
);
