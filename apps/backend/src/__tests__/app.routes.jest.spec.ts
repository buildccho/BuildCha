/**
 * Jest-compatible wrapper tests for Hono app, mirroring the Vitest suite.
 * If your project uses Jest, you can run these. Otherwise, prefer app.routes.spec.ts.
 */
import type { Hono } from "hono";

let app: Hono;

async function importApp() {
  const candidates = [
    () => import("../app"),
    () => import("../index"),
    () => import("../server"),
    () => import("../../app"),
    () => import("../../index"),
    () => import("../../server"),
  ];
  for (const load of candidates) {
    try {
      const mod = await load();
      if (mod?.default) return mod.default as Hono;
    } catch {}
  }
  throw new Error("Could not locate the Hono app default export in expected paths.");
}

describe("App routes (Jest)", () => {
  beforeAll(async () => {
    try {
      jest.mock("../ai/createObject", () => {
        const { Hono } = require("hono");
        const sub = new Hono();
        sub.get("/", (c: any) => c.json({ ok: true, mocked: true }));
        return { __esModule: true, default: sub };
      });
    } catch {}
    app = (await importApp()) as any;
  });

  afterAll(() => {
    jest.restoreAllMocks?.();
  });

  test("GET / returns Hello World!", async () => {
    const res = await (app as any).request("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/i);
    const text = await res.text();
    expect(text).toBe("Hello World!");
  });

  test("GET /openapi.json returns OpenAPI info", async () => {
    const res = await (app as any).request("/openapi.json");
    expect(res.status).toBe(200);
    const ctype = res.headers.get("content-type") || "";
    expect(ctype).toMatch(/application\/json/i);
    const json = await res.json();
    expect(json.info.title).toBe("BuildCha API");
    expect(json.info.version).toBe("1.0.0");
    expect(json.info.description).toBe("API for greeting users");
    expect(json).toHaveProperty("paths");
  });

  test("GET /api/docs returns HTML", async () => {
    const res = await (app as any).request("/api/docs");
    expect(res.status).toBe(200);
    const ctype = res.headers.get("content-type") || "";
    expect(ctype).toMatch(/text\/html/i);
    const html = await res.text();
    expect(html).toMatch(/Swagger UI|swagger-ui/i);
    expect(html).toMatch(/\/openapi\.json/);
  });

  test("POST / is not allowed", async () => {
    const res = await (app as any).request("/", { method: "POST" });
    expect([404, 405]).toContain(res.status);
  });

  test("GET /non-existent returns 404", async () => {
    const res = await (app as any).request("/non-existent");
    expect(res.status).toBe(404);
  });
});