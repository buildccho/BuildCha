import { serve } from "@hono/node-server";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import ai from "./ai/createObject";

const app = new Hono();

app.route("/ai", ai);

app.get("/", (c) => c.text("Hello World!"));

// OpenAPIドキュメントの設定
app
  .get(
    "/openapi.json",
    openAPIRouteHandler(app, {
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

// ローカル開発用のnodeサーバーを起動
const port = 8000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
