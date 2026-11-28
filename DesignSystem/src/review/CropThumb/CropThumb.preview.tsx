// @dsCard height=184
import { CropThumb } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <>
    <PreviewRow>
      <CropThumb label="HEADLINE" />
      <CropThumb isHatched />
      <CropThumb label="LOGO" widthPx={32} />
    </PreviewRow>
    <div style={{ width: 312 }}>
      <CropThumb label="HEADLINE" isPadded heightPx={74} />
    </div>
  </>,
);
