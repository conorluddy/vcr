import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { VariantTile } from "./VariantTile";

describe("VariantTile", () => {
  test("opens a finished variant from the keyboard-reachable frame", () => {
    const handleOpen = vi.fn();
    render(<VariantTile variantId="V-07" markCount={2} onOpen={handleOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Open V-07" }));
    expect(handleOpen).toHaveBeenCalledOnce();
  });

  test("states the mark count in words for screen readers", () => {
    render(<VariantTile variantId="V-07" markCount={2} />);
    expect(screen.getByText(/marks/).textContent).toBe(" marks");
  });

  test("offers a retry when generation failed, and nothing to open", () => {
    const handleRetry = vi.fn();
    render(<VariantTile variantId="V-11" state="failed" onRetry={handleRetry} />);
    expect(screen.queryByRole("button", { name: "Open V-11" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "RETRY" }));
    expect(handleRetry).toHaveBeenCalledOnce();
  });
});
