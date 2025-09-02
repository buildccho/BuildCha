//envファイルから設定を読み込む

import * as dotenv from "dotenv";
import zod from "zod";

const ConfigSchema = zod.object({
  OPENAI_API_KEY: zod.string(),
  USE_OPENAI_MODEL: zod.string().default("gpt-4o-mini"),
});
type Config = zod.infer<typeof ConfigSchema>;

let config: Config;

export const getConfig = () => {
  if (!config) {
    dotenv.config();
    config = ConfigSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      USE_OPENAI_MODEL: process.env.USE_OPENAI_MODEL,
    });
  }
  return config;
};
