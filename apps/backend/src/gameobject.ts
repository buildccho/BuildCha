import type { User } from "better-auth";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import prismaClients from "./lib/prisma";
import { JsonNumberArray, UserObjectSchema } from "./prisma/schemas";

// 作成用スキーマ
const CreateUserObjectSchema = z.object({
  name: z.string(),
  questId: z.string(),
  mapId: z.string(),
  position: z.array(z.number()).length(3), // 3D座標 (x, y, z) のみ許可
  rotation: z.array(z.number()).length(3), // 同上
  boundingBox: z.array(z.number()).length(6), // AABBなら[minX, minY, minZ, maxX, maxY, maxZ]
  objectPrecision: z.number(),
});

// 更新用スキーマ
const UpdateUserObjectSchema = z
  .object({
    name: z.string(),
    position: z.array(z.number()).length(3),
    rotation: z.array(z.number()).length(3),
    boundingBox: z.array(z.number()).length(6),
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
        // 1. クエストの存在確認
        const quest = await prisma.quest.findUnique({
          where: { id: data.questId },
        });
        if (!quest) {
          return c.json({ message: "指定されたクエストが見つかりません" }, 400);
        }

        // 2. マップの存在確認（ユーザー所有チェック込み）
        const map = await prisma.map.findFirst({
          where: { id: data.mapId, userId: user.id },
        });
        if (!map) {
          return c.json(
            {
              message:
                "指定されたマップが見つからないか、アクセス権限がありません",
            },
            400,
          );
        }

        // 3. オブジェクト作成
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

        // Prismaエラーの詳細チェック
        if (error && typeof error === "object" && "code" in error) {
          switch (error.code) {
            case "P2002":
              return c.json({ message: "重複したデータが存在します" }, 400);
            case "P2003":
              return c.json({ message: "関連するデータが見つかりません" }, 400);
            case "P2025":
              return c.json({ message: "必要なデータが見つかりません" }, 404);
            default:
              return c.json(
                { message: "データベースエラーが発生しました" },
                500,
              );
          }
        }

        return c.json({ message: "オブジェクトの作成に失敗しました" }, 500);
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

        // Prismaエラーの詳細チェック
        if (error && typeof error === "object" && "code" in error) {
          switch ((error as any).code) {
            case "P2002":
              return c.json({ message: "重複したデータが存在します" }, 400);
            case "P2003":
              return c.json({ message: "関連するデータが見つかりません" }, 400);
            case "P2025":
              return c.json({ message: "必要なデータが見つかりません" }, 404);
            default:
              return c.json(
                { message: "データベースエラーが発生しました" },
                500,
              );
          }
        }

        return c.json({ message: "オブジェクトの更新に失敗しました" }, 500);
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

      try {
        await prisma.userObject.delete({
          where: { id },
        });
        return c.json({ message: "オブジェクトが削除されました" }, 200);
      } catch (error) {
        console.error("オブジェクト削除エラー:", error);
        if (error && typeof error === "object" && "code" in error) {
          switch ((error as any).code) {
            case "P2003":
              return c.json(
                { message: "関連するデータが存在するため削除できません" },
                400,
              );
            case "P2025":
              return c.json({ message: "オブジェクトが見つかりません" }, 404);
            default:
              return c.json(
                { message: "データベースエラーが発生しました" },
                500,
              );
          }
        }
        return c.json({ message: "オブジェクトの削除に失敗しました" }, 500);
      }
    },
  );

export default app;
