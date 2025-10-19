import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { addDemoDataToVectorStore, createChatBotResponse } from "./chatBot";
import { compareImages } from "./compareImages";
import { create3DObjectFromMessage } from "./create3DObject";
import {
  AddDocumentsInputSchema,
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

const app = new Hono<{ Bindings: CloudflareBindings }>()
  .post(
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
        const message =
          e instanceof Error ? e.message : "3Dオブジェクト生成失敗";
        return c.json({ message }, 500);
      }
    },
  )

  .post(
    "/compareObject/:questId",
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
      const { topView, bottomView, leftView, rightView, frontView, backView } =
        c.req.valid("form");
      const questId = c.req.param("questId");
      const {
        answerTopView,
        answerBottomView,
        answerLeftView,
        answerRightView,
        answerFrontView,
        answerBackView,
      } = await getAnswerImageFromR2(c.env, questId);
      const { score, results } = await compareImages(
        {
          topView: topView as File,
          bottomView: bottomView as File,
          leftView: leftView as File,
          rightView: rightView as File,
          frontView: frontView as File,
          backView: backView as File,
        },
        {
          topView: answerTopView as File,
          bottomView: answerBottomView as File,
          leftView: answerLeftView as File,
          rightView: answerRightView as File,
          frontView: answerFrontView as File,
          backView: answerBackView as File,
        },
      );
      return c.json({ score, results });
    },
  )
  .post(
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
        const message =
          e instanceof Error ? e.message : "チャットボット応答失敗";
        return c.json({ message }, 500);
      }
    },
  )
  .post(
    // ベクトルストアにデータを追加するためのエンドポイント（管理者用）
    "/addDocuments",
    describeRoute({
      description: "ベクトルストアにPDFドキュメントを追加するエンドポイント",
      tags: ["AI"],
      responses: {
        200: {
          description: "ドキュメント追加成功",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  message: z.string().meta({ example: "ドキュメント追加成功" }),
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
    validator("form", AddDocumentsInputSchema),
    async (c) => {
      const { pdfFile } = c.req.valid("form");
      try {
        await addDemoDataToVectorStore(c.env, pdfFile as File); //NOTE: formはstringで受け取るため"true"と比較
        return c.json({ message: "ドキュメント追加成功" }, 200);
      } catch (e) {
        const message = e instanceof Error ? e.message : "ドキュメント追加失敗";
        return c.json({ message }, 500);
      }
    },
  );

const getAnswerImageFromR2 = async (
  env: CloudflareBindings,
  questId: string,
): Promise<Record<string, File | null>> => {
  try {
    const bucket = env.BUCKET;

    const views = [
      { key: "answerTopView", path: `objectImages/topView/${questId}.png` },
      {
        key: "answerBottomView",
        path: `objectImages/bottomView/${questId}.png`,
      },
      { key: "answerLeftView", path: `objectImages/leftView/${questId}.png` },
      { key: "answerRightView", path: `objectImages/rightView/${questId}.png` },
      { key: "answerFrontView", path: `objectImages/frontView/${questId}.png` },
      { key: "answerBackView", path: `objectImages/backView/${questId}.png` },
    ];
    const objectPromises = views.map((v) => bucket.get(v.path));
    const objects = await Promise.all(objectPromises);

    const result: Record<string, File | null> = {};

    await Promise.all(
      objects.map(async (obj, idx) => {
        const viewInfo = views[idx];
        if (obj === null) {
          throw new Error(
            `R2に正解画像が存在しません (path: ${viewInfo.path})`,
          );
        } else {
          const blob = await obj.blob();
          const filename = `${questId}_${viewInfo.key}.png`;
          const file = new File([blob], filename, {
            type: blob.type || "image/png",
          });
          result[viewInfo.key] = file;
        }
      }),
    );
    return result;
  } catch (error) {
    throw new Error(
      `R2から正解画像の取得に失敗しました (questId: ${questId}): ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
export default app;
