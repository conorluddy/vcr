import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  test("home is a real link that navigates in place", () => {
    const navigate = vi.fn();
    render(
      <AppShell title="Context poster" navigate={navigate} theme="dark" onToggleTheme={() => undefined}>
        content
      </AppShell>,
    );
    const homeLink = screen.getByRole("link", { name: "← HOME" });
    expect(homeLink.getAttribute("href")).toBe("/");
    fireEvent.click(homeLink);
    expect(navigate).toHaveBeenCalledWith({ name: "home" });
  });

  test("names the theme it switches to", () => {
    render(
      <AppShell
        title="Context poster"
        navigate={() => undefined}
        theme="dark"
        onToggleTheme={() => undefined}
      >
        content
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeTruthy();
  });
});
