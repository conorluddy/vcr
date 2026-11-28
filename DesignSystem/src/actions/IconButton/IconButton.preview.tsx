// @dsCard height=104
import { IconButton } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow background="var(--vcr-placeholder)" gapPx={6}>
    <IconButton glyph="⌖" label="Centre artboard" />
    <IconButton glyph="N" label="Next variant" />
    <IconButton glyph="◫" label="Split view" isActive />
    <IconButton glyph="⇕" label="Reorder" />
  </PreviewRow>,
);
