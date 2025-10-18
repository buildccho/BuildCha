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
    return await res.text();
  },
  {
    name: "github_get_file",
    description: "GitHubリポジトリ内の特定ファイルの内容を取得するツール。",
    schema: z.object({
      path: z.string().describe("取得したいファイルのパス（例: README.md）"),
    }),
  },
);

// README.mdをそのまま返す簡易ツール（説明文はそのまま）
export const githubListFilesAndFoldersTool = tool(
  async () => getGithubFileTool.invoke({ path: "README.md" }),
  {
    name: "github_list_files_and_folders",
    description:
      "GitHubリポジトリ内のフォルダとファイルを再帰的に探索し、tree形式で一覧表示します。",
  },
);
