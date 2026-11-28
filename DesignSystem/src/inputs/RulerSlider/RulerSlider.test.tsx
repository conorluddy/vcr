import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { RulerSlider } from "./RulerSlider";

describe("RulerSlider", () => {
  test("is a labelled native slider", () => {
    render(<RulerSlider label="Weight" value={0.85} min={0.1} max={3} step={0.05} />);
    expect(screen.getByRole("slider", { name: "Weight" })).toBeDefined();
  });

  test("shows the value at the requested precision with its unit", () => {
    render(<RulerSlider label="Weight" value={0.85} decimalPlaces={2} unit="PX" max={3} />);
    expect(screen.getByRole("status").textContent).toBe("0.85PX");
  });

  test("reports a number, not a string", () => {
    const handleValueChange = vi.fn();
    render(<RulerSlider label="Count" value={20} max={40} onValueChange={handleValueChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "25" } });
    expect(handleValueChange).toHaveBeenCalledWith(25);
  });
});
