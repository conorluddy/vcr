import { describe, expect, test } from "vitest";
import type { Route } from "./route.types";
import { formatRoute, parseRoute } from "./routes";

const EVERY_ROUTE: readonly Route[] = [
  { name: "home" },
  { name: "brief" },
  { name: "sheet", workspaceId: "ws-1", roundId: "r1" },
  { name: "inspect", workspaceId: "ws-1", roundId: "r1", variantId: "V-07" },
  { name: "newRound", workspaceId: "ws-1", roundId: "r1" },
  { name: "export", workspaceId: "ws-1", roundId: "r1", variantId: "V-07" },
  { name: "history", workspaceId: "ws-1" },
  { name: "marked", workspaceId: "ws-1" },
  { name: "categories", workspaceId: "ws-1" },
];

describe("routes", () => {
  test.each(EVERY_ROUTE)("$name survives a round trip through its address", (route) => {
    expect(parseRoute(formatRoute(route))).toEqual(route);
  });

  test("a variant opened directly carries its way back to the contact sheet", () => {
    expect(parseRoute("/w/ws-1/r/r1/v/V-07")).toMatchObject({ workspaceId: "ws-1", roundId: "r1" });
  });

  test("an unknown address is kept, not dropped", () => {
    expect(parseRoute("/w/ws-1/nowhere")).toEqual({ name: "notFound", path: "/w/ws-1/nowhere" });
  });

  test("IDs with reserved characters are encoded and decoded", () => {
    const route: Route = { name: "history", workspaceId: "poster / winter" };
    expect(formatRoute(route)).toBe("/w/poster%20%2F%20winter/history");
    expect(parseRoute(formatRoute(route))).toEqual(route);
  });
});
