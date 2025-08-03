// commentとhistoryが引数で作成された3Dオブジェクトのjsonを返すAPI

import { Hono } from "hono";
import { create3DObjectFromMessage } from "../util/create3DObject";

const app = new Hono();

app.get("/", async (c) => {
  const { comment, history } = c.req.query();
  if (!comment || !history) {
    return c.json({ error: "Missing comment or history" }, 400);
  }
  // ここで3Dオブジェクトを生成するロジックを実装
  try {
    const parsedHistory = JSON.parse(history);
    const data = await create3DObjectFromMessage(comment, parsedHistory);
    return c.json(data);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
