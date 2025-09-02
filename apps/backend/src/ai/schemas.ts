import { z } from "zod";

export const CreateObjectOutputSchema = z
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
export type CreateObjectOutputSchema = z.infer<typeof CreateObjectOutputSchema>;

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

export const CreateObjectInputSchema = z.object({
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

export const comparObjectInputSchema = z.object({
  questId: z.string().meta({ example: "クエストID" }),
  userCreatedObjectImages: z
    .object({
      topView: z.file().mime("image/png"),
      bottomView: z.file().mime("image/png"),
      leftView: z.file().mime("image/png"),
      rightView: z.file().mime("image/png"),
      frontView: z.file().mime("image/png"),
      backView: z.file().mime("image/png"),
    })
    .meta({ description: "ユーザーが作成したオブジェクトの画像" }),
});

export const comparObjectOutputSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .meta({ example: 85, description: "類似度スコア（0-100）" }),
  comment: z.string().meta({
    example:
      "ユーザーのオブジェクトは非常に良くできています。いくつかの細部を改善することで、さらにリアルになります。",
    description: "AIからのフィードバックコメント",
  }),
});
