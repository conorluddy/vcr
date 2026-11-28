import type { Route } from "./route.types";

// === PUBLIC API ===

/** Reads a URL path into a route; anything unrecognised becomes `notFound` with the path kept. */
export function parseRoute(path: string): Route {
  const segments = path.split("/").filter(Boolean).map(decodeURIComponent);
  for (const pattern of ROUTE_PATTERNS) {
    const route = pattern.match(segments);
    if (route) {
      return route;
    }
  }
  return { name: "notFound", path };
}

/** Writes a route as a URL path. `parseRoute(formatRoute(route))` returns an equal route. */
export function formatRoute(route: Route): string {
  switch (route.name) {
    case "home":
      return "/";
    case "brief":
      return "/new";
    case "sheet":
      return joinPath("w", route.workspaceId, "r", route.roundId);
    case "inspect":
      return joinPath("w", route.workspaceId, "r", route.roundId, "v", route.variantId);
    case "newRound":
      return joinPath("w", route.workspaceId, "r", route.roundId, "next");
    case "export":
      return joinPath("w", route.workspaceId, "r", route.roundId, "v", route.variantId, "export");
    case "history":
      return joinPath("w", route.workspaceId, "history");
    case "marked":
      return joinPath("w", route.workspaceId, "marked");
    case "categories":
      return joinPath("w", route.workspaceId, "settings", "categories");
    case "notFound":
      return route.path;
  }
}

// === PRIVATE HELPERS ===

type RoutePattern = { match: (segments: readonly string[]) => Route | undefined };

/** One pattern per route; `:name` captures a segment. */
function pattern(template: string, build: (params: Readonly<Record<string, string>>) => Route): RoutePattern {
  const parts = template.split("/").filter(Boolean);
  return {
    match(segments) {
      if (segments.length !== parts.length) {
        return undefined;
      }
      const params: Record<string, string> = {};
      for (const [index, part] of parts.entries()) {
        const segment = segments[index] ?? "";
        if (part.startsWith(":")) {
          params[part.slice(1)] = segment;
        } else if (part !== segment) {
          return undefined;
        }
      }
      return build(params);
    },
  };
}

const ROUTE_PATTERNS: readonly RoutePattern[] = [
  pattern("/", () => ({ name: "home" })),
  pattern("/new", () => ({ name: "brief" })),
  pattern("/w/:w/r/:r", (p) => ({ name: "sheet", workspaceId: required(p.w), roundId: required(p.r) })),
  pattern("/w/:w/r/:r/next", (p) => ({
    name: "newRound",
    workspaceId: required(p.w),
    roundId: required(p.r),
  })),
  pattern("/w/:w/r/:r/v/:v", (p) => ({
    name: "inspect",
    workspaceId: required(p.w),
    roundId: required(p.r),
    variantId: required(p.v),
  })),
  pattern("/w/:w/r/:r/v/:v/export", (p) => ({
    name: "export",
    workspaceId: required(p.w),
    roundId: required(p.r),
    variantId: required(p.v),
  })),
  pattern("/w/:w/history", (p) => ({ name: "history", workspaceId: required(p.w) })),
  pattern("/w/:w/marked", (p) => ({ name: "marked", workspaceId: required(p.w) })),
  pattern("/w/:w/settings/categories", (p) => ({ name: "categories", workspaceId: required(p.w) })),
];

function required(value: string | undefined): string {
  if (value === undefined) {
    throw new Error("routes: a pattern captured no value for one of its parameters.");
  }
  return value;
}

function joinPath(...segments: readonly string[]): string {
  return `/${segments.map(encodeURIComponent).join("/")}`;
}
