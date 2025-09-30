import type { User } from "better-auth";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import prismaClients from "./lib/prisma";
import { UserObjectSchema } from "./prisma/schemas";

// JSON配列型の定義（position, rotation, boundingBox用）
const JsonNumberArray = z.union([
  z
    .string()
    .transform((s) => JSON.parse(s))
    .pipe(z.array(z.number())),
  z.array(z.number()),
]);

// 作成用スキーマ
const CreateUserObjectSchema = z.object({
  name: z.string(),
  questId: z.string(),
  mapId: z.string(),
  position: z.array(z.number()).length(3),
  rotation: z.array(z.number()).length(3),
  boundingBox: z.array(z.number()).length(3),
  objectPrecision: z.number(),
});

// 更新用スキーマ
const UpdateUserObjectSchema = z
  .object({
    name: z.string(),
    position: z.array(z.number()).length(3),
    rotation: z.array(z.number()).length(3),
    boundingBox: z.array(z.number()).length(3),
    objectPrecision: z.number(),
  })
  .partial();

const app = new Hono<{
  Bindings: { DB: D1Database };
  Variables: { user?: User };
}>()
  .get(
    "/",
    describeRoute({
      tags: ["GameObject"],
      description: "ユーザーオブジェクト一覧の取得",
      responses: {
        200: {
          description: "ユーザーオブジェクト一覧の取得",
          content: {
            "application/json": { schema: resolver(z.array(UserObjectSchema)) },
          },
        },
        401: {
          description: "認証が必要です",
        },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "認証が必要です" }, 401);
      }
      const prisma = await prismaClients.fetch(c.env.DB);
      const userObjects = await prisma.userObject.findMany({
        where: { userId: user.id },
        include: {
          chatHistory: true,
          parts: true,
        },
      });
      return c.json(userObjects, 200);
    },
  )
  .get(
    "/:id",
    describeRoute({
      tags: ["GameObject"],
      description: "IDでユーザーオブジェクトの取得",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "ユーザーオブジェクトID",
        },
      ],
      responses: {
        200: {
          description: "ユーザーオブジェクトの取得",
          content: {
            "application/json": { schema: resolver(UserObjectSchema) },
          },
        },
        401: {
          description: "認証が必要です",
        },
        404: {
          description: "オブジェクトが見つかりません",
        },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "認証が必要です" }, 401);
      }
      const id = c.req.param("id");
      const prisma = await prismaClients.fetch(c.env.DB);
      const userObject = await prisma.userObject.findFirst({
        where: { id, userId: user.id },
        include: {
          chatHistory: true,
          parts: true,
        },
      });
      if (!userObject) {
        return c.json({ message: "オブジェクトが見つかりません" }, 404);
      }
      return c.json(userObject, 200);
    },
  )
  .post(
    "/",
    describeRoute({
      tags: ["GameObject"],
      description: "ユーザーオブジェクトの作成",
      responses: {
        200: {
          description: "ユーザーオブジェクトの作成成功",
          content: {
            "application/json": { schema: resolver(UserObjectSchema) },
          },
        },
        400: {
          description: "リクエストが不正です",
        },
        401: {
          description: "認証が必要です",
        },
      },
    }),
    validator("json", CreateUserObjectSchema),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);

      const data = c.req.valid("json");
      const prisma = await prismaClients.fetch(c.env.DB);

      try {
        const newObject = await prisma.userObject.create({
          data: {
            name: data.name,
            userId: user.id,
            questId: data.questId,
            mapId: data.mapId,
            position: JSON.stringify(data.position),
            rotation: JSON.stringify(data.rotation),
            boundingBox: JSON.stringify(data.boundingBox),
            objectPrecision: data.objectPrecision,
          },
          include: {
            chatHistory: true,
            parts: true,
          },
        });
        return c.json(newObject, 200);
      } catch (error) {
        console.error("オブジェクト作成エラー:", error);
        return c.json({ message: "オブジェクトの作成に失敗しました" }, 400);
      }
    },
  )
  .patch(
    "/:id",
    describeRoute({
      tags: ["GameObject"],
      description: "ユーザーオブジェクト情報の更新",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ユーザーオブジェクトのID",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "ユーザーオブジェクト情報の更新成功",
          content: {
            "application/json": { schema: resolver(UserObjectSchema) },
          },
        },
        400: {
          description: "リクエストが不正です",
        },
        401: {
          description: "認証が必要です",
        },
        404: {
          description: "オブジェクトが見つかりません",
        },
      },
    }),
    validator("json", UpdateUserObjectSchema),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);

      const id = c.req.param("id");
      const data = c.req.valid("json");
      const prisma = await prismaClients.fetch(c.env.DB);

      const existingObject = await prisma.userObject.findFirst({
        where: { id, userId: user.id },
      });
      if (!existingObject) {
        return c.json({ message: "オブジェクトが見つかりません" }, 404);
      }

      try {
        const updatedObject = await prisma.userObject.update({
          where: { id },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.position !== undefined && {
              position: JSON.stringify(data.position),
            }),
            ...(data.rotation !== undefined && {
              rotation: JSON.stringify(data.rotation),
            }),
            ...(data.boundingBox !== undefined && {
              boundingBox: JSON.stringify(data.boundingBox),
            }),
            ...(data.objectPrecision !== undefined && {
              objectPrecision: data.objectPrecision,
            }),
          },
          include: {
            chatHistory: true,
            parts: true,
          },
        });
        return c.json(updatedObject, 200);
      } catch (error) {
        console.error("オブジェクト更新エラー:", error);
        return c.json({ message: "オブジェクトの更新に失敗しました" }, 400);
      }
    },
  )
  .delete(
    "/:id",
    describeRoute({
      tags: ["GameObject"],
      description: "ユーザーオブジェクトの削除",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ユーザーオブジェクトのID",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "ユーザーオブジェクトの削除成功",
        },
        401: {
          description: "認証が必要です",
        },
        404: {
          description: "オブジェクトが見つかりません",
        },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);

      const id = c.req.param("id");
      const prisma = await prismaClients.fetch(c.env.DB);

      const existingObject = await prisma.userObject.findFirst({
        where: { id, userId: user.id },
      });
      if (!existingObject) {
        return c.json({ message: "オブジェクトが見つかりません" }, 404);
      }

      await prisma.userObject.delete({
        where: { id },
      });
      return c.json({ message: "オブジェクトが削除されました" }, 200);
    },
  );

export default app;
