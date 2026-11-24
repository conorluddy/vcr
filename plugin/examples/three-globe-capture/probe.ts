import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { openScenePage } from "@vcr/capture";

// Reads the WebGL renderer string from the same Chromium and scene the capture uses, so the README can cite it.
const here = dirname(fileURLToPath(import.meta.url));
const opened = await openScenePage({ sceneFile: join(here, "scene.html"), width: 1280, height: 720 });
try {
  const rendererString = await opened.page.evaluate(`(() => {
    const canvas = document.querySelector("canvas");
    const context = canvas && (canvas.getContext("webgl2") || canvas.getContext("webgl"));
    const extension = context && context.getExtension("WEBGL_debug_renderer_info");
    return extension ? context.getParameter(extension.UNMASKED_RENDERER_WEBGL) : "unavailable";
  })()`);
  console.log(JSON.stringify({ renderer: rendererString, userAgent: await opened.page.evaluate("navigator.userAgent") }));
} finally {
  await opened.close();
}
