import { useCallback, useEffect, useState } from "react";

// === PUBLIC API ===

export type Theme = "dark" | "light";

/** The studio theme: dark by default (the system's primary theme), remembered in this browser. */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === "dark" ? "light" : "dark")), []);
  return { theme, toggleTheme };
}

// === PRIVATE HELPERS ===

const STORAGE_KEY = "vcr-studio-theme";

function readStoredTheme(): Theme {
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}
