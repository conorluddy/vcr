import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ChoiceGrid } from "./ChoiceGrid";

test("selects one option and reports a new choice", () => {
  const handleValueChange = vi.fn();
  render(
    <ChoiceGrid
      aria-label="Aspect"
      options={["Square", "Portrait", "Landscape"]}
      value="Portrait"
      onValueChange={handleValueChange}
    />,
  );
  expect(screen.getByRole("button", { name: "Portrait", pressed: true })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Landscape" }));
  expect(handleValueChange).toHaveBeenCalledWith("Landscape");
});
