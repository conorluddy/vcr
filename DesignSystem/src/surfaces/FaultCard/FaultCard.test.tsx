import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { FaultCard } from "./FaultCard";

describe("FaultCard", () => {
  test("is announced as an alert with its code", () => {
    render(<FaultCard code="E-112 · SAVE FAILED" primaryLabel="RETRY SAVE" />);
    expect(screen.getByRole("alert").textContent).toContain("E-112 · SAVE FAILED");
  });

  test("runs the primary recovery and names the chosen alternative", () => {
    const handlePrimary = vi.fn();
    const handleSecondary = vi.fn();
    render(
      <FaultCard
        code="E-112 · SAVE FAILED"
        primaryLabel="RETRY SAVE"
        onPrimaryAction={handlePrimary}
        secondaryLabels={["DISCARD", "KEEP AS IS"]}
        onSecondaryAction={handleSecondary}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "RETRY SAVE" }));
    fireEvent.click(screen.getByRole("button", { name: "KEEP AS IS" }));
    expect(handlePrimary).toHaveBeenCalledOnce();
    expect(handleSecondary).toHaveBeenCalledWith("KEEP AS IS");
  });
});
