// @dsCard height=64
import { Tag } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={8}>
    <Tag variant="solid">FIXED</Tag>
    <Tag>REFERENCE</Tag>
    <Tag variant="muted">DRAFT</Tag>
    <Tag variant="solid">A</Tag>
    <Tag variant="solid">PNG</Tag>
  </PreviewRow>,
);
