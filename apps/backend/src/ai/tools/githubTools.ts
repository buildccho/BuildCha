import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getConfig } from "../../config";

const owner = "buildccho";
const repo = "BuildCha";

// 特定ファイルの内容を取得するツール
export const getGithubFileTool = tool(
  async (args) => {
    const { path } = z.object({ path: z.string() }).parse(args);
    const { GITHUB_TOKEN } = getConfig();

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "BuildChaLangChainTool/1.0",
        ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      },
    });

    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);

    const contentType = res.headers.get("Content-Type") || "";
    if (
      contentType.startsWith("text/") ||
      contentType.includes("charset=utf-8")
    ) {
      return await res.text();
    } else {
      // バイナリの場合はbase64で返す
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    }
  },
  {
    name: "github_get_file",
    description: "GitHubリポジトリ内の特定ファイルの内容を取得するツール。",
    schema: z.object({
      path: z.string().describe("取得したいファイルのパス（例: README.md）"),
    }),
  },
);

// リポジトリ全体のツリーを取得してtree形式のテキストを返すツール
export const githubListFilesAndFoldersTool = tool(
  async () => getGithubFileTool.invoke({ path: "README.md" }),
  {
    name: "github_list_files_and_folders",
    description:
      "GitHubリポジトリ内のファイルとフォルダの一覧をtree形式で取得するツール。",
  },
);
