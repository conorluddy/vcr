import { join } from "node:path";
import type { Plugin } from "esbuild";
import { NAMESPACE, SOURCE_INDEX_PATH } from "./paths";

// === PUBLIC API ===

/**
 * Resolves react, react-dom and react/jsx-runtime to the globals the artifact's preview frame preloads (React 18
 * UMD), so the bundle carries no copy of React. With `withSystemGlobal`, imports of src/index.ts resolve to
 * window.VCRStudio instead, so previews exercise the published bundle rather than a second copy of it.
 */
export function reactGlobalsPlugin({ withSystemGlobal }: { withSystemGlobal: boolean }): Plugin {
  return {
    name: "react-globals",
    setup(build) {
      build.onResolve({ filter: /^react(-dom)?(\/client|\/jsx-runtime)?$/ }, (args) => ({
        path: args.path,
        namespace: "global-shim",
      }));
      if (withSystemGlobal) {
        build.onResolve({ filter: /(^|\/)index$/ }, (args) =>
          join(args.resolveDir, `${args.path}.ts`) === SOURCE_INDEX_PATH
            ? { path: NAMESPACE, namespace: "global-shim" }
            : undefined,
        );
      }
      build.onLoad({ filter: /.*/, namespace: "global-shim" }, (args) => ({
        contents: shimFor(args.path),
        loader: "js",
      }));
    },
  };
}

// === PRIVATE HELPERS ===

const GLOBAL_SHIMS: Readonly<Record<string, string>> = {
  react: "module.exports = window.React;",
  "react-dom": "module.exports = window.ReactDOM;",
  "react-dom/client": "module.exports = window.ReactDOM;",
  "react/jsx-runtime": [
    "var React = window.React;",
    "exports.Fragment = React.Fragment;",
    "function withKey(props, key) {",
    "  return key === undefined ? props : Object.assign({}, props, { key: key });",
    "}",
    "exports.jsx = function (type, props, key) {",
    "  return React.createElement(type, withKey(props, key));",
    "};",
    "// jsxs marks children as a static list; spreading them stops React asking for keys on each.",
    "exports.jsxs = function (type, props, key) {",
    "  var rest = Object.assign({}, props);",
    "  var children = rest.children;",
    "  delete rest.children;",
    "  return React.createElement.apply(null, [type, withKey(rest, key)].concat(children));",
    "};",
  ].join("\n"),
  [NAMESPACE]: `module.exports = window.${NAMESPACE};`,
};

function shimFor(modulePath: string): string {
  const shim = GLOBAL_SHIMS[modulePath];
  if (!shim) {
    throw new Error(`reactGlobalsPlugin: no global shim for "${modulePath}".`);
  }
  return shim;
}
