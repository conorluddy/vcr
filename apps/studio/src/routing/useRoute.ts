import { useCallback, useEffect, useState } from "react";
import type { Route } from "./route.types";
import { formatRoute, parseRoute } from "./routes";

// === PUBLIC API ===

export type Navigate = (route: Route, options?: { replace?: boolean }) => void;

/** The current route from the address bar, and a way to move to another. Back and forward work. */
export function useRoute(): { route: Route; navigate: Navigate } {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback<Navigate>((nextRoute, options) => {
    const path = formatRoute(nextRoute);
    if (options?.replace) {
      window.history.replaceState(null, "", path);
    } else {
      window.history.pushState(null, "", path);
    }
    setRoute(nextRoute);
  }, []);

  return { route, navigate };
}
