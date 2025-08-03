//envファイルから設定を読み込む

import * as dotenv from "dotenv";
import zod from "zod";

const ConfigSchema = zod.object({
  GEMINI_API_KEY: zod.string(),
});
type Config = zod.infer<typeof ConfigSchema>;

let config: Config;

export const getConfig = () => {
  if (!config) {
    const result = dotenv.config();
    if (!result.parsed) {
      throw new Error("Failed to load environment variables");
    }
    config = ConfigSchema.parse(result.parsed);
  }

  return config;
};
