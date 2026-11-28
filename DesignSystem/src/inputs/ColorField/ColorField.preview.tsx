// @dsCard height=64
import { ColorField } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={24}>
    <ColorField value="#a4a8ac" />
    <ColorField value="#c8703a" />
  </PreviewRow>,
);
