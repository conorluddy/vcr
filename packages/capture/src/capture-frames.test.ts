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
import { captureFrames } from "./capture-frames.js";

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
