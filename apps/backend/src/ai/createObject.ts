import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { create3DObjectFromMessage } from "../util/create3DObject";
import { AiOutputSchema, ConversationHistorySchema } from "./schemas";

const ErrorSchema = z.object({
  message: z.string().openapi({ example: "エラーメッセージ" }),
});
const createObjectRoute = createRoute({
  method: "get",
  path: "/createObject",
  request: {
    query: z.object({
      userInput: z.string().min(1).openapi({
        example: "かわいい家つくって",
        description: "ユーザー入力コメント",
      }),
      history: z
        .string()
        .optional()
        .openapi({
          example: JSON.stringify([
            { role: "user", content: "かわいい家つくって" },
            {
              role: "assistant",
              content:
                '{"chat": "かわいい家ができました！","name": "かわいい家","parts":[{~}]}',
            },
          ]),
          description: "会話履歴(JSON文字列)",
        }),
    }),
  },
  responses: {
    200: {
      description: "3Dオブジェクト生成結果",
      content: { "application/json": { schema: AiOutputSchema } },
    },
    400: {
      description: "バリデーションエラー",
      content: { "application/json": { schema: ErrorSchema } },
    },
    500: {
      description: "サーバーエラー",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});

const app = new OpenAPIHono();

app.openapi(createObjectRoute, async (c) => {
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
});

app.doc("/createObject.json", {
  openapi: "3.0.0",
  info: { title: "3Dオブジェクト生成API", version: "1.0.0" },
});

export default app;
