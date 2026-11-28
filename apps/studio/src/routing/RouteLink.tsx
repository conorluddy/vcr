import type { AnchorHTMLAttributes, MouseEvent } from "react";
import type { Route } from "./route.types";
import { formatRoute } from "./routes";
import type { Navigate } from "./useRoute";

// === PUBLIC API ===

export interface RouteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: Route;
  navigate: Navigate;
}

/** A real link to a route: opens in a new tab as usual, and navigates in place on a plain click. */
export function RouteLink({ to, navigate, onClick, ...anchorAttributes }: RouteLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) {
      return;
    }
    event.preventDefault();
    navigate(to);
  };
  return <a {...anchorAttributes} href={formatRoute(to)} onClick={handleClick} />;
}

// === PRIVATE HELPERS ===

function isModifiedClick(event: MouseEvent): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}
