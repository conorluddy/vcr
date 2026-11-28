import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CropThumb } from "./CropThumb";

describe("CropThumb", () => {
  test("shows the placeholder label when there is no image", () => {
    render(<CropThumb label="HEADLINE" />);
    expect(screen.getByText("HEADLINE")).toBeDefined();
  });

  test("shows the crop image with its text alternative", () => {
    render(<CropThumb src="crop.png" alt="Headline crop" label="HEADLINE" />);
    expect(screen.getByRole("img", { name: "Headline crop" })).toBeDefined();
    expect(screen.queryByText("HEADLINE")).toBeNull();
  });
});
