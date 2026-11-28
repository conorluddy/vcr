// @dsCard height=214
import { Button } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <>
    <PreviewRow>
      <Button glyph="↗">EXPORT</Button>
      <Button glyph="→">GENERATE 20</Button>
      <Button variant="secondary">RESET CROP</Button>
      <Button variant="text">CANCEL</Button>
      <Button disabled>NEW ROUND WITH 0</Button>
    </PreviewRow>
    <PreviewRow background="var(--vcr-placeholder)" gapPx={6}>
      <Button variant="glass">COPY STYLE LINK</Button>
      <Button variant="glass" glyph="↓">
        DOWNLOAD PNG
      </Button>
    </PreviewRow>
    <PreviewRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: 420 }}>
        <Button size="mobile" isFullWidth glyph="→">
          GENERATE 20
        </Button>
        <Button variant="secondary" size="mobile" isFullWidth>
          KEEP AS IS
        </Button>
      </div>
    </PreviewRow>
  </>,
);
