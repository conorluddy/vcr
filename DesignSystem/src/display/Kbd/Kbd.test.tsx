import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Kbd } from "./Kbd";

test("marks the hint up as keyboard input", () => {
  render(<Kbd>⌘K</Kbd>);
  expect(screen.getByText("⌘K").tagName).toBe("KBD");
});
