import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  test("does not submit a surrounding form unless asked to", () => {
    render(<Button>EXPORT</Button>);
    expect(screen.getByRole("button", { name: "EXPORT" }).getAttribute("type")).toBe("button");
  });

  test("keeps the trailing glyph out of the accessible name", () => {
    render(<Button glyph="↗">EXPORT</Button>);
    expect(screen.getByRole("button", { name: "EXPORT" })).toBeDefined();
  });

  test("calls onClick when pressed", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>GENERATE 20</Button>);
    fireEvent.click(screen.getByRole("button", { name: "GENERATE 20" }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  test("exposes variant, size and width as styling hooks", () => {
    render(
      <Button variant="secondary" size="mobile" isFullWidth>
        RESET CROP
      </Button>,
    );
    const button = screen.getByRole("button", { name: "RESET CROP" });
    expect(button.dataset).toMatchObject({ variant: "secondary", size: "mobile", fullWidth: "true" });
  });
});
