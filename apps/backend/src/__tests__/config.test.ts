/**
 * Tests for getConfig.
 *
 * Testing framework: Jest (or Vitest-compatible with minor changes).
 * - We use jest.mock to stub dotenv.config
 * - We use jest.resetModules/isolateModules to emulate fresh module load per test
 */

import type { ZodError } from "zod";

const ORIGINAL_ENV = process.env;

describe("getConfig", () => {
  beforeEach(() => {
    // Reset process.env for each test, preserving unrelated vars
    process.env = { ...ORIGINAL_ENV };
    // Important: clear module registry so module-level cache (let config) resets
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  test("returns config when OPENAI_API_KEY is set", async () => {
    process.env.OPENAI_API_KEY = "sk-example";

    // Mock dotenv before importing the module under test
    const dotenvConfigMock = jest.fn(() => ({ parsed: { OPENAI_API_KEY: "sk-example" } })) as any;
    jest.doMock("dotenv", () => ({ config: dotenvConfigMock }));

    // Import fresh instance with isolated module graph
    const { getConfig } = await import("../../config"); // adjust path if implementation isn’t at apps/backend/src/config.ts

    const cfg = getConfig();
    expect(cfg).toEqual({ OPENAI_API_KEY: "sk-example" });
    expect(dotenvConfigMock).toHaveBeenCalledTimes(1);
  });

  test("throws ZodError when OPENAI_API_KEY is undefined", async () => {
    delete process.env.OPENAI_API_KEY;

    const dotenvConfigMock = jest.fn(() => ({})) as any;
    jest.doMock("dotenv", () => ({ config: dotenvConfigMock }));

    const { getConfig } = await import("../../config").catch(() => ({} as any));
    // Import the module containing getConfig (path may vary); if this file is itself the implementation,
    // change the import to relative path './config' as appropriate.

    // Call and assert throw
    const call = () => getConfig();
    try {
      call();
      // If no throw, force failure
      // eslint-disable-next-line no-throw-literal
      throw "Expected ZodError but did not throw";
    } catch (err: any) {
      // zod v3 throws a ZodError instance
      expect(err?.name ?? "").toContain("ZodError");
      // dotenv should still have been invoked once on first access
      expect(dotenvConfigMock).toHaveBeenCalledTimes(1);
    }
  });

  test("caches configuration: subsequent calls do not call dotenv again", async () => {
    process.env.OPENAI_API_KEY = "first-key";

    const dotenvConfigMock = jest.fn(() => ({})) as any;
    jest.doMock("dotenv", () => ({ config: dotenvConfigMock }));

    const mod = await import("../../config");
    const { getConfig } = mod;

    const first = getConfig();
    const second = getConfig();

    expect(first).toBe(second);
    expect(first.OPENAI_API_KEY).toBe("first-key");
    expect(dotenvConfigMock).toHaveBeenCalledTimes(1);

    // Change the env after initialization; cached value should remain unchanged
    process.env.OPENAI_API_KEY = "second-key";
    const third = getConfig();
    expect(third.OPENAI_API_KEY).toBe("first-key");
    expect(dotenvConfigMock).toHaveBeenCalledTimes(1);
  });

  test("re-importing the module re-runs dotenv and picks up new env (cache reset via resetModules)", async () => {
    // First load
    process.env.OPENAI_API_KEY = "initial-key";
    const dotenvConfigMock1 = jest.fn(() => ({})) as any;
    jest.doMock("dotenv", () => ({ config: dotenvConfigMock1 }));
    let { getConfig } = await import("../../config");
    const a = getConfig();
    expect(a.OPENAI_API_KEY).toBe("initial-key");
    expect(dotenvConfigMock1).toHaveBeenCalledTimes(1);

    // Reset module registry to drop module-level cache
    jest.resetModules();
    jest.clearAllMocks();

    // Second load with new env
    process.env.OPENAI_API_KEY = "new-key";
    const dotenvConfigMock2 = jest.fn(() => ({})) as any;
    jest.doMock("dotenv", () => ({ config: dotenvConfigMock2 }));
    ;({ getConfig } = await import("../../config"));
    const b = getConfig();
    expect(b.OPENAI_API_KEY).toBe("new-key");
    expect(dotenvConfigMock2).toHaveBeenCalledTimes(1);
  });

  test("accepts empty string OPENAI_API_KEY (zod.string() allows '')", async () => {
    process.env.OPENAI_API_KEY = "";

    const dotenvConfigMock = jest.fn(() => ({})) as any;
    jest.doMock("dotenv", () => ({ config: dotenvConfigMock }));

    const { getConfig } = await import("../../config");
    const cfg = getConfig();
    expect(cfg).toEqual({ OPENAI_API_KEY: "" });
    expect(dotenvConfigMock).toHaveBeenCalledTimes(1);
  });
});