// @dsCard height=150
import { RegionOutline } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div
    style={{
      position: "relative",
      height: 110,
      background: "linear-gradient(90deg, #f2f2f0 50%, #141516 50%)",
    }}
  >
    <RegionOutline xPx={24} yPx={30} widthPx={150} heightPx={50} label="M-01" />
    <RegionOutline
      xPx={200}
      yPx={22}
      widthPx={120}
      heightPx={50}
      label="120 × 50 · DRAWING"
      state="drawing"
    />
    <RegionOutline xPx={380} yPx={30} widthPx={110} heightPx={50} label="M-02" state="selected" />
    <RegionOutline xPx={530} yPx={30} widthPx={110} heightPx={50} label="M-03" state="muted" />
  </div>,
);
