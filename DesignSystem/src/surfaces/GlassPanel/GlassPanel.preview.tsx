// @dsCard height=160
import { GlassPanel } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

const cellStyle = { padding: 14, width: 150, fontSize: 12 };

renderPreview(
  <PreviewRow background="var(--vcr-placeholder)" gapPx={14}>
    <GlassPanel level="bar" style={cellStyle}>
      Bar
    </GlassPanel>
    <GlassPanel level="panel" style={cellStyle}>
      Panel
    </GlassPanel>
    <GlassPanel level="tip" style={cellStyle}>
      Tip
    </GlassPanel>
    <GlassPanel level="sheet" style={cellStyle}>
      Sheet
    </GlassPanel>
  </PreviewRow>,
);
