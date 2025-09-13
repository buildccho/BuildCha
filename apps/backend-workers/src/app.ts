import { swaggerUI } from "@hono/swagger-ui";
import type { Session, User } from "better-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPISpecs } from "hono-openapi";
import ai from "./ai";
import { createAuth } from "./lib/auth";
import prismaClients from "./lib/prisma";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.get("/", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const users = await prisma.user.findMany();
  const auth = await createAuth(c.env.DB);
  const user = await auth.api.signInAnonymous();
  console.log("users", users);
  console.log("user", user);
  return c.json({ message: "Hello, BuildCha!" });
});

app.use(
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: "http://localhost:3001", // replace with your origin
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use("*", async (c, next) => {
  const auth = await createAuth(c.env.DB);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = await createAuth(c.env.DB);
  return auth.handler(c.req.raw);
});

app.route("/ai", ai);

app.get("/session", (c) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user) return c.body(null, 401);

  return c.json({
    session,
    user,
  });
});

// OpenAPIドキュメントの設定
app
  .get(
    "/openapi.json",
    openAPISpecs(app, {
      documentation: {
        info: {
          title: "BuildCha API",
          version: "1.0.0",
          description: "API for greeting users",
        },
      },
      includeEmptyPaths: false,
      excludeStaticFile: false,
      exclude: "",
      excludeMethods: [],
      excludeTags: [],
      defaultOptions: {
        GET: {},
        POST: {},
        PUT: {},
        DELETE: {},
        PATCH: {},
      },
    }),
  )
  .get(
    "/api/docs",
    swaggerUI({
      url: "/openapi.json",
    }),
  );

export type AppType = typeof app;
export default app;
