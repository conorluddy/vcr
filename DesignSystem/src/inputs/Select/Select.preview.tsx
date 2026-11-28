// @dsCard height=64
import { Select } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow>
    <Select options={["Auto", "Fixed", "Off"]} value="Auto" />
    <Select options={["1080 × 1350", "1080 × 1080", "1920 × 1080"]} value="1080 × 1080" />
  </PreviewRow>,
);
