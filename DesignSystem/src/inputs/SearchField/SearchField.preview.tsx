// @dsCard height=132
import { SearchField } from "../../index";
import { renderPreview } from "../../preview/renderPreview";

renderPreview(
  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 360 }}>
    <SearchField
      label="Find a variant or round"
      prefix="FIND"
      placeholder="Variant, round, mark…"
      shortcutHint="/"
    />
    <SearchField
      label="Find a variant or round"
      prefix="FIND"
      placeholder="Variant, round, mark…"
      size="mobile"
    />
  </div>,
);
