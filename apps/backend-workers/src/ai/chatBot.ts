import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { getConfig } from "../config";
import type { ChatBotConversationHistorySchema } from "./schemas";

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

// ベクトルを検索する関数
const searchVectorStore = async (
  query: string,
  vectorizeStore: CloudflareVectorizeStore,
): Promise<string[]> => {
  const results = await vectorizeStore.similaritySearch(query, 3);
  return results.map((r) => r.pageContent);
};

const systemInstruction = `
あなたは子供向けの質問応答AIです。以下の制約条件と入力文をもとに、質問に答えてください。
参照情報を使用して答えてもよいです。

# 制約条件
- 返答は日本語で行うこと
- 返答は簡潔に行うこと
- 返答は100文字以内に収めること
- ユーザーの年齢が不明な場合、子供向けの優しい口調で答えること
- ユーザーの年齢が不明な場合、専門用語を使わずにわかりやすく説明すること
- ユーザーの年齢が不明な場合、難しい質問には「ごめんなさい、わからないよ」と答えること
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
    const vectorizeStore = getVectorizeStore(env);
    // ベクトルストアから関連情報を取得
    const contextPieces = await searchVectorStore(userMessage, vectorizeStore);
    const context = contextPieces.join("\n");

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemInstruction],
      ["system", "以下は参考情報です。{context}"],
      ["user", "以下はチャットの履歴です。{history} 新しいメッセージ: {input}"],
    ]);
    const prompt = await promptTemplate.formatPromptValue({
      context: context,
      history: chatHistory
        .map((entry) => `${entry.role}: ${entry.content}`)
        .join("\n"),
      input: userMessage,
    });
    const response = await model.invoke(prompt);
    return response.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate chat response");
  }
};
//TODO: データ追加用の関数/エンドポイントを実装
export const addDemoDataToVectorStore = async (env: CloudflareBindings) => {
  const vectorizeStore = getVectorizeStore(env);
  await vectorizeStore.addDocuments([
    {
      pageContent:
        "BuildChaは、小学生を対象にした3Dオブジェクト作成アプリです。",
      metadata: { id: "1" },
    },
    {
      pageContent:
        "BuildChaでは、簡単な操作で3Dオブジェクトを作成し、友達と共有できます。",
      metadata: { id: "2" },
    },
    {
      pageContent:
        "BuildChaは、子供たちが創造力を発揮し、3Dモデリングの基礎を学ぶのに役立ちます。",
      metadata: { id: "3" },
    },
  ]);
};
