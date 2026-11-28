import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { GroupHeader } from "./GroupHeader";

test("shows the title and the section code", () => {
  render(<GroupHeader title="Typography appearance" code="CONT.02" />);
  expect(screen.getByText("Typography appearance")).toBeDefined();
  expect(screen.getByText("CONT.02")).toBeDefined();
});
