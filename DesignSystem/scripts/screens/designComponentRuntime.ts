import type { ComponentType, ReactNode } from "react";

// === PUBLIC API ===

/**
 * A local stand-in for the Design canvas runtime, enough to render the screens in screens/ outside claude.ai.
 * It supports the subset the screens use: `{{ path }}` holes in text and attributes, `<helmet>`,
 * `<x-import component-from-global-scope>` mounting a VCRStudio component, and a `DCLogic` class with
 * `props`, `state` and `setState`. Props come from `data-props` defaults, overridden by the query string
 * (`?theme=light`). Anything else in the format is unsupported and fails loudly.
 */
export function mountDesignComponent(): void {
  const container = document.querySelector("x-dc");
  if (!container) {
    throw new Error("designComponentRuntime: no <x-dc> element on the page.");
  }
  moveHelmetIntoHead(container);
  const templateNodes = Array.from(container.childNodes);
  const logic = createLogic(readProps());
  const host = document.createElement("div");
  host.style.display = "contents";
  container.replaceWith(host);
  const root = window.ReactDOM.createRoot(host);
  const render = () => root.render(renderNodes(templateNodes, logic.renderVals()));
  logic.onChange = render;
  render();
}

// === TYPES ===

type RenderValues = Readonly<Record<string, unknown>>;
type PropDefinitions = Readonly<Record<string, { default?: unknown }>>;

declare global {
  interface Window {
    React: typeof import("react");
    ReactDOM: typeof import("react-dom/client");
    [namespace: string]: unknown;
  }
}

/** The base class a screen's script extends, as the canvas runtime names it. */
class DCLogic {
  state: Record<string, unknown> = {};
  onChange: () => void = () => undefined;
  constructor(readonly props: Readonly<Record<string, unknown>>) {}
  setState(update: Record<string, unknown>): void {
    this.state = { ...this.state, ...update };
    this.onChange();
  }
  renderVals(): RenderValues {
    return {};
  }
}

// === PRIVATE HELPERS ===

const HOLE_PATTERN = /\{\{\s*([A-Za-z_$][\w$.]*)\s*\}\}/g;
const WHOLE_HOLE_PATTERN = /^\{\{\s*([A-Za-z_$][\w$.]*)\s*\}\}$/;
const IMPORT_ONLY_ATTRIBUTES = new Set(["component-from-global-scope", "hint-size"]);
const ATTRIBUTE_RENAMES: Readonly<Record<string, string>> = { class: "className", for: "htmlFor" };

function moveHelmetIntoHead(container: Element): void {
  for (const helmet of Array.from(container.querySelectorAll("helmet"))) {
    document.head.append(...Array.from(helmet.childNodes));
    helmet.remove();
  }
}

function readProps(): Record<string, unknown> {
  const script = document.querySelector<HTMLScriptElement>("script[data-dc-script]");
  const definitions: PropDefinitions = JSON.parse(script?.dataset.props ?? "{}");
  const query = new URLSearchParams(window.location.search);
  const props: Record<string, unknown> = {};
  for (const [name, definition] of Object.entries(definitions)) {
    if (!name.startsWith("$")) {
      props[name] = query.get(name) ?? definition.default;
    }
  }
  return props;
}

function createLogic(props: Record<string, unknown>): DCLogic {
  const script = document.querySelector<HTMLScriptElement>("script[data-dc-script]");
  if (!script?.textContent) {
    return new DCLogic(props);
  }
  const defineComponent = new Function("DCLogic", `${script.textContent}\nreturn Component;`);
  const Component = defineComponent(DCLogic) as new (props: Record<string, unknown>) => DCLogic;
  return new Component(props);
}

function renderNodes(nodes: ReadonlyArray<ChildNode>, values: RenderValues): ReactNode[] {
  return nodes.map((node, index) => renderNode(node, values, index));
}

function renderNode(node: ChildNode, values: RenderValues, key: number): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return interpolate(node.textContent ?? "", values);
  }
  if (!(node instanceof Element)) {
    return null;
  }
  const children = renderNodes(Array.from(node.childNodes), values);
  const isImport = node.localName === "x-import";
  const type = isImport ? resolveComponent(node) : node.localName;
  const props: Record<string, unknown> = { key, ...readAttributes(node, values, isImport) };
  return window.React.createElement(type, props, ...children);
}

function readAttributes(element: Element, values: RenderValues, isImport: boolean): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const { name, value } of Array.from(element.attributes)) {
    if (isImport && IMPORT_ONLY_ATTRIBUTES.has(name)) {
      continue;
    }
    const resolved = resolveAttribute(value, values);
    if (name === "style" && typeof resolved === "string") {
      props.style = parseInlineStyle(resolved);
    } else {
      props[propName(name, isImport)] = resolved;
    }
  }
  return props;
}

function resolveComponent(element: Element): ComponentType {
  const path = element.getAttribute("component-from-global-scope") ?? "";
  const component = lookup(window, path);
  if (typeof component !== "function" && typeof component !== "object") {
    throw new Error(`designComponentRuntime: "${path}" is not on window. Is the VCRStudio bundle loaded?`);
  }
  return component as ComponentType;
}

function propName(attribute: string, isImport: boolean): string {
  if (ATTRIBUTE_RENAMES[attribute]) {
    return ATTRIBUTE_RENAMES[attribute];
  }
  if (!isImport || attribute.startsWith("aria-") || attribute.startsWith("data-")) {
    return attribute;
  }
  return attribute.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function resolveAttribute(value: string, values: RenderValues): unknown {
  const whole = WHOLE_HOLE_PATTERN.exec(value);
  return whole?.[1] ? lookup(values, whole[1]) : interpolate(value, values);
}

function interpolate(text: string, values: RenderValues): string {
  return text.replace(HOLE_PATTERN, (_match, path: string) => String(lookup(values, path) ?? ""));
}

function lookup(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((value, segment) => (value as Record<string, unknown> | undefined)?.[segment], source);
}

function parseInlineStyle(style: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  for (const declaration of style.split(/;(?![^(]*\))/)) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex > 0) {
      const property = declaration.slice(0, colonIndex).trim();
      const name = property.startsWith("--")
        ? property
        : property.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
      declarations[name] = declaration.slice(colonIndex + 1).trim();
    }
  }
  return declarations;
}

// The script loads first in <head>, before the body and the VCRStudio bundle.
document.addEventListener("DOMContentLoaded", mountDesignComponent);
