import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Tag } from "./Tag";

test("exposes its variant as a styling hook", () => {
  render(<Tag variant="muted">DRAFT</Tag>);
  expect(screen.getByText("DRAFT").dataset.variant).toBe("muted");
});
