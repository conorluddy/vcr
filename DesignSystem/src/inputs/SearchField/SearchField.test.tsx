import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SearchField } from "./SearchField";

describe("SearchField", () => {
  test("is a named search box that reports what was typed", () => {
    const handleValueChange = vi.fn();
    render(<SearchField label="Find a variant" prefix="FIND" onValueChange={handleValueChange} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Find a variant" }), {
      target: { value: "V-07" },
    });
    expect(handleValueChange).toHaveBeenCalledWith("V-07");
  });

  test("shows the shortcut hint on desktop only", () => {
    const { rerender } = render(<SearchField label="Find" prefix="FIND" shortcutHint="/" />);
    expect(screen.queryByText("/")).not.toBeNull();
    rerender(<SearchField label="Find" prefix="FIND" shortcutHint="/" size="mobile" />);
    expect(screen.queryByText("/")).toBeNull();
  });
});
