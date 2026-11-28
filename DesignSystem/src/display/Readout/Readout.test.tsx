import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Readout } from "./Readout";

test("shows the label above the value", () => {
  render(<Readout label="SIZE" value="1080 × 1350 PX" />);
  const label = screen.getByText("SIZE");
  expect(label.nextElementSibling?.textContent).toBe("1080 × 1350 PX");
});
