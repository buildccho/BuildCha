import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { getAnswerObjectImageUrls } from "../moc/getAnswerObject";
import { compareImages } from "../util/compareImages";
import { compareObjectInputSchema, compareObjectOutputSchema } from "./schemas";

const ErrorSchema = z.object({
  message: z.string().meta({ example: "エラーメッセージ" }),
});

const app = new Hono();

app.post(
  "/compareObject",
  describeRoute({
    description: "AIオブジェクト比較エンドポイント",
    tags: ["AI"],
    responses: {
      200: {
        description: "3Dオブジェクト比較結果",
        content: {
          "application/json": { schema: resolver(compareObjectOutputSchema) },
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
  validator("form", compareObjectInputSchema),
  async (c) => {
    const { questId, userCreatedObjectImages } = c.req.valid("form");
    const correctObjectUrls = getAnswerObjectImageUrls(questId); //TODO: ここはDBから取得するようにする
    if (!correctObjectUrls) {
      return c.json(
        { message: "正解オブジェクトが見つかりませんでした。" },
        404,
      );
    }
    const { overallScore, results } = await compareImages(
      userCreatedObjectImages,
      correctObjectUrls,
    );
    return c.json({ overallScore, results });
  },
);
