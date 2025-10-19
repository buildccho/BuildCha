import { z } from "zod";

// 3Dオブジェクト生成の出力スキーマ
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

export const CreateObjectConversationHistorySchema = z
  .object({
    role: z.enum(["user", "assistant"]).meta({ example: "user" }),
    content: z.string().meta({ example: "かわいい家つくって！" }),
  })
  .array()
  .meta({ description: "会話履歴" });
export type CreateObjectConversationHistorySchema = z.infer<
  typeof CreateObjectConversationHistorySchema
>;

// オブジェクト比較の入出力スキーマ
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
          content: '{"role":"user","content":"かわいい家つくって！"}',
        },
      ]),
      description: "会話履歴(JSON文字列)",
    }),
});

export const CompareObjectInputSchema = z.object({
  topView: z.file().mime("image/png").meta({ example: "上面画像" }),
  bottomView: z.file().mime("image/png").meta({ example: "下面画像" }),
  leftView: z.file().mime("image/png").meta({ example: "左側面画像" }),
  rightView: z.file().mime("image/png").meta({ example: "右側面画像" }),
  frontView: z.file().mime("image/png").meta({ example: "前面画像" }),
  backView: z.file().mime("image/png").meta({ example: "背面画像" }),
});

export const CompareObjectOutputSchema = z.object({
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

// ChatBotの入出力スキーマ
export const ChatBotConversationHistorySchema = z
  .array(
    z.object({
      role: z.enum(["user", "assistant"]).meta({ description: "発言者の役割" }),
      content: z.string().meta({ description: "内容" }),
    }),
  )
  .meta({
    example: [
      { role: "user", content: "このBuildchaの使い方を教えてください。" },
      {
        role: "assistant",
        content:
          "こんにちは！Buildchaへようこそ！Buildchaは、3Dオブジェクトを作成することができるアプリケーションです。",
      },
    ],
    description: "チャットの履歴",
  });
export type ChatBotConversationHistorySchema = z.infer<
  typeof ChatBotConversationHistorySchema
>;

// ベクトルストアにドキュメントを追加する際のスキーマ
export const AddDocumentsInputSchema = z.object({
  pdfFile: z.file().mime("application/pdf").meta({
    example: "PDFファイル",
    description: "ベクトルストアに追加するPDFファイル",
  }),
});
export type AddDocumentsInputSchema = z.infer<typeof AddDocumentsInputSchema>;
