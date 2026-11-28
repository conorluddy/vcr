import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { StatusMessage } from "./StatusMessage";

test("pairs the code with the sentence", () => {
  render(<StatusMessage code="STATUS · OK">Round 4 saved.</StatusMessage>);
  expect(screen.getByText("STATUS · OK").nextElementSibling?.textContent).toBe("Round 4 saved.");
});
