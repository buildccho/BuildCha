import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { getConfig } from "../config";
import { ChatBotConversationHistorySchema } from "./schemas";

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

export async function createChatBotResponse(
  userMessage: string,
  chatHistory: ChatBotConversationHistorySchema,
  env: CloudflareBindings,
) {
  try {
    const { OPENAI_API_KEY, USE_OPENAI_MODEL_NAME } = getConfig();
    const model = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      model: USE_OPENAI_MODEL_NAME,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemInstruction],
      ["system", "以下は参考情報です。{context}"],
      ["user", "以下はチャットの履歴です。{history} 新しいメッセージ: {input}"],
    ]);
    const prompt = await promptTemplate.formatPromptValue({
      context: "BuildChaは、小学生を対象にした3Dオブジェクト作成アプリです。",
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
}
