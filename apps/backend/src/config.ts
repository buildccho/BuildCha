//envファイルから設定を読み込む

import * as dotenv from "dotenv";
import zod from "zod";

const ConfigSchema = zod.object({
  OPENAI_API_KEY: zod.string(),
});
type Config = zod.infer<typeof ConfigSchema>;

let config: Config;

export const getConfig = () => {
  if (!config) {
    // Load .env if present (no-op in Azure). Always read from process.env.
    dotenv.config();
    config = ConfigSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    });
  }
  return config;
};
