import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Checkbox } from "./Checkbox";

test("is a real checkbox that reports the new state", () => {
  const handleCheckedChange = vi.fn();
  render(<Checkbox aria-label="Include in round" isChecked={false} onCheckedChange={handleCheckedChange} />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Include in round" }));
  expect(handleCheckedChange).toHaveBeenCalledWith(true);
});
