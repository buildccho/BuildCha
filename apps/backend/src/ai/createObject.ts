import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { z } from "zod";
import { create3DObjectFromMessage } from "../util/create3DObject";
import {
  AiInputSchema,
  AiOutputSchema,
  ConversationHistorySchema,
} from "./schemas";

const ErrorSchema = z.object({
  message: z.string().meta({ example: "エラーメッセージ" }),
});

const app = new Hono();

app.get(
  "/createObject",
  describeRoute({
    description: "AIオブジェクト生成エンドポイント",
    tags: ["AI"],
    responses: {
      200: {
        description: "3Dオブジェクト生成結果",
        content: { "application/json": { schema: resolver(AiOutputSchema) } },
      },
      400: {
        description: "バリデーションエラー",
        content: { "application/json": { schema: resolver(ErrorSchema) } },
      },
      500: {
        description: "サーバーエラー",
        content: { "application/json": { schema: resolver(ErrorSchema) } },
      },
    },
  }),
  validator("query", AiInputSchema),
  async (c) => {
    const { userInput, history } = c.req.valid("query");
    let parsedHistory: ConversationHistorySchema = [];
    if (history) {
      const raw = JSON.parse(history);
      const result = ConversationHistorySchema.safeParse(raw);
      if (!result.success) {
        return c.json({ message: "会話履歴の解析に失敗しました" }, 400);
      }
      parsedHistory = result.data;
    }

    try {
      const data = await create3DObjectFromMessage(
        userInput,
        JSON.stringify(parsedHistory),
      );
      return c.json(data, 200);
    } catch (e) {
      const message = e instanceof Error ? e.message : "3Dオブジェクト生成失敗";
      return c.json({ message }, 500);
    }
  },
);

export default app;
