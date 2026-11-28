// @dsCard height=196
import { Textarea } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ width: 340 }}>
    <Textarea
      label="Brief"
      rows={3}
      maxLength={600}
      value="A launch poster for a spring reading series. Quiet, typographic, lots of air."
      hint="Saved as you go. Not sent to a round until selected."
    />
  </div>,
);
