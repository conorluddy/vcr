import { expect, test } from "vitest";
import { joinClassNames } from "./joinClassNames";

test("joins only the class names that are set", () => {
  expect(joinClassNames("button", undefined, false, null, "", "consumer")).toBe("button consumer");
});
