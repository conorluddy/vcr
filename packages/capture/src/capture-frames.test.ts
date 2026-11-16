import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ launch: vi.fn(), close: vi.fn(), serverClose: vi.fn(), closeAllConnections: vi.fn() }));
vi.mock("playwright", () => ({ chromium: { launch: mocks.launch } }));
vi.mock("node:http", () => ({ createServer: () => ({
  once: vi.fn(),
  listen: (_port: number, _host: string, ready: () => void) => ready(),
  address: () => ({ port: 12345 }),
  close: mocks.serverClose,
  closeAllConnections: mocks.closeAllConnections,
}) }));
import { captureFrames, openScenePage } from "./capture-frames.js";

let directory: string;
let duration: number;
let seconds: number;
const seeks: number[] = [];
beforeEach(() => {
  vi.resetAllMocks();
  directory = mkdtempSync(join(tmpdir(), "vcr-capture-test-"));
  duration = 1;
  seconds = 0;
  seeks.length = 0;
  mocks.serverClose.mockImplementation((done: () => void) => done());
  mocks.launch.mockResolvedValue({ close: mocks.close, newPage: async () => ({
    context: () => ({ newCDPSession: async () => ({ send: async () => ({}) }) }),
    on: vi.fn(), goto: vi.fn(), waitForFunction: vi.fn(),
    evaluate: async (_fn: unknown, value?: number) => {
      if (value !== undefined) { seconds = value; seeks.push(value); }
      return duration;
    },
    screenshot: async () => Buffer.from(`frame at ${seconds}`),
  }) });
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));
const options = () => ({ sceneUrl: "http://test.invalid", width: 16, height: 16, fps: 3, outputDirectory: directory });

describe("capture output lifecycle", () => {
  test.each([
    { name: "font outside the serving root", event: "response", payload: { status: () => 404, url: () => "http://localhost/shared/font.woff2" }, expected: "HTTP 404 http://localhost/shared/font.woff2" },
    { name: "missing module", event: "response", payload: { status: () => 403, url: () => "http://localhost/shared/module.js" }, expected: "HTTP 403 http://localhost/shared/module.js" },
    { name: "network failure", event: "requestfailed", payload: { url: () => "http://localhost/module.js", failure: () => ({ errorText: "net::ERR_CONNECTION_RESET" }) }, expected: "Request failed http://localhost/module.js: net::ERR_CONNECTION_RESET" },
    { name: "module exception", event: "pageerror", payload: new Error("module initialization failed"), expected: "Page error: module initialization failed" },
  ])("readiness failure explains $name and closes resources", async ({ event, payload, expected }) => {
    const listeners = new Map<string, (value: unknown) => void>();
    const originalBrowser = await mocks.launch();
    const page = await originalBrowser.newPage();
    page.on.mockImplementation((name: string, listener: (value: unknown) => void) => listeners.set(name, listener));
    page.goto.mockImplementation(async () => listeners.get(event)?.(payload));
    page.waitForFunction.mockRejectedValue(new Error("Timeout 10000ms exceeded"));
    mocks.launch.mockResolvedValue({ ...originalBrowser, newPage: async () => page });
    const result = openScenePage({ sceneFile: join(directory, "scene.html"), width: 16, height: 16 });
    await expect(result).rejects.toThrow(expected);
    await expect(result).rejects.toThrow(`Serving root: ${directory}`);
    await expect(result).rejects.toThrow("Timeout 10000ms exceeded");
    expect(mocks.close).toHaveBeenCalledOnce();
    expect(mocks.serverClose).toHaveBeenCalledOnce();
  });

  test("a scene that never publishes its contract has an explicit diagnostic", async () => {
    const originalBrowser = await mocks.launch();
    const page = await originalBrowser.newPage();
    page.waitForFunction.mockRejectedValue(new Error("Timeout 10000ms exceeded"));
    mocks.launch.mockResolvedValue({ ...originalBrowser, newPage: async () => page });
    await expect(openScenePage({ sceneUrl: "http://test.invalid", width: 16, height: 16 })).rejects.toThrow("No failed resource requests or page errors observed; scene did not become ready.");
    expect(mocks.close).toHaveBeenCalledOnce();
  });

  test("an optional failed request does not fail a scene that becomes ready", async () => {
    const listeners = new Map<string, (value: unknown) => void>();
    const originalBrowser = await mocks.launch();
    const page = await originalBrowser.newPage();
    page.on.mockImplementation((name: string, listener: (value: unknown) => void) => listeners.set(name, listener));
    page.goto.mockImplementation(async () => listeners.get("response")?.({ status: () => 404, url: () => "http://test.invalid/favicon.ico" }));
    mocks.launch.mockResolvedValue({ ...originalBrowser, newPage: async () => page });
    const scene = await openScenePage({ sceneUrl: "http://test.invalid", width: 16, height: 16 });
    expect(scene.duration).toBe(1);
    await scene.close();
  });

  test("a shorter full render removes the old tail and preserves unrelated files", async () => {
    await captureFrames(options());
    writeFileSync(join(directory, "notes.txt"), "keep");
    duration = 1 / 3;
    const report = await captureFrames(options());
    expect(report.frames).toBe(1);
    expect(readdirSync(directory)).toEqual(["frame-0000.png", "notes.txt"]);
    expect(seeks.slice(0, 3)).toEqual([0, 1 / 3, 2 / 3]);
  });

  test("explicit frame updates preserve other frames", async () => {
    await captureFrames(options());
    writeFileSync(join(directory, "frame-0000.png"), "original");
    await captureFrames({ ...options(), frames: [1] });
    expect(readFileSync(join(directory, "frame-0000.png"), "utf8")).toBe("original");
    expect(readdirSync(directory)).toHaveLength(3);
  });

  test("launch failure closes the scene server", async () => {
    mocks.launch.mockRejectedValue(new Error("launch failed"));
    await expect(captureFrames({ ...options(), sceneFile: join(directory, "scene.html") })).rejects.toThrow("launch failed");
    expect(mocks.serverClose).toHaveBeenCalledOnce();
    expect(mocks.closeAllConnections).toHaveBeenCalledOnce();
  });

  test("browser close failure still closes the scene server", async () => {
    mocks.close.mockRejectedValue(new Error("close failed"));
    await expect(captureFrames({ ...options(), sceneFile: join(directory, "scene.html") })).rejects.toThrow("close failed");
    expect(mocks.serverClose).toHaveBeenCalledOnce();
  });
});
