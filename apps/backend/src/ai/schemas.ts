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
    role: z.enum(["user", "assistant"]).openapi({ example: "user" }),
    content: z.string().openapi({ example: "かわいい家つくって！" }),
  })
  .array()
  .openapi("会話履歴");
export type ConversationHistorySchema = z.infer<
  typeof ConversationHistorySchema
>;
