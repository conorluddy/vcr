import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { RegionOutline } from "./RegionOutline";

describe("RegionOutline", () => {
  test("is placed in artboard pixels", () => {
    const { container } = render(
      <RegionOutline xPx={30} yPx={34} widthPx={312} heightPx={132} label="M-01" />,
    );
    const outline = container.firstElementChild as HTMLElement;
    expect(outline.style.getPropertyValue("--region-x")).toBe("30px");
    expect(outline.style.getPropertyValue("--region-height")).toBe("132px");
  });

  test("shows a resize handle only while drawing or selected", () => {
    const { container, rerender } = render(<RegionOutline xPx={0} yPx={0} widthPx={10} heightPx={10} />);
    expect(container.querySelector("[aria-hidden]")).toBeNull();
    rerender(<RegionOutline xPx={0} yPx={0} widthPx={10} heightPx={10} state="drawing" />);
    expect(container.querySelector("[aria-hidden]")).not.toBeNull();
  });
});
