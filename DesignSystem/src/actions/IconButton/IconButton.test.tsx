import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { IconButton } from "./IconButton";

describe("IconButton", () => {
  test("is named by its label, not its glyph", () => {
    render(<IconButton glyph="⌖" label="Centre artboard" />);
    expect(screen.getByRole("button", { name: "Centre artboard" })).toBeDefined();
  });

  test("announces an active tool as pressed", () => {
    render(<IconButton glyph="◫" label="Split view" isActive />);
    expect(screen.getByRole("button", { name: "Split view", pressed: true })).toBeDefined();
  });

  test("sets a single capital letter in mono", () => {
    render(<IconButton glyph="N" label="Next variant" />);
    expect(screen.getByRole("button").dataset.glyphKind).toBe("letter");
  });
});
