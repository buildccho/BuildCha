import type { User } from "better-auth";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import prismaClients from "./lib/prisma";
import { MapSchema } from "./prisma/schemas";

const UpdateMapSchema = z.object({
  name: z.string(),
});

const app = new Hono<{
  Bindings: { DB: D1Database };
  Variables: { user?: User };
}>()
  .get(
    "/",
    describeRoute({
      tags: ["Map"],
      description: "マップ情報の取得",
      responses: {
        200: {
          description: "マップ情報の取得",
          content: {
            "application/json": { schema: resolver(z.array(MapSchema)) },
          },
        },
        401: {
          description: "認証が必要です",
        },
        404: {
          description: "マップが見つかりません",
        },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "ユーザーが見つかりません" }, 401);
      }
      const prisma = await prismaClients.fetch(c.env.DB);
      const mapInfo = await prisma.map.findMany({
        where: { userId: user.id },
      });
      if (!mapInfo || mapInfo.length === 0) {
        return c.json({ message: "マップが見つかりません" }, 404);
      }
      return c.json(mapInfo, 200);
    },
  )
  .get(
    "/:id",
    describeRoute({
      tags: ["Map"],
      description: "IDでマップ情報の取得",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "マップのID",
          schema: {
            type: "string",
          },
        },
      ],
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "ユーザーが見つかりません" }, 401);
      }
      const id = c.req.param("id");
      const prisma = await prismaClients.fetch(c.env.DB);
      const mapInfo = await prisma.map.findFirst({
        where: { id, userId: user.id },
      });
      if (!mapInfo) {
        return c.json({ message: "マップが見つかりません" }, 404);
      }
      return c.json(mapInfo, 200);
    },
  )
  .post(
    "/",
    describeRoute({
      tags: ["Map"],
      description: "マップの作成",
      responses: {
        200: {
          description: "マップの作成成功",
          content: {
            "application/json": { schema: resolver(MapSchema) },
          },
        },
        401: {
          description: "認証が必要です",
        },
        400: {
          description: "リクエストが不正です",
        },
      },
    }),
    validator("json", z.object({ name: z.string() })),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);
      const { name } = c.req.valid("json");
      const prisma = await prismaClients.fetch(c.env.DB);
      const newMap = await prisma.map.create({
        data: {
          name,
          userId: user.id,
        },
      });
      return c.json(newMap, 200);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      tags: ["Map"],
      description: "マップ情報の更新",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "マップのID",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "マップ情報の更新成功",
          content: {
            "application/json": { schema: resolver(MapSchema) },
          },
        },
        401: {
          description: "認証が必要です",
        },
        400: {
          description: "リクエストが不正です",
        },
        404: {
          description: "マップが見つかりません",
        },
      },
    }),
    validator("json", UpdateMapSchema),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);
      const id = c.req.param("id");
      const { name } = c.req.valid("json");
      const prisma = await prismaClients.fetch(c.env.DB);
      const mapInfo = await prisma.map.findFirst({
        where: { id, userId: user.id },
      });
      if (!mapInfo) {
        return c.json({ message: "マップが見つかりません" }, 404);
      }
      const updatedMap = await prisma.map.update({
        where: { id },
        data: { name },
      });
      return c.json(updatedMap, 200);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      tags: ["Map"],
      description: "マップの削除",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "マップのID",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "マップの削除成功",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
              },
            },
          },
        },
        401: {
          description: "認証が必要です",
        },
        404: {
          description: "マップが見つかりません",
        },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user)
        return c.json(
          {
            message: "認証が必要です",
          },
          401,
        );
      const id = c.req.param("id");
      const prisma = await prismaClients.fetch(c.env.DB);
      const mapInfo = await prisma.map.findFirst({
        where: { id, userId: user.id },
      });
      if (!mapInfo) {
        return c.json({ message: "マップが見つかりません" }, 404);
      }
      await prisma.map.delete({
        where: { id },
      });
      return c.json({ message: "マップが削除されました" }, 200);
    },
  );

export default app;
