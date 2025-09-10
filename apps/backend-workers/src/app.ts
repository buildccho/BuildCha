import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import ai from "./ai";
import prismaClients from "./lib/prisma";

const app = new Hono<{
  Bindings: CloudflareBindings;
}>();

app.route("/ai", ai);

app.get("/", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const users = await prisma.user.findMany();
  console.log("users", users);
  return c.json({ message: "Hello, BuildCha!" });
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
