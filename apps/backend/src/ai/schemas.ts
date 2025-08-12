import { z } from "zod";

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

export const ConversationHistorySchema = z
  .object({
    role: z.enum(["user", "assistant"]).meta({ example: "user" }),
    content: z.string().meta({ example: "かわいい家つくって！" }),
  })
  .array()
  .meta({ description: "会話履歴" });
export type ConversationHistorySchema = z.infer<
  typeof ConversationHistorySchema
>;

export const AiInputSchema = z.object({
  userInput: z.string().min(1).meta({
    example: "かわいい家つくって",
    description: "ユーザー入力コメント",
  }),
  history: z
    .string()
    .optional()
    .meta({
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
});
