import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Select } from "./Select";

describe("Select", () => {
  test("shows the value and its position", () => {
    render(<Select label="Mode" options={["Auto", "Fixed", "Off"]} value="Fixed" />);
    expect(screen.getByRole("button").textContent).toBe("Fixed02/03");
  });

  test("names itself, its value and its position for screen readers", () => {
    render(<Select label="Mode" options={["Auto", "Fixed", "Off"]} value="Fixed" />);
    expect(screen.getByRole("button", { name: "Mode: Fixed, 2 of 3" })).toBeTruthy();
  });

  test("wraps from the last option to the first", () => {
    const handleValueChange = vi.fn();
    render(
      <Select label="Mode" options={["Auto", "Fixed"]} value="Fixed" onValueChange={handleValueChange} />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleValueChange).toHaveBeenCalledWith("Auto");
  });

  test("refuses a value that is not an option", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Select label="Mode" options={["Auto", "Fixed"]} value="Off" />)).toThrow(
      /"Off" is not one of the options/,
    );
  });
});
