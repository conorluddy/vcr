// @dsCard height=260
import { VariantTile } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 150px)", gap: 12 }}>
    <VariantTile variantId="V-07" markCount={2} isSelected />
    <VariantTile variantId="V-08" />
    <VariantTile variantId="V-16" state="pending" />
    <VariantTile variantId="V-11" state="failed" />
  </div>,
);
