// Built by the design system (`pnpm build:system`, which dev and build run first).
import "@vcr/design-system/tokens.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('main: index.html has no element with id "root".');
}
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
