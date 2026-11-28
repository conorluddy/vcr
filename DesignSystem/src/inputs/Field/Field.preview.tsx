// @dsCard height=96
import { Field } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: 312 }}>
    <Field label="Width" unit="PX" defaultValue="1080" />
    <Field label="Height" unit="PX" defaultValue="1350" />
  </div>,
);
