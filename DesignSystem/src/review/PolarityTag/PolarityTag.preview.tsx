// @dsCard height=64
import { PolarityTag } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={20}>
    <PolarityTag rating={5} />
    <PolarityTag rating={3} />
    <PolarityTag rating={2} />
    <PolarityTag rating={0} />
  </PreviewRow>,
);
