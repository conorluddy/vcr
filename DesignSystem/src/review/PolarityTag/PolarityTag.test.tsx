import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { Rating } from "../rating.types";
import { describePolarity } from "./describePolarity";
import { PolarityTag } from "./PolarityTag";

describe("describePolarity", () => {
  test.each<[Rating, string]>([
    [0, "CONTEXT"],
    [1, "AVOID"],
    [2, "AVOID"],
    [3, "NEUTRAL"],
    [4, "DRAW ON"],
    [5, "DRAW ON"],
  ])("rating %i is used as %s", (rating, use) => {
    expect(describePolarity(rating).use).toBe(use);
  });
});

describe("PolarityTag", () => {
  test("states the rating and its use in words", () => {
    render(<PolarityTag rating={5} />);
    expect(screen.getByText("+ 5 · DRAW ON")).toBeDefined();
  });

  test("leaves the use off an unrated region", () => {
    render(<PolarityTag rating={0} />);
    expect(screen.getByText("○ UNRATED")).toBeDefined();
  });
});
