import { serve } from "@hono/node-server";
import app from "./app";

// Local development server only
const port = Number(process.env.PORT || 8000);
console.log(`Local server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
