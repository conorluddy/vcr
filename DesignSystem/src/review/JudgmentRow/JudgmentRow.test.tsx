import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { JudgmentRow } from "./JudgmentRow";

describe("JudgmentRow", () => {
  test("rates the region under its category", () => {
    const handleRatingChange = vi.fn();
    render(<JudgmentRow category="Typography" onRatingChange={handleRatingChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "4 of 5, Like" }));
    expect(handleRatingChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole("group", { name: "Typography: Unrated" })).toBeDefined();
  });

  test("shows the note in curly quotes", () => {
    render(<JudgmentRow category="Typography" rating={5} note="The letterforms" />);
    expect(screen.getByText("“The letterforms”")).toBeDefined();
  });

  test("offers CLEAR only on the active, rated row", () => {
    const handleClear = vi.fn();
    const { rerender } = render(<JudgmentRow category="Colour" rating={1} onClear={handleClear} />);
    expect(screen.queryByRole("button", { name: "CLEAR" })).toBeNull();
    rerender(<JudgmentRow category="Colour" rating={1} isActive onClear={handleClear} />);
    fireEvent.click(screen.getByRole("button", { name: "CLEAR" }));
    expect(handleClear).toHaveBeenCalledOnce();
  });
});
