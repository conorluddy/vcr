// @dsCard height=72
import { Switch } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow>
    <Switch label="Show marks" isOn />
    <Switch label="Show IDs" isOn={false} />
    <Switch label="Show marks" isOn size="mobile" />
  </PreviewRow>,
);
