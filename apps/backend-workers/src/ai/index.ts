import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { getAnswerObjectImageUrls } from "../moc/getAnswerObject";
import { createChatBotResponse } from "./chatBot";
import { compareImages } from "./compareImages";
import { create3DObjectFromMessage } from "./create3DObject";
import {
  ChatBotConversationHistorySchema,
  CompareObjectInputSchema,
  CompareObjectOutputSchema,
  CreateObjectConversationHistorySchema,
  CreateObjectInputSchema,
  CreateObjectOutputSchema,
} from "./schemas";

const ErrorSchema = z.object({
  message: z.string().meta({ example: "エラーメッセージ" }),
});

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.post(
  "/createObject",
  describeRoute({
    description: "AIオブジェクト生成エンドポイント",
    tags: ["AI"],
    responses: {
      200: {
        description: "3Dオブジェクト生成結果",
        content: {
          "application/json": { schema: resolver(CreateObjectOutputSchema) },
        },
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
  validator("json", CreateObjectInputSchema),
  async (c) => {
    const { userInput, history } = c.req.valid("json");
    let parsedHistory: CreateObjectConversationHistorySchema = [];
    if (history) {
      const raw = JSON.parse(history);
      const result = CreateObjectConversationHistorySchema.safeParse(raw);
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

app.post(
  "/compareObject",
  describeRoute({
    description: "AIオブジェクト比較エンドポイント",
    tags: ["AI"],
    responses: {
      200: {
        description: "3Dオブジェクト比較結果",
        content: {
          "application/json": { schema: resolver(CompareObjectOutputSchema) },
        },
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
  validator("form", CompareObjectInputSchema),
  async (c) => {
    const {
      questId,
      topView,
      bottomView,
      leftView,
      rightView,
      frontView,
      backView,
    } = c.req.valid("form");
    const correctObjectUrls = getAnswerObjectImageUrls(questId); //TODO: ここはDBから取得するようにする
    if (!correctObjectUrls) {
      return c.json(
        { message: "正解オブジェクトが見つかりませんでした。" },
        404,
      );
    }
    const { overallScore, results } = await compareImages(
      {
        topView: topView as File,
        bottomView: bottomView as File,
        leftView: leftView as File,
        rightView: rightView as File,
        frontView: frontView as File,
        backView: backView as File,
      },
      correctObjectUrls,
    );
    return c.json({ overallScore, results });
  },
);

app.post(
  "/chatBot",
  describeRoute({
    description: "AIのQAチャットボットエンドポイント",
    tags: ["AI"],
    responses: {
      200: {
        description: "チャットボットの応答",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                response: z.string().meta({
                  example:
                    "Buildchaは、小学生を対象にした3Dオブジェクト作成アプリです。",
                }),
              }),
            ),
          },
        },
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
  validator(
    "json",
    z.object({
      userMessage: z.string().min(1).meta({
        example: "BuildChaはどの人を対象にしていますか？",
        description: "ユーザーのメッセージ",
      }),
      chatHistory: ChatBotConversationHistorySchema.meta({
        description: "チャットの履歴",
      }),
    }),
  ),
  async (c) => {
    const { userMessage, chatHistory } = c.req.valid("json");
    try {
      // await addDemoDataToVectorStore(c.env); //NOTE: デモデータ追加（初回のみ実行）
      const response = await createChatBotResponse(
        userMessage,
        chatHistory,
        c.env,
      );
      return c.json({ response }, 200);
    } catch (e) {
      const message = e instanceof Error ? e.message : "チャットボット応答失敗";
      return c.json({ message }, 500);
    }
  },
);
export default app;
