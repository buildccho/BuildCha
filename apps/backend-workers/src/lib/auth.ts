import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous } from "better-auth/plugins";

// Cloudflare D1を受け取り、都度Authインスタンスを作るファクトリ
export const createAuth = (db: D1Database) => {
  const prisma = new PrismaClient({
    adapter: new PrismaD1(db),
  });
  return betterAuth({
    database: prismaAdapter(prisma, { provider: "sqlite" }),
    plugins: [anonymous()],
  });
};
