import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  test("is named by its label and described by its unit", () => {
    render(<Field label="Width" unit="PX" defaultValue="1080" />);
    const input = screen.getByRole("textbox", { name: "Width" }) as HTMLInputElement;
    expect(input.value).toBe("1080");
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByText("PX").id);
  });

  test("reports the new value and still calls a plain onChange", () => {
    const handleValueChange = vi.fn();
    const handleChange = vi.fn();
    render(
      <Field label="Height" defaultValue="" onChange={handleChange} onValueChange={handleValueChange} />,
    );
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "1350" } });
    expect(handleValueChange).toHaveBeenCalledWith("1350");
    expect(handleChange).toHaveBeenCalledOnce();
  });

  test("shows an em dash when empty", () => {
    render(<Field label="Seed" />);
    expect(screen.getByPlaceholderText("—")).toBeDefined();
  });
});
