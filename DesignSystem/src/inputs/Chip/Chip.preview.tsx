// @dsCard height=72
import { Chip } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={6}>
    <Chip>10</Chip>
    <Chip isSelected>20</Chip>
    <Chip>40</Chip>
  </PreviewRow>,
);
