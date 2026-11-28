// @dsCard height=210
import { useState } from "react";
import { JudgmentRow } from "../../index";
import { renderPreview } from "../../preview/renderPreview";
import type { Rating } from "../rating.types";

function JudgmentList() {
  const [typographyRating, setTypographyRating] = useState<Rating>(5);
  return (
    <div style={{ width: 372, border: "1px solid var(--vcr-line-panel)", borderRadius: 3 }}>
      <JudgmentRow
        category="Typography"
        rating={typographyRating}
        onRatingChange={setTypographyRating}
        note="The letterforms. Light weight at this scale."
      />
      <JudgmentRow category="Colour" rating={1} isActive onClear={() => undefined} />
      <JudgmentRow category="Spacing" rating={3} />
      <JudgmentRow category="Layout" />
    </div>
  );
}

renderPreview(<JudgmentList />);
