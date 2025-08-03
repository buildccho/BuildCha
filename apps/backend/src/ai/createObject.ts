// commentとhistoryが引数で作成された3Dオブジェクトのjsonを返すAPI

import { Hono } from "hono";
import { z } from "zod";
import { create3DObjectFromMessage } from "../util/create3DObject";

const ConversationHistorySchema = z.array(
  z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  }),
);
export type ConversationHistorySchema = z.infer<
  typeof ConversationHistorySchema
>;
const app = new Hono();

app.get("/", async (c) => {
  const { comment, history } = c.req.query();
  if (!comment?.trim() || !history) {
    return c.json({ error: "Comment and history are required" }, 400);
  }
  // ここで3Dオブジェクトを生成するロジックを実装
  try {
    const parsedHistory = ConversationHistorySchema.parse(history);
    const data = await create3DObjectFromMessage(comment, parsedHistory);
    return c.json(data);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;
