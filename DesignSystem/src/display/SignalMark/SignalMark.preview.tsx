// @dsCard height=64
import { SignalMark } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={18}>
    <SignalMark />
    <SignalMark tone="amber" />
    <SignalMark tone="phosphor" />
    <SignalMark shape="diamond" />
    <SignalMark shape="diamond-outline" />
  </PreviewRow>,
);
