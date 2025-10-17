import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { validator } from "hono-openapi/zod";
import { z } from "zod";

const app = new Hono<{
  Bindings: { BUCKET: R2Bucket };
}>().post(
  "/upload/:path",
  describeRoute({
    tags: ["R2"],
    responses: {
      200: {
        description: "ファイルアップロード成功",
      },
      400: {
        description: "ファイルアップロード失敗",
      },
    },
  }),
  validator(
    "form",
    z.object({
      files: z
        .array(z.file().mime("image/png", "image/jpeg"))
        .min(1)
        .meta({
          description: "アップロードする画像ファイル",
          example: ["image1.png", "image2.jpg"],
        }),
    }),
  ),
  async (c) => {
    const { files } = c.req.valid("form");
    const path = c.req.param("path");
    const promises = files.map(async (file) => {
      const key = `${path}/${file.name}`;
      const result = await c.env.BUCKET.put(key, file);
      return { key, result };
    });
    await Promise.all(promises);
    return c.json({ message: "ファイルアップロード成功" });
  },
);
export default app;
