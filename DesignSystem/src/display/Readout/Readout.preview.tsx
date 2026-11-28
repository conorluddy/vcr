// @dsCard height=80
import { Readout } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={24}>
    <Readout label="SIZE" value="1080 × 1350 PX" />
    <Readout label="ROUND" value="R4" />
    <Readout label="MARKS" value="—" />
    <Readout label="VARIANTS" value="20" size="mobile" />
  </PreviewRow>,
);
