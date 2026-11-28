import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Switch } from "./Switch";

test("is a named switch that reports the opposite state", () => {
  const handleToggle = vi.fn();
  render(<Switch label="Show marks" isOn={false} onToggle={handleToggle} />);
  const toggle = screen.getByRole("switch", { name: "Show marks" });
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(toggle);
  expect(handleToggle).toHaveBeenCalledWith(true);
});
