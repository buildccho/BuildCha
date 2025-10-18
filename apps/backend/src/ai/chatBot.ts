import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { AIMessage } from "@langchain/core/messages";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getConfig } from "../config";
import type { ChatBotConversationHistorySchema } from "./schemas";
import { createAllTools } from "./tools/index";

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

const systemInstruction = `
あなたは子供向けの質問応答AIです。以下の制約条件と入力文をもとに、質問に答えてください。

# 利用可能なツール
あなたは以下のツールを使用できます:
- ベクトル検索ツール: プロジェクトのドキュメントやコードから情報を検索
- GitHubツール: リポジトリのコードやファイルを検索

質問に答えるために必要な情報が不足している場合は、必ずツールを使用して情報を取得してください。

# 制約条件
- 返答は日本語で行うこと
- 返答は簡潔に行うこと
- 返答は100文字以内に収めること
- ユーザーの年齢が不明な場合、子供向けの優しい口調で答えること
- ユーザーの年齢が不明な場合、専門用語を使わずにわかりやすく説明すること
- プロジェクトに関する技術的な質問には、ツールを使用して正確な情報を提供すること

# プロジェクトのプログラムに関する回答方法
- githubListFilesAndFoldersToolを使用して、フォルダやファイルの一覧を取得し、コードの構造を把握してください
- その一覧から目的のファイルを見つけたら、getGithubFileToolを使用してそのファイルの内容を取得してください
- 取得したコードをもとに、ユーザーの質問に答えてください

# プロジェクトのドキュメントに関する回答方法
- ベクトル検索ツールを使用して、関連するドキュメントを検索してください
- 検索結果から必要な情報を抽出し、ユーザーの質問に答えてください

`;

export const createChatBotResponse = async (
  userMessage: string,
  chatHistory: ChatBotConversationHistorySchema,
  env: CloudflareBindings,
) => {
  try {
    const { OPENAI_API_KEY, USE_OPENAI_MODEL_NAME } = getConfig();
    const model = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      model: USE_OPENAI_MODEL_NAME,
    });
    const tools = createAllTools(getVectorizeStore(env));

    const llmWithTools = model.bindTools(tools);

    async function llmCall(state: typeof MessagesAnnotation.State) {
      const result = await llmWithTools.invoke([
        {
          role: "system",
          content: systemInstruction,
        },
        ...state.messages,
      ]);

      return {
        messages: [result],
      };
    }

    const toolNode = new ToolNode(tools);

    function shouldContinue(state: typeof MessagesAnnotation.State) {
      const messages = state.messages;
      const lastMessage = messages.at(-1);

      if (
        lastMessage instanceof AIMessage &&
        (lastMessage.tool_calls?.length ?? 0) > 0
      ) {
        return "toolNode";
      }
      return "__end__";
    }

    const agentBuilder = new StateGraph(MessagesAnnotation)
      .addNode("llmCall", llmCall)
      .addNode("toolNode", toolNode)
      .addEdge("__start__", "llmCall")
      .addConditionalEdges("llmCall", shouldContinue, ["toolNode", "__end__"])
      .addEdge("toolNode", "llmCall")
      .compile();

    const messages = [
      ...chatHistory.map((entry) => ({
        role: entry.role as "user" | "assistant",
        content: entry.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const result = await agentBuilder.invoke({ messages });
    return result.messages;
  } catch (error) {
    throw new Error(
      "チャットボットの応答生成中にエラーが発生しました: " +
        (error as Error).message,
    );
  }
};

export const addDemoDataToVectorStore = async (
  env: CloudflareBindings,
  pdfFile: File,
) => {
  const vectorizeStore = getVectorizeStore(env);
  const pdfLoader = new WebPDFLoader(pdfFile, {
    splitPages: true,
    pdfjs: () => import("pdfjs-serverless"),
  });
  const docs = await pdfLoader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 50,
  });
  const splitDocs = await textSplitter.splitDocuments(docs);

  // metadataの値がオブジェクトの場合は文字列化し、プリミティブ型のみを許可
  const flatDocs = splitDocs.map((doc) => ({
    ...doc,
    metadata: Object.fromEntries(
      Object.entries(doc.metadata || {}).map(([k, v]) => [
        k,
        typeof v === "object" && v !== null ? JSON.stringify(v) : v,
      ]),
    ),
  }));

  await vectorizeStore.addDocuments(flatDocs);
};
