import { PrismaD1 } from "@prisma/adapter-d1";
import type { User } from "better-auth";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import { PrismaClient } from "../generated/prisma/client";
import prismaClients from "./lib/prisma";
import { UserSchema } from "./prisma/schemas";

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  image: z.url().optional(),
});

const app = new Hono<{
  Bindings: { DB: D1Database };
  Variables: { user?: User };
}>()
  .get(
    "/",
    describeRoute({
      tags: ["User"],
      description: "ユーザー情報の取得",
      responses: {
        200: {
          description: "ユーザー情報の取得",
          content: {
            "application/json": { schema: resolver(UserSchema) },
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
        return c.json({ message: "ユーザーが見つかりません" }, 401);
      }
      const prisma = await prismaClients.fetch(c.env.DB);
      const userInfo = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (!userInfo) {
        return c.json({ message: "ユーザーが見つかりません" }, 401);
      }
      return c.json(userInfo, 200);
    },
  )
  /* ユーザー情報更新 */
  .patch(
    "/",
    describeRoute({
      tags: ["User"],
      description: "ユーザー情報の更新",
      responses: {
        200: {
          description: "ユーザー情報の更新成功",
          content: {
            "application/json": { schema: resolver(UserSchema) },
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
    validator("json", UpdateUserSchema),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);

      const body = c.req.valid("json");
      try {
        const prisma = await prismaClients.fetch(c.env.DB);
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.image !== undefined && { imageUrl: body.image }),
          },
        });
        return c.json(updatedUser, 200);
      } catch (error) {
        console.error("ユーザー情報更新エラー:", error);
        return c.json({ message: "ユーザー情報の更新に失敗しました" }, 400);
      }
    },
  );

export default app;
