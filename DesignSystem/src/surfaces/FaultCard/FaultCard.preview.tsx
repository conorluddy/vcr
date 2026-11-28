// @dsCard height=290
import { FaultCard } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";

renderPreview(
  <PreviewRow gapPx={18}>
    <div style={{ width: 340 }}>
      <FaultCard
        code="E-112 · SAVE FAILED"
        metric="3 OF 20"
        primaryLabel="RETRY SAVE"
        secondaryLabels={["DISCARD", "KEEP AS IS"]}
      >
        Three variants did not save. Marks on them are kept on this device.
      </FaultCard>
    </div>
    <div style={{ width: 300 }}>
      <FaultCard code="E-204 · EXPORT FAILED" primaryLabel="TRY AGAIN" size="desktop" />
    </div>
  </PreviewRow>,
);
