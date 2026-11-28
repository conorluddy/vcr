// @dsCard height=150
import { StatusMessage } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 340 }}>
    <StatusMessage code="STATUS · OK">Round 4 saved. 20 variants ready to review.</StatusMessage>
    <StatusMessage code="E-112 · SAVE FAILED" markShape="diamond-outline">
      Marks are kept on this device until the next save.
    </StatusMessage>
  </div>,
);
