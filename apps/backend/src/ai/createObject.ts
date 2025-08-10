import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { create3DObjectFromMessage } from "../util/create3DObject";

export const AiOutputSchema = z
  .object({
    chat: z.string().describe("チャットの返信"),
    name: z.string().describe("オブジェクトの名前"),
    parts: z
      .array(
        z
          .object({
            type: z.string().describe("パーツタイプ"),
            position: z.array(z.number()).describe("位置[x, y, z]"),
            rotation: z.array(z.number()).describe("回転[x, y, z]"),
            size: z.array(z.number()).describe("サイズ[x, y, z]"),
            color: z.string().describe("色コード"),
          })
          .strict(),
      )
      .nonempty(),
  })
  .strict();
export type AiOutputSchema = z.infer<typeof AiOutputSchema>;

const ConversationHistorySchema = z
  .object({
    role: z.enum(["user", "assistant"]).openapi({ example: "user" }),
    content: z.string().openapi({ example: "かわいい家つくって！" }),
  })
  .array()
  .openapi("会話履歴");
export type ConversationHistorySchema = z.infer<
  typeof ConversationHistorySchema
>;

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
    parsedHistory = ConversationHistorySchema.parse(raw);
  }

  try {
    const data = await create3DObjectFromMessage(userInput, parsedHistory);
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
