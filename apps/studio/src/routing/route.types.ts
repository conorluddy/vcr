// === TYPES ===

/**
 * Every place in the studio has an address (PRD §1), so any workspace, round or variant can be restored from a URL.
 * IDs are plain strings here; the domain model brands them.
 */
export type Route =
  | { name: "home" }
  | { name: "brief" }
  | { name: "sheet"; workspaceId: string; roundId: string }
  | { name: "inspect"; workspaceId: string; roundId: string; variantId: string }
  | { name: "newRound"; workspaceId: string; roundId: string }
  | { name: "export"; workspaceId: string; roundId: string; variantId: string }
  | { name: "history"; workspaceId: string }
  | { name: "marked"; workspaceId: string }
  | { name: "categories"; workspaceId: string }
  | { name: "notFound"; path: string };

export type RouteName = Route["name"];
