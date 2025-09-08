import { env } from "cloudflare:workers";
import { z } from "zod";

// 環境変数の型定義
export type Variables = {
  OPENAI_API_KEY: string;
  USE_OPENAI_MODEL_NAME?: string;
};

const ConfigSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  USE_OPENAI_MODEL_NAME: z.string().default("gpt-4o-mini"),
});

export type Config = z.infer<typeof ConfigSchema>;

// Cloudflare Workers用の設定取得関数
export const getConfig = (): Config => {
  return ConfigSchema.parse({
    OPENAI_API_KEY: env.OPENAI_API_KEY,
    USE_OPENAI_MODEL_NAME: env.USE_OPENAI_MODEL_NAME,
  });
};
