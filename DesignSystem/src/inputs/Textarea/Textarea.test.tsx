import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  test("is named by its label and described by its hint", () => {
    render(<Textarea label="Brief" hint="Saved as you go." value="" />);
    const field = screen.getByRole("textbox", { name: "Brief" });
    expect(field.getAttribute("aria-describedby")).toBe(screen.getByText("Saved as you go.").id);
  });

  test("counts characters against the limit with zero padding", () => {
    render(<Textarea label="Note" value="Warmer" maxLength={600} />);
    expect(screen.getByText("006 / 600")).toBeDefined();
  });

  test("reports the new text", () => {
    const handleValueChange = vi.fn();
    render(<Textarea label="Note" value="" onValueChange={handleValueChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "More air" } });
    expect(handleValueChange).toHaveBeenCalledWith("More air");
  });
});
