import { Scalar } from "@scalar/hono-api-reference";
import type { Session, User } from "better-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { openAPISpecs } from "hono-openapi";
import ai from "./ai";
import { createAuth } from "./lib/auth";
import prismaClients from "./lib/prisma";
import map from "./routes/map";
import object from "./routes/object";
import quest from "./routes/quest";
import r2 from "./routes/r2";
import user from "./routes/user";

const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend.buildcha.workers.dev",
];

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()

  /* CORS Middleware */
  .use(
    "*",
    cors({
      origin: (origin) => {
        return allowedOrigins.includes(origin) ? origin : undefined;
      },
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )

  /* セッションチェック Middleware */
  .use("*", async (c, next) => {
    const auth = createAuth(c.env.DB);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }
    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  })

  /* Better Authルート設定 */
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    const auth = createAuth(c.env.DB);
    return auth.handler(c.req.raw);
  })

  .get("/", async (c) => {
    const prisma = await prismaClients.fetch(c.env.DB);
    const users = await prisma.user.findMany();
    console.log("users", users);
    return c.json({ message: "Hello, BuildCha!" });
  })

  /* ルート設定 */
  .route("/user", user)
  .route("/ai", ai)
  .route("/quests", quest)
  .route("/maps", map)
  .route("/objects", object)
  .route("/r2", r2);

/* OpenAPIドキュメントの設定 */
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
    Scalar({
      pageTitle: "API Documentation",
      sources: [
        { url: "/openapi.json", title: "API" },
        // Better Auth schema generation endpoint
        { url: "/api/auth/open-api/generate-schema", title: "Auth" },
      ],
    }),
  );

export default app;
