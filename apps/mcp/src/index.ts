import { StreamableHTTPTransport } from "@hono/mcp";
import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { OpenAIEmbeddings } from "@langchain/openai";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { z } from "zod";
import { getConfig } from "./config.js";
import {
  getGithubFileTool,
  githubListFilesAndFoldersTool,
} from "./tools/githubTools";
import { createVectorSearchTool } from "./tools/vectorSearchTool";

const getVectorizeStore = (env: CloudflareBindings) => {
  if (!env.VECTORIZE_INDEX) {
    throw new Error("ローカル環境ではベクトル検索は利用できません");
  }
  const { OPENAI_API_KEY } = getConfig();
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
  });
  const store = new CloudflareVectorizeStore(embeddings, {
    index: env.VECTORIZE_INDEX,
  });
  return store;
};

type BuildchaMcpServer = McpServer & {
  setVectorStore: (store: CloudflareVectorizeStore) => void;
};

/** MCPサーバーを作成する関数 */
export function createMcpServer(): BuildchaMcpServer {
  const mcpServer = new McpServer({
    name: "buildcha-mcp-server",
    version: "1.0.0",
  });
  let vectorSearchTool: ReturnType<typeof createVectorSearchTool> | null = null;

  const setVectorStore = (store: CloudflareVectorizeStore) => {
    vectorSearchTool = createVectorSearchTool(store);
  };

  mcpServer.registerTool(
    "get_github_file_tool",
    {
      title: "Get GitHub File",
      description: "GitHubリポジトリ内の特定ファイルの内容を取得するツール。",
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      inputSchema: z.object({
        path: z.string().describe("取得したいファイルのパス（例: README.md）"),
      }).shape,
      outputSchema: z.object({
        content: z.string().describe("取得したファイルの内容"),
      }).shape,
    },
    async ({ path }) => {
      const content = await getGithubFileTool.invoke({ path });
      const structuredContent = { content };
      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      };
    },
  );

  mcpServer.registerTool(
    "github_list_files_and_folders_tool",
    {
      title: "List GitHub Files and Folders",
      description:
        "GitHubリポジトリ内のファイルとフォルダの一覧をtree形式で取得するツール。",
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      inputSchema: z.object({}).shape,
      outputSchema: z.object({
        tree: z
          .string()
          .describe("リポジトリ内のファイルとフォルダの一覧（tree形式）"),
      }).shape,
    },
    async () => {
      const tree = await githubListFilesAndFoldersTool.invoke({});
      const structuredContent = { tree };
      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      };
    },
  );
  mcpServer.registerTool(
    "vector_store_tool",
    {
      title: "Vector Store Tool",
      description:
        "ベクトルデータベースを検索して、本システムBuildchaに関する情報を取得するツール。",
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
      inputSchema: z.object({
        searchQuery: z
          .string()
          .describe("ベクトルデータベースを検索するためのクエリ"),
      }).shape,
      outputSchema: z.object({
        results: z.array(z.string()).describe("検索結果のリスト"),
      }).shape,
    },
    async (args) => {
      if (!vectorSearchTool) {
        throw new Error("ベクトルストアが初期化されていません");
      }
      const results = await vectorSearchTool.invoke(args);
      const structuredContent = { results };
      return {
        content: [{ type: "text", text: JSON.stringify(structuredContent) }],
        structuredContent,
      };
    },
  );

  return Object.assign(mcpServer, { setVectorStore });
}

export function createApp(server: BuildchaMcpServer = createMcpServer()) {
  const app = new Hono<{ Bindings: CloudflareBindings }>();

  app.get("/", (c) => c.json({ status: "ok" }));

  app.all("/mcp", async (c) => {
    const vectorStore = getVectorizeStore(c.env);
    server.setVectorStore(vectorStore);
    const transport = new StreamableHTTPTransport();
    await server.connect(transport);
    return transport.handleRequest(c);
  });

  return { app, server };
}

const { app } = createApp();

export default app;
