import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { SignalMark } from "./SignalMark";

test("is hidden from assistive technology and sized by shape", () => {
  const { container } = render(<SignalMark shape="diamond-outline" />);
  const mark = container.firstElementChild as HTMLElement;
  expect(mark.getAttribute("aria-hidden")).toBe("true");
  expect(mark.style.getPropertyValue("--signal-size")).toBe("8px");
});
