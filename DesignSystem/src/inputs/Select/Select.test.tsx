import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  test("shows the value and its position", () => {
    render(<Select options={["Auto", "Fixed", "Off"]} value="Fixed" />);
    expect(screen.getByRole("button").textContent).toBe("Fixed02/03");
  });

  test("wraps from the last option to the first", () => {
    const handleValueChange = vi.fn();
    render(<Select options={["Auto", "Fixed"]} value="Fixed" onValueChange={handleValueChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleValueChange).toHaveBeenCalledWith("Auto");
  });
});
