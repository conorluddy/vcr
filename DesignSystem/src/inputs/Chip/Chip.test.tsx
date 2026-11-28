import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Chip } from "./Chip";

test("announces the selected value as pressed", () => {
  render(
    <>
      <Chip>20</Chip>
      <Chip isSelected>25</Chip>
    </>,
  );
  expect(screen.getByRole("button", { name: "25", pressed: true })).toBeDefined();
  expect(screen.getByRole("button", { name: "20", pressed: false })).toBeDefined();
});
