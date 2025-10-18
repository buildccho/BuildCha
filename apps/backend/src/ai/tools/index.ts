import type { CloudflareVectorizeStore } from "@langchain/cloudflare";
import {
  getGithubFileTool,
  githubListFilesAndFoldersTool,
} from "./githubTools";
import { createVectorSearchTool } from "./vectorSearchTool";

export const createAllTools = (vectorStore: CloudflareVectorizeStore) => {
  const vectorSearchTool = createVectorSearchTool(vectorStore);

  return [vectorSearchTool, getGithubFileTool, githubListFilesAndFoldersTool];
};
