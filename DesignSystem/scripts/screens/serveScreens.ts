import { readFileSync } from "node:fs";
import { createServer, type ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { dirname, extname, join, normalize } from "node:path";
import { build } from "esbuild";
import { PACKAGE_ROOT, PROJECT_ROOT } from "../build/paths";

// === PUBLIC API ===

/**
 * Serves the screens in screens/ against the built design system, laid out as the canvas serves them:
 * screens at the root, the system under ds/vcrstudio/. The page's support.js is replaced by a local runtime,
 * and React 18 UMD is injected ahead of it. Run `pnpm build` first (`pnpm screens` does both).
 */
export async function serveScreens(portNumber: number): Promise<void> {
  const runtimeScript = await bundleRuntime();
  const server = createServer((request, response) => {
    const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    try {
      const { contentType, body } = routeRequest(path, runtimeScript);
      respond(response, 200, contentType, body);
    } catch (error) {
      respond(response, 404, "text/plain", `Not found: ${path}\n${String(error)}`);
    }
  });
  server.listen(portNumber, () => {
    console.log(JSON.stringify({ event: "screens.serving", url: `http://localhost:${portNumber}/` }));
  });
}

// === PRIVATE HELPERS ===

const SCREENS_ROOT = `${PACKAGE_ROOT}screens/`;
const SYSTEM_PREFIX = "/ds/vcrstudio/";
const SUPPORT_SCRIPT_LINE = '<script src="./support.js"></script>';
const REACT_SCRIPTS = '<script src="/vendor/react.js"></script><script src="/vendor/react-dom.js"></script>';
const CONTENT_TYPES: Readonly<Record<string, string>> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
};
const htmlType = "text/html; charset=utf-8";
const scriptType = "text/javascript; charset=utf-8";
const requireFromPackage = createRequire(PACKAGE_ROOT);
const VENDOR_FILES: Readonly<Record<string, string>> = {
  "/vendor/react.js": packageFile("react", "umd/react.development.js"),
  "/vendor/react-dom.js": packageFile("react-dom", "umd/react-dom.development.js"),
};

type Reply = { contentType: string; body: string | Buffer };

/** React's exports map hides umd/, so resolve the package root and join from there. */
function packageFile(packageName: string, relativePath: string): string {
  return join(dirname(requireFromPackage.resolve(`${packageName}/package.json`)), relativePath);
}

function routeRequest(path: string, runtimeScript: string): Reply {
  if (path === "/") {
    return { contentType: htmlType, body: renderIndexPage() };
  }
  if (path === "/support.js") {
    return { contentType: scriptType, body: runtimeScript };
  }
  const vendorFile = VENDOR_FILES[path];
  if (vendorFile) {
    return { contentType: scriptType, body: readFileSync(vendorFile) };
  }
  if (path.startsWith(SYSTEM_PREFIX)) {
    return readStaticFile(PROJECT_ROOT, path.slice(SYSTEM_PREFIX.length));
  }
  if (path.endsWith(".dc.html")) {
    const screen = readFileSync(insideRoot(SCREENS_ROOT, path), "utf8");
    return { contentType: htmlType, body: injectReact(screen) };
  }
  return readStaticFile(SCREENS_ROOT, path);
}

function readStaticFile(root: string, relativePath: string): Reply {
  const filePath = insideRoot(root, relativePath);
  return {
    contentType: CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream",
    body: readFileSync(filePath),
  };
}

function insideRoot(root: string, relativePath: string): string {
  const filePath = normalize(join(root, relativePath));
  if (!filePath.startsWith(root)) {
    throw new Error(`"${relativePath}" is outside ${root}`);
  }
  return filePath;
}

function injectReact(screen: string): string {
  if (!screen.includes(SUPPORT_SCRIPT_LINE)) {
    throw new Error(`screen is missing the line ${SUPPORT_SCRIPT_LINE}`);
  }
  return screen.replace(SUPPORT_SCRIPT_LINE, `${REACT_SCRIPTS}${SUPPORT_SCRIPT_LINE}`);
}

function renderIndexPage(): string {
  const canvas: CanvasIndex = JSON.parse(readFileSync(`${SCREENS_ROOT}canvas.json`, "utf8"));
  const rows = canvas.order.map((file) => {
    const title = canvas.boards[file]?.title ?? file;
    return `<li><a href="/${file}">${title}</a> · <a href="/${file}?theme=light">light</a></li>`;
  });
  return `<!doctype html><meta charset="utf-8"><title>${canvas.title}</title><body style="font:14px system-ui;padding:24px"><h1>${canvas.title}</h1><ol style="list-style:none;padding:0;line-height:2">${rows.join("")}</ol></body>`;
}

type CanvasIndex = {
  title: string;
  order: ReadonlyArray<string>;
  boards: Readonly<Record<string, { title?: string }>>;
};

async function bundleRuntime(): Promise<string> {
  const result = await build({
    entryPoints: [`${PACKAGE_ROOT}scripts/screens/designComponentRuntime.ts`],
    bundle: true,
    format: "iife",
    write: false,
    target: "es2022",
  });
  return result.outputFiles.map((file) => file.text).join("\n");
}

function respond(response: ServerResponse, status: number, contentType: string, body: string | Buffer): void {
  response.writeHead(status, { "content-type": contentType, "cache-control": "no-store" });
  response.end(body);
}

const portNumber = Number.parseInt(process.env.PORT ?? "4321", 10);
await serveScreens(portNumber);
