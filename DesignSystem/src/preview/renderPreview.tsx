import type { CSSProperties, ReactNode } from "react";
import { createRoot } from "react-dom/client";

// === TYPES ===

interface PreviewRowProps {
  children: ReactNode;
  /** Ground the row sits on, for components shown over artwork, e.g. "var(--vcr-placeholder)". */
  background?: string | undefined;
  gapPx?: number | undefined;
}

// === PUBLIC API ===

/** Mounts a component preview into the #root element the preview frame provides. */
export function renderPreview(content: ReactNode): void {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('renderPreview: no #root element; the preview HTML must contain <div id="root">.');
  }
  createRoot(rootElement).render(<div style={stageStyle}>{content}</div>);
}

/** One horizontal row of states in a preview. */
export function PreviewRow({ children, background, gapPx = 12 }: PreviewRowProps) {
  const style: CSSProperties = {
    ...rowStyle,
    gap: gapPx,
    ...(background ? { background, padding: 10 } : {}),
  };
  return <div style={style}>{children}</div>;
}

// === PRIVATE HELPERS ===

const stageStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 16, padding: "18px 22px" };
const rowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", alignItems: "center" };
