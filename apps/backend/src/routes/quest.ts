import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator } from "hono-openapi/zod";
import { z } from "zod";
import prismaClients from "../lib/prisma";
import { QuestSchema } from "../prisma/schemas";

const UpdateQuestSchema = QuestSchema.pick({
  name: true,
  level: true,
  challenge: true,
  score: true,
  difficulty: true,
}).partial();
const CreateQuestSchema = QuestSchema.pick({
  name: true,
  level: true,
  challenge: true,
  score: true,
  difficulty: true,
});

const app = new Hono<{
  Bindings: { DB: D1Database };
}>()
  .get(
    "/",
    describeRoute({
      tags: ["Quest"],
      description: "クエスト情報の一覧取得",
      responses: {
        200: {
          description: "クエスト情報の取得",
          content: {
            "application/json": { schema: resolver(z.array(QuestSchema)) },
          },
        },
      },
    }),
    async (c) => {
      const prisma = await prismaClients.fetch(c.env.DB);
      const quests = await prisma.quest.findMany();
      return c.json(quests, 200);
    },
  )
  .get(
    "/:id",
    describeRoute({
      tags: ["Quest"],
      description: "IDでクエスト情報の取得",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "クエストID",
        },
      ],
      responses: {
        200: {
          description: "クエスト情報の取得",
          content: { "application/json": { schema: resolver(QuestSchema) } },
        },
        404: {
          description: "クエストが見つかりません",
        },
      },
    }),
    async (c) => {
      const id = c.req.param("id");
      const prisma = await prismaClients.fetch(c.env.DB);
      const quest = await prisma.quest.findUnique({
        where: { id },
      });
      if (!quest) {
        return c.json({ message: "クエストが見つかりません" }, 404);
      }
      return c.json(quest, 200);
    },
  )
  .post(
    "/",
    describeRoute({
      tags: ["Quest"],
      description: "クエストの作成",
      responses: {
        200: {
          description: "クエストの作成成功",
          content: { "application/json": { schema: resolver(QuestSchema) } },
        },
        400: {
          description: "リクエストが不正です",
        },
      },
    }),
    validator("json", CreateQuestSchema),
    async (c) => {
      const prisma = await prismaClients.fetch(c.env.DB);
      const questData = c.req.valid("json");
      const newQuest = await prisma.quest.create({
        data: questData,
      });
      return c.json(newQuest, 200);
    },
  )
  .patch(
    "/:id",
    describeRoute({
      tags: ["Quest"],
      description: "クエスト情報の更新",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "クエストのID",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "クエスト情報の更新成功",
          content: { "application/json": { schema: resolver(QuestSchema) } },
        },
        400: {
          description: "リクエストが不正です",
        },
        404: {
          description: "クエストが見つかりません",
        },
      },
    }),
    validator("json", UpdateQuestSchema),
    async (c) => {
      const id = c.req.param("id");
      const questData = c.req.valid("json");
      const prisma = await prismaClients.fetch(c.env.DB);
      const existingQuest = await prisma.quest.findUnique({
        where: { id },
      });
      if (!existingQuest) {
        return c.json({ message: "クエストが見つかりません" }, 404);
      }
      const updatedQuest = await prisma.quest.update({
        where: { id },
        data: questData,
      });
      return c.json(updatedQuest, 200);
    },
  )
  .delete(
    "/:id",
    describeRoute({
      tags: ["Quest"],
      description: "クエストの削除",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "クエストのID",
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "クエストの削除成功",
        },
        404: {
          description: "クエストが見つかりません",
        },
      },
    }),
    async (c) => {
      const id = c.req.param("id");
      const prisma = await prismaClients.fetch(c.env.DB);
      const existingQuest = await prisma.quest.findUnique({
        where: { id },
      });
      if (!existingQuest) {
        return c.json({ message: "クエストが見つかりません" }, 404);
      }
      await prisma.quest.delete({
        where: { id },
      });
      return c.json({ message: "クエストが削除されました" }, 200);
    },
  );

export default app;
