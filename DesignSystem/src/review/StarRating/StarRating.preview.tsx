// @dsCard height=72
import { useState } from "react";
import { PolarityTag, StarRating } from "../../index";
import { PreviewRow, renderPreview } from "../../preview/renderPreview";
import type { Rating } from "../rating.types";

function InteractiveRating() {
  const [rating, setRating] = useState<Rating>(4);
  return (
    <PreviewRow>
      <StarRating label="Typography" value={rating} onRatingChange={setRating} />
      <PolarityTag rating={rating} />
    </PreviewRow>
  );
}

renderPreview(
  <PreviewRow gapPx={28}>
    <InteractiveRating />
    <StarRating label="Colour" value={2} density="list" isReadOnly />
  </PreviewRow>,
);
