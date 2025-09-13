import { Scalar } from "@scalar/hono-api-reference";
import type { Session, User } from "better-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { describeRoute, openAPISpecs } from "hono-openapi";
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

/* CORS Middleware */
app.use(
  "*",
  cors({
    origin: "http://localhost:3000", // TODO: フロントエンドの本番環境のURLを追加する
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

/* セッションチェック Middleware */
app.use("*", async (c, next) => {
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
});

/* Better Authルート設定 */
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env.DB);
  return auth.handler(c.req.raw);
});

app.get("/", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const users = await prisma.user.findMany();
  console.log("users", users);
  return c.json({ message: "Hello, BuildCha!" });
});

/* ユーザー情報取得 */
app.get(
  "/user",
  describeRoute({
    tags: ["User"],
    description: "ユーザー情報の取得",
  }),
  async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ message: "ユーザーが見つかりません" }, 401);

    return c.json(
      {
        user,
      },
      200,
    );
  },
);

/* ルート設定 */
app.route("/ai", ai);

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

export type AppType = typeof app;
export default app;
