import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello Azure Functions!"));
app.get("/abc", (c) => c.json({ message: "Hello from /abc" }));

export default app;
