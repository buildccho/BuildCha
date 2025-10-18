import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";

const ErrorSchema = z.object({
  message: z.string().meta({ example: "エラーメッセージ" }),
});

const uploadFunction = (image: File, path: string) => {
  const key = `${path}/${image.name}`;
  return env.BUCKET.put(key, image);
};

const app = new Hono<{
  Bindings: CloudflareBindings;
}>().post(
  "/objectImages",
  describeRoute({
    description: "3Dオブジェクト画像アップロードエンドポイント",
    tags: ["R2"],
    responses: {
      200: {
        description: "アップロード成功",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                message: z.string().meta({ example: "アップロード成功" }),
              }),
            ),
          },
        },
      },
      400: {
        description: "バリデーションエラー",
        content: {
          "application/json": {
            schema: resolver(ErrorSchema),
          },
        },
      },
      500: {
        description: "サーバーエラー",
        content: {
          "application/json": {
            schema: resolver(ErrorSchema),
          },
        },
      },
    },
  }),
  validator(
    "form",
    z.object({
      topView: z.file().mime("image/png").meta({ example: "上面画像" }),
      bottomView: z.file().mime("image/png").meta({ example: "下面画像" }),
      leftView: z.file().mime("image/png").meta({ example: "左面画像" }),
      rightView: z.file().mime("image/png").meta({ example: "右面画像" }),
      frontView: z.file().mime("image/png").meta({ example: "前面画像" }),
      backView: z.file().mime("image/png").meta({ example: "背面画像" }),
    }),
  ),
  async (c) => {
    try {
      const { topView, bottomView, leftView, rightView, frontView, backView } =
        c.req.valid("form");
      //NOTE: 6枚同時だとタイムアウトする可能性があるため、3枚ずつに分けてアップロード
      await Promise.all([
        uploadFunction(topView as File, "objectImages/topView"),
        uploadFunction(bottomView as File, "objectImages/bottomView"),
        uploadFunction(leftView as File, "objectImages/leftView"),
      ]);
      await Promise.all([
        uploadFunction(rightView as File, "objectImages/rightView"),
        uploadFunction(frontView as File, "objectImages/frontView"),
        uploadFunction(backView as File, "objectImages/backView"),
      ]);
      return c.json({ message: "アップロード成功" }, 200);
    } catch (error) {
      console.error("アップロードエラー:", error);
      return c.json({ message: "サーバーエラーが発生しました。" }, 500);
    }
  },
);

export default app;
