import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ColorField } from "./ColorField";

test("shows the hex value in caps", () => {
  render(<ColorField value="#a4a8ac" />);
  expect(screen.getByText("#A4A8AC")).toBeDefined();
});
