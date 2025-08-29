/* 
  NOTE ON TEST FRAMEWORK:
  - These tests are written using Vitest-compatible APIs (describe/it/expect) which are also Jest-compatible for basic usage.
  - Please run with your project's configured test runner (detected via package.json). 
  - They rely on the Hono app exposing a default export and supporting app.request(path, init?) -> Response.
*/

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

let app: any;

// Attempt to import the app from likely locations.
// Adjust these imports if your project places the app in a different file.
async function importApp() {
  const candidates = [
    // Most likely locations
    () => import("../app"),
    () => import("../index"),
    () => import("../server"),
    // If tests are colocated differently, try stepping out one more level
    () => import("../../app"),
    () => import("../../index"),
    () => import("../../server"),
  ];

  for (const load of candidates) {
    try {
      const mod = await load();
      if (mod?.default) return mod.default;
    } catch {
      // keep trying
    }
  }
  throw new Error("Could not locate the Hono app default export in expected paths.");
}

describe("App routes", () => {
  beforeAll(async () => {
    // If the app internally imports './ai/createObject', it should not fail in tests.
    // We can mock it to a minimal Hono sub-app to avoid external side-effects.
    try {
      const realImport = globalThis.__dynamicImport;
      // No-op to satisfy TS; actual mocking is handled by Vitest's vi.mock if module resolution matches.
      // If your runner is Jest, replace vi.mock with jest.mock accordingly.
      vi.mock("../ai/createObject", async () => {
        const { Hono } = await import("hono");
        const sub = new Hono();
        sub.get("/", (c) => c.json({ ok: true, mocked: true }));
        return { default: sub };
      });
    } catch {
      // If mocking fails due to path mismatch, tests will still run. The importApp() will locate the app if available.
    }
    app = await importApp();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("GET / should return Hello World!", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/i);
    const text = await res.text();
    expect(text).toBe("Hello World!");
  });

  it("GET /openapi.json should return valid OpenAPI info", async () => {
    const res = await app.request("/openapi.json");
    expect(res.status).toBe(200);

    const ctype = res.headers.get("content-type") || "";
    expect(ctype).toMatch(/application\/json/i);

    const json = await res.json();
    // Minimal validations based on provided code configuration
    expect(json).toBeTruthy();
    expect(json.info).toBeTruthy();
    expect(json.info.title).toBe("BuildCha API");
    expect(json.info.version).toBe("1.0.0");
    expect(json.info.description).toBe("API for greeting users");

    // Ensure paths exist (may be empty depending on route annotations)
    expect(json).toHaveProperty("paths");
  });

  it("GET /api/docs should return Swagger UI HTML", async () => {
    const res = await app.request("/api/docs");
    expect(res.status).toBe(200);
    const ctype = res.headers.get("content-type") || "";
    // Some setups return text/html; charset=utf-8
    expect(ctype).toMatch(/text\/html/i);

    const html = await res.text();
    expect(html.length).toBeGreaterThan(0);
    expect(html).toMatch(/Swagger UI|swagger-ui/i);
    // The UI should reference the openapi.json endpoint
    expect(html).toMatch(/\/openapi\.json/);
  });

  it("POST / should not be allowed (expect 404 or method handling)", async () => {
    const res = await app.request("/", { method: "POST" });
    // Hono returns 404 for unmatched method+path by default
    expect([404, 405]).toContain(res.status);
  });

  it("GET /non-existent should return 404", async () => {
    const res = await app.request("/non-existent");
    expect(res.status).toBe(404);
  });
});