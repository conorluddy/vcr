// @dsCard height=64
import { Checkbox } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow>
    <Checkbox aria-label="Include V-07" isChecked />
    <Checkbox aria-label="Include V-11" isChecked={false} />
  </PreviewRow>,
);
