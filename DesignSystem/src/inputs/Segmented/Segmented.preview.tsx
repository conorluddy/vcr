// @dsCard height=160
import { Segmented } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <>
    <PreviewRow background="var(--vcr-placeholder)">
      <Segmented aria-label="View" isGlass options={["SHEET", "INSPECT"]} value="SHEET" />
    </PreviewRow>
    <PreviewRow>
      <Segmented aria-label="Format" options={["PNG", "JPG", "SVG"]} value="PNG" />
      <div style={{ width: 240 }}>
        <Segmented
          aria-label="Format"
          size="mobile"
          isStretched
          options={["PNG", "JPG", "SVG"]}
          value="JPG"
        />
      </div>
    </PreviewRow>
  </>,
);
