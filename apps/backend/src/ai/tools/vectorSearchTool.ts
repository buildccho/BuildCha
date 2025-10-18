import type { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const createVectorSearchTool = (vectorStore: CloudflareVectorizeStore) =>
  tool(
    async (args: unknown) => {
      const parsed = z
        .object({
          searchQuery: z
            .string()
            .describe("ベクトルデータベースを検索するためのクエリ"),
        })
        .parse(args);
      const results = await vectorStore.similaritySearch(parsed.searchQuery, 3);
      return results.map((r) => r.pageContent);
    },
    {
      name: "vector_search",
      description:
        "ベクトルデータベースを検索して、本システムBuildchaに関する情報を取得するツール。",
      schema: z.object({
        searchQuery: z
          .string()
          .describe("ベクトルデータベースを検索するためのクエリ"),
      }),
    },
  );
