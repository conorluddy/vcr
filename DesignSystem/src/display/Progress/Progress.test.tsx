import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  test("reports its value to assistive technology", () => {
    render(<Progress valuePercent={62} label="Generating round 4" />);
    expect(
      screen.getByRole("progressbar", { name: "Generating round 4" }).getAttribute("aria-valuenow"),
    ).toBe("62");
  });

  test("clamps values outside 0–100", () => {
    render(<Progress valuePercent={140} label="Exporting" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });
});
