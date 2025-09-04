import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import endpoint from "./ai/endpoint";

const app = new Hono();

app.route("/ai", endpoint);

app.get("/", (c) => c.text("Hello World!"));

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

export default app;
