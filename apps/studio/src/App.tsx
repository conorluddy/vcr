import type { Route } from "./routing/route.types";
import { useRoute } from "./routing/useRoute";
import { PlaceholderScreen } from "./screens/PlaceholderScreen";
import { AppShell } from "./shell/AppShell";
import { useTheme } from "./theme/useTheme";

// === PUBLIC API ===

/** The studio: reads the address, frames the matching screen in the shell. */
export function App() {
  const { route, navigate } = useRoute();
  const { theme, toggleTheme } = useTheme();
  const screen = describeScreen(route);
  return (
    <AppShell title={screen.title} navigate={navigate} theme={theme} onToggleTheme={toggleTheme}>
      <PlaceholderScreen canvasScreen={screen.canvasScreen} prdSection={screen.prdSection} />
    </AppShell>
  );
}

// === PRIVATE HELPERS ===

type ScreenDescription = { title: string; canvasScreen: string; prdSection: string };

/** Which design each route follows. Wave 3 replaces each placeholder with its screen. */
function describeScreen(route: Route): ScreenDescription {
  switch (route.name) {
    case "home":
      return { title: "VCR Studio", canvasScreen: "Home", prdSection: "§1" };
    case "brief":
      return { title: "New exploration", canvasScreen: "01 Brief", prdSection: "§2" };
    case "sheet":
      return { title: route.workspaceId, canvasScreen: "02 Contact sheet", prdSection: "§3" };
    case "inspect":
      return { title: route.variantId, canvasScreen: "03 Inspect and mark", prdSection: "§4–5" };
    case "categories":
      return { title: route.workspaceId, canvasScreen: "05 Category settings", prdSection: "§6" };
    case "marked":
      return { title: route.workspaceId, canvasScreen: "06 Marked details", prdSection: "§7" };
    case "history":
      return { title: route.workspaceId, canvasScreen: "07 Round history", prdSection: "§8" };
    case "newRound":
      return { title: route.workspaceId, canvasScreen: "08 New round", prdSection: "§8" };
    case "export":
      return { title: route.variantId, canvasScreen: "09 Export", prdSection: "§10" };
    case "notFound":
      return { title: "Not found", canvasScreen: `Nothing at ${route.path}`, prdSection: "§1" };
  }
}
