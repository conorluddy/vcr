// @dsCard height=84
import { ChoiceTile } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={4}>
    <ChoiceTile label="Square" />
    <ChoiceTile label="Portrait" isSelected />
    <ChoiceTile label="Warm" swatchColor="#c8703a" />
    <ChoiceTile label="Portrait" size="mobile" isSelected />
  </PreviewRow>,
);
