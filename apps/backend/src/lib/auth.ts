import { PrismaD1 } from "@prisma/adapter-d1";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous, openAPI } from "better-auth/plugins";
import { PrismaClient } from "../../generated/prisma/client";

// Cloudflare D1を受け取り、都度Authインスタンスを作るファクトリ
export const createAuth = (db: D1Database): ReturnType<typeof betterAuth> => {
  const prisma = new PrismaClient({
    adapter: new PrismaD1(db),
  });
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "sqlite" }),
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        partitioned: true,
      },
    },
    plugins: [anonymous(), openAPI()],
  });
};
