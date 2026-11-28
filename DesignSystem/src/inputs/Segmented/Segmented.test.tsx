import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Segmented } from "./Segmented";

test("marks the selected segment and reports a new value", () => {
  const handleValueChange = vi.fn();
  render(
    <Segmented
      aria-label="Format"
      options={["PNG", { value: "jpg", label: "JPG" }]}
      value="PNG"
      onValueChange={handleValueChange}
    />,
  );
  expect(screen.getByRole("button", { name: "PNG", pressed: true })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "JPG" }));
  expect(handleValueChange).toHaveBeenCalledWith("jpg");
});
