import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { StarRating } from "./StarRating";

describe("StarRating", () => {
  test("names the group with its category and current meaning", () => {
    render(<StarRating label="Typography" value={4} />);
    expect(screen.getByRole("group", { name: "Typography: 4 of 5, Like" })).toBeDefined();
  });

  test("reports the chosen star", () => {
    const handleRatingChange = vi.fn();
    render(<StarRating value={0} onRatingChange={handleRatingChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "2 of 5, Dislike" }));
    expect(handleRatingChange).toHaveBeenCalledWith(2);
  });

  test("clears to unrated when the current star is pressed again", () => {
    const handleRatingChange = vi.fn();
    render(<StarRating value={5} onRatingChange={handleRatingChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "5 of 5, Strongest preference" }));
    expect(handleRatingChange).toHaveBeenCalledWith(0);
  });

  test("cannot be changed when read-only", () => {
    render(<StarRating value={3} isReadOnly />);
    expect(
      screen.getAllByRole("radio").every((star) => (star as HTMLInputElement).matches(":disabled")),
    ).toBe(true);
  });

  test("marks the current rating as the checked radio", () => {
    render(<StarRating value={3} />);
    expect((screen.getByRole("radio", { name: "3 of 5, Neutral" }) as HTMLInputElement).checked).toBe(true);
  });
});
