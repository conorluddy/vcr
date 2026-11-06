// Runs inside Chromium via page.evaluate, so it must be self-contained: no imports, no closures
// over module scope, and nothing returned but plain JSON.
import type { PageMeasurement, Rectangle } from "./lint.types.js";

// === PUBLIC API ===

/** Measures the page as it is now (after a seek has settled). See PageMeasurement for each field. */
export function measurePage(input: { overflowTolerancePx: number }): PageMeasurement {
  const NON_LAYOUT_TAGS = new Set(["SCRIPT", "STYLE", "TEMPLATE", "LINK", "META", "NOSCRIPT"]);
  const isShown = (element: Element): boolean => element.checkVisibility({ opacityProperty: true, visibilityProperty: true });

  /** A short CSS path: up to four steps, stopping at the nearest id. */
  const selectorOf = (element: Element): string => {
    const parts: string[] = [];
    for (let node: Element | null = element; node && node !== document.body && parts.length < 4; node = node.parentElement) {
      if (node.id) {
        parts.unshift(`#${CSS.escape(node.id)}`);
        break;
      }
      let part = node.tagName.toLowerCase() + [...node.classList].slice(0, 2).map((name) => `.${CSS.escape(name)}`).join("");
      const sameTag = node.parentElement ? [...node.parentElement.children].filter((sibling) => sibling.tagName === node!.tagName) : [];
      if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(node) + 1})`;
      parts.unshift(part);
    }
    return parts.join(" > ") || element.tagName.toLowerCase();
  };

  const root = [...document.body.children].find((child) => !NON_LAYOUT_TAGS.has(child.tagName)) ?? null;
  const zeroHeightRoot = root && root.getBoundingClientRect().height === 0 ? selectorOf(root) : null;

  // html and body are the frame itself; text leaving them is reported as out-of-frame instead.
  const overflowing = new Set<Element>();
  const overflows: PageMeasurement["overflows"] = [];
  for (const element of document.body.querySelectorAll("*")) {
    if (NON_LAYOUT_TAGS.has(element.tagName) || !isShown(element)) continue;
    const style = getComputedStyle(element);
    if (style.overflowX !== "visible" && element.scrollWidth > element.clientWidth + input.overflowTolerancePx) {
      overflows.push({ selector: selectorOf(element), axis: "x", scrollSize: element.scrollWidth, clientSize: element.clientWidth });
      overflowing.add(element);
    }
    if (style.overflowY !== "visible" && element.scrollHeight > element.clientHeight + input.overflowTolerancePx) {
      overflows.push({ selector: selectorOf(element), axis: "y", scrollSize: element.scrollHeight, clientSize: element.clientHeight });
      overflowing.add(element);
    }
  }

  // Range.getClientRects() gives the boxes of the glyphs actually laid out (KB §14), after transforms.
  const texts: PageMeasurement["texts"] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || NON_LAYOUT_TAGS.has(parent.tagName) || !node.textContent?.trim() || !isShown(parent)) continue;
    let isInsideOverflow = false;
    for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) if (overflowing.has(ancestor)) isInsideOverflow = true;
    if (isInsideOverflow) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const boxes = [...range.getClientRects()].filter((box) => box.width > 0 && box.height > 0);
    if (boxes.length === 0) continue;
    const rect: Rectangle = {
      left: Math.min(...boxes.map((box) => box.left)),
      top: Math.min(...boxes.map((box) => box.top)),
      right: Math.max(...boxes.map((box) => box.right)),
      bottom: Math.max(...boxes.map((box) => box.bottom)),
    };
    texts.push({ selector: selectorOf(parent), text: node.textContent, rect });
  }

  const scene = (window as unknown as { __scene?: { textBounds?: () => unknown } }).__scene;
  let sceneTextBounds: PageMeasurement["sceneTextBounds"] = null;
  let textBoundsError: string | null = null;
  if (typeof scene?.textBounds === "function") {
    const reported = scene.textBounds();
    const isBound = (value: unknown): value is { x: number; y: number; width: number; height: number; label?: unknown } =>
      typeof value === "object" && value !== null && ["x", "y", "width", "height"].every((key) => Number.isFinite((value as Record<string, unknown>)[key]));
    if (Array.isArray(reported) && reported.every(isBound)) {
      sceneTextBounds = reported.map((bound, index) => ({ label: typeof bound.label === "string" ? bound.label : String(index), rect: { left: bound.x, top: bound.y, right: bound.x + bound.width, bottom: bound.y + bound.height } }));
    } else textBoundsError = "window.__scene.textBounds() must return an array of { x, y, width, height, label? } in CSS pixels";
  }

  return { zeroHeightRoot, overflows, texts, hasCanvas: document.querySelector("canvas") !== null, sceneTextBounds, textBoundsError };
}
