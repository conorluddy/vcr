import { Button } from "@vcr/design-system";
import type { ReactNode } from "react";
import { RouteLink } from "../routing/RouteLink";
import type { Navigate } from "../routing/useRoute";
import type { Theme } from "../theme/useTheme";
import styles from "./AppShell.module.css";

// === PUBLIC API ===

export interface AppShellProps {
  title: string;
  navigate: Navigate;
  theme: Theme;
  onToggleTheme: () => void;
  /** Right-hand top-bar actions for the current screen. */
  actions?: ReactNode;
  children: ReactNode;
}

/** The frame every screen sits in: the glass top bar (home, title, actions, theme) and the screen below it. */
export function AppShell({ title, navigate, theme, onToggleTheme, actions, children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <RouteLink className={styles.homeLink} to={{ name: "home" }} navigate={navigate}>
          ← HOME
        </RouteLink>
        <span className={styles.divider} aria-hidden="true" />
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.spacer} />
        {actions}
        <Button
          variant="text"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "LIGHT" : "DARK"}
        </Button>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
