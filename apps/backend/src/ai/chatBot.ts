import { CloudflareVectorizeStore } from "@langchain/cloudflare";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
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

// ベクトルデータベースに保存されているデータを消去する関数
//HACK: ここがタイムアウトしてしまう
const clearVectorStore = async (vectorizeStore: CloudflareVectorizeStore) => {
  while (true) {
    // topK を 50 に変更
    const allDocs = await vectorizeStore.similaritySearch("", 50);
    const ids = allDocs
      .map((doc) => doc.metadata.id)
      .filter((id): id is string => !!id);
    if (ids.length === 0) return;
    await vectorizeStore.delete({ ids });
  }
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
export const addDemoDataToVectorStore = async (
  env: CloudflareBindings,
  pdfFile: File,
  deleteExistDocuments: boolean,
) => {
  const vectorizeStore = getVectorizeStore(env);
  if (deleteExistDocuments) {
    await clearVectorStore(vectorizeStore);
  }
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
