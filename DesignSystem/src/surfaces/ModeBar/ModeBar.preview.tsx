// @dsCard height=104
import { ModeBar } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow background="var(--vcr-placeholder)">
    <div style={{ width: 360 }}>
      <ModeBar title="MARK" />
    </div>
  </PreviewRow>,
);
