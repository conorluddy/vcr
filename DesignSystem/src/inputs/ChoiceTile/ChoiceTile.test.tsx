import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ChoiceTile } from "./ChoiceTile";

test("is a pressed toggle when selected and keeps the swatch out of its name", () => {
  render(<ChoiceTile label="Dark wood" swatchColor="#5a3b26" isSelected />);
  expect(screen.getByRole("button", { name: "Dark wood", pressed: true })).toBeDefined();
});
