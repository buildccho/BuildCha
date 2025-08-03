import { serve } from "@hono/node-server";
import { Hono } from "hono";
import ai from "./ai/createObject";

const app = new Hono();

app.route("/ai", ai);

app.get("/", (c) => c.text("Hello World!"));

// ローカル開発用のnodeサーバーを起動
const port = 8000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
