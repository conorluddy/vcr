import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { GlassPanel } from "./GlassPanel";

test("gives a sheet the card shadow unless told otherwise", () => {
  render(<GlassPanel level="sheet">Export</GlassPanel>);
  expect(screen.getByText("Export").dataset).toMatchObject({ level: "sheet", elevation: "card" });
});
