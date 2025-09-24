import { zValidator } from "@hono/zod-validator";
import type { Session, User } from "better-auth";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { z } from "zod";
import prismaClients from "./lib/prisma";

const user = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

// ユーザー情報更新のスキーマ
const UpdateUserSchema = z
  .object({
    name: z.string().min(1).optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    image: z.string().optional().or(z.literal("")),
  })
  .transform((data) => ({
    name: data.name && data.name !== "" ? data.name : undefined,
    email: data.email && data.email !== "" ? data.email : undefined,
    image: data.image && data.image !== "" ? data.image : undefined,
  }));

user
  /* ユーザー情報取得 */
  .get(
    "/",
    describeRoute({
      tags: ["User"],
      description: "ユーザー情報の取得",
      responses: {
        200: {
          description: "ユーザー情報の取得",
          content: {
            "application/json": {},
          },
        },
        401: {
          description: "認証が必要です",
        },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "ユーザーが見つかりません" }, 401);

      return c.json(
        {
          user,
        },
        200,
      );
    },
  )

  /* ユーザー情報更新 */
  .patch(
    "/",
    zValidator("json", UpdateUserSchema),
    describeRoute({
      tags: ["User"],
      description: "ユーザー情報の更新",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                image: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "ユーザー情報の更新成功",
          content: {
            "application/json": {},
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
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "認証が必要です" }, 401);

      const { name, email, image } = c.req.valid("json");

      try {
        const prisma = await prismaClients.fetch(c.env.DB);
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(image && { image }),
            updatedAt: new Date(),
          },
        });

        return c.json(
          {
            message: "ユーザー情報を更新しました",
            user: updatedUser,
          },
          200,
        );
      } catch (error) {
        console.error("ユーザー情報更新エラー:", error);
        return c.json({ message: "ユーザー情報の更新に失敗しました" }, 400);
      }
    },
  );

export default user;
