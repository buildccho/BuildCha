/**
 * Tests for Azure Functions Node v4 entry registration (index.ts).
 * Testing framework: (will be auto-detected by repo; typically Jest or Vitest).
 * These tests focus on ensuring function registration side effects do not throw,
 * and that the HTTP trigger is wired with expected metadata.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";

// Lightweight dual-runner adapter (Jest or Vitest)
const runtime = (() => {
  const g: any = globalThis as any;
  const hasVi = typeof g.vi !== "undefined";
  return {
    fn: hasVi ? g.vi.fn : (g.jest ? g.jest.fn : () => { throw new Error("No mock fn available (jest/vi)"); }),
    spyOn: hasVi ? g.vi.spyOn : (g.jest ? g.jest.spyOn : undefined),
    resetAllMocks: () => { if (g.vi?.resetAllMocks) g.vi.resetAllMocks(); if (g.jest?.resetAllMocks) g.jest.resetAllMocks(); },
    clearAllMocks: () => { if (g.vi?.clearAllMocks) g.vi.clearAllMocks(); if (g.jest?.clearAllMocks) g.jest.clearAllMocks(); },
  };
})();

// We will mock @azure/functions to intercept app.* registrations.
type HttpRouteRegistration = {
  route: string;
  methods: string[];
  authLevel?: string;
  handler: Function;
};

const registrations: { http: HttpRouteRegistration[] } = { http: [] };

viOrJestMockAzureFunctions();

/**
 * Mocks @azure/functions app API to capture HTTP registrations.
 */
function viOrJestMockAzureFunctions() {
  const g: any = globalThis as any;
  const mockImpl = {
    http: {
      createHandler: (handler: Function) => handler,
      route: (nameOrOpts: any, optsMaybe?: any) => {
        // Support both signature styles:
        //   app.http('name', { route: '...', methods: ['GET'], authLevel: 'anonymous', handler })
        //   app.http({ route: '...', methods: ['GET'], authLevel: 'anonymous', handler })
        const cfg = typeof nameOrOpts === "string" ? { ...(optsMaybe || {}) } : { ...(nameOrOpts || {}) };
        if (!cfg || typeof cfg !== "object") throw new Error("Invalid HTTP route config");
        const route = cfg.route ?? "/";
        const methods = Array.isArray(cfg.methods) ? cfg.methods.map(String) : [];
        const authLevel = cfg.authLevel ? String(cfg.authLevel) : undefined;
        const handler = cfg.handler;
        if (typeof handler !== "function") throw new Error("HTTP route missing function handler");
        registrations.http.push({ route, methods, authLevel, handler });
        return cfg;
      },
    },
  };

  // Provide a fake module namespace object for @azure/functions
  const fakeModule = {
    app: mockImpl,
    HttpRequest: class {},
    HttpResponseInit: class {},
    InvocationContext: class {},
  };

  if (g.vi) {
    g.vi.mock("@azure/functions", () => fakeModule);
  } else if (g.jest) {
    g.jest.mock("@azure/functions", () => fakeModule, { virtual: true });
  }
}

describe("Azure Functions v4 entry registration (index.ts)", () => {
  beforeEach(() => {
    registrations.http.length = 0;
    runtime.resetAllMocks();
    runtime.clearAllMocks();
    // Delete the cached modules to force re-evaluation of registration side-effects
    const base = path.resolve(process.cwd(), "apps/backend/src/functions");
    const targetModules = [
      path.join(base, "index.ts"),
      path.join(base, "index.js"),
      path.join(base, "httpTrigger.ts"),
      path.join(base, "httpTrigger.js"),
    ];
    Object.keys(require.cache).forEach((k) => {
      if (targetModules.some((m) => k.endsWith(m))) {
        delete require.cache[k];
      }
    });
  });

  test("importing index should not throw and should register at least one HTTP route", async () => {
    const importIndex = () => {
      // index.ts is expected to import files (e.g., './httpTrigger') that call app.http(...)
      // Use require to work with transpiled or ts-jest environments.
      require("../../functions/index.ts");
    };
    expect(importIndex).not.toThrow();

    // At least one HTTP registration must be present
    expect(registrations.http.length).toBeGreaterThan(0);
  });

  test("registered HTTP routes include route path, methods, and a callable handler", () => {
    try {
      require("../../functions/index.ts");
    } catch (e) {
      // If index import fails, we still want assertion visibility
    }
    expect(registrations.http.length).toBeGreaterThan(0);

    for (const r of registrations.http) {
      expect(typeof r.route).toBe("string");
      expect(Array.isArray(r.methods)).toBe(true);
      // Methods should be non-empty GET/POST/etc if defined
      if (r.methods.length > 0) {
        for (const m of r.methods) {
          expect(typeof m).toBe("string");
          expect(m.toUpperCase()).toBe(m); // Conventionally upper-case
        }
      }
      expect(typeof r.handler).toBe("function");
    }
  });

  test("handlers respond or throw predictably when invoked with minimal mock context/request", async () => {
    require("../../functions/index.ts");
    expect(registrations.http.length).toBeGreaterThan(0);

    // Minimal InvocationContext and HttpRequest shape
    const ctx: any = { log: runtime.fn(), traceContext: { traceId: "test-trace" } };
    const req: any = {
      method: "GET",
      url: "http://localhost/",
      headers: new Map<string, string>(),
      query: new URLSearchParams(),
    };

    // We don't assert specific response shapes since implementation may vary.
    // We just assert that the handler doesn't crash synchronously and either:
    // - returns a response-like object, or
    // - throws a handled error (which we catch for test visibility).
    for (const r of registrations.http) {
      const maybePromise = r.handler(req, ctx);
      // Allow both sync and async handlers
      const res = typeof maybePromise?.then === "function" ? await maybePromise : maybePromise;
      // If response is returned, it should be an object (Azure Functions HttpResponseInit-like)
      if (res !== undefined) {
        expect(typeof res).toBe("object");
      }
    }
  });

  test("no duplicate route+method combinations are registered (basic sanity)", () => {
    require("../../functions/index.ts");
    const seen = new Set<string>();
    for (const r of registrations.http) {
      const key = `${r.route}|${(r.methods || []).sort().join(",")}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});

/**
 * Note on framework:
 * - This suite is compatible with Jest or Vitest. The repository's current testing library will be used.
 * - If using Jest, ensure ts-jest or Babel is configured for TS. If using Vitest, ensure tsconfig aliases resolve.
 */

describe("httpTrigger module wiring (smoke)", () => {
  test("importing httpTrigger side effects should register a handler", () => {
    registrations.http.length = 0; // reset captured registrations
    expect(() => require("../../functions/httpTrigger.ts")).not.toThrow();
    expect(registrations.http.length).toBeGreaterThan(0);
  });
});