import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ModeBar } from "./ModeBar";

test("leaves the mode through CANCEL or DONE", () => {
  const handleCancel = vi.fn();
  const handleDone = vi.fn();
  render(<ModeBar title="MARK" onCancel={handleCancel} onDone={handleDone} />);
  fireEvent.click(screen.getByRole("button", { name: "CANCEL" }));
  fireEvent.click(screen.getByRole("button", { name: "DONE" }));
  expect(handleCancel).toHaveBeenCalledOnce();
  expect(handleDone).toHaveBeenCalledOnce();
});
