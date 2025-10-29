import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type { User } from "better-auth";
import { PrismaClient } from "../../generated/prisma/client";
import { getConfig } from "../config";
import prismaClients from "../lib/prisma";
import { CompareObjectOutputSchema } from "./schemas";

const systemInstruction = `
あなたは優秀な3Dオブジェクト比較AIです。  
入力として、同じ方向から撮影された2枚の写真が与えられます。  
- 1枚目は「ユーザが作成したオブジェクト」  
- 2枚目は「正解オブジェクト」  

あなたの役割は、これら2枚を比較し、以下のルールで出力することです。  

# 出力仕様
- 必ず **JSON形式** のみを返す
- フォーマット: {"score": number, "comment": string}
- score: 0〜100 の整数値。ユーザ作成物が正解オブジェクトにどれだけ近いかを示す
- comment: その方向における比較の総評コメント（1〜3文程度）

# 比較観点
- 形状やシルエットが正解と一致しているか
- 視点（上・下・右・左・前・後）が一致しているか
- 色や質感が近いか
- 相違点があれば短く明示する
`;
//NOTE: userObjectImagesはFileオブジェクトの連想配列、correctObjectUrlsはWebURLの連想配列
export const compareImages = async (
  userObjectImages: { [key: string]: File },
  answerObjectImages: { [key: string]: File },
  d1Database: D1Database,
  user: User,
  objectId: string,
  questId: string,
) => {
  const views = Object.keys(userObjectImages);
  const results: {
    [view: string]: { score: number; comment: string };
  } = {};

  await Promise.all(
    views.map(async (view) => {
      try {
        const userFile = userObjectImages[view];
        const answerFile = answerObjectImages[view];
        if (!userFile || !answerFile) {
          results[view] = { score: 0, comment: "画像が不足しています" };
          return;
        }
        const userDataUrl = await blobLikeToDataUrl(userFile);
        const answerDataUrl = await blobLikeToDataUrl(answerFile);
        results[view] = await compareTwoImages(userDataUrl, answerDataUrl);
      } catch (_e) {
        results[view] = {
          score: 0,
          comment: "比較中にエラーが発生しました",
        };
      }
    }),
  );

  const scores = Object.values(results).map((r) => r.score);
  const overallScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((acc, cur) => acc + cur, 0) / scores.length);
  const prisma = await prismaClients.fetch(d1Database);
  await saveObjectScoreToD1(prisma, user.id, overallScore, objectId);
  const { user_level, user_score } = await updateUserLevelAndScoreToD1(
    prisma,
    user.id,
    overallScore,
    questId,
  );
  const model = new ChatOpenAI({
    apiKey: getConfig().OPENAI_API_KEY,
    model: "gpt-4.1-mini",
  });
  const comments = Object.values(results)
    .map((r) => r.comment)
    .join("\n");
  const summaryAi = await model.invoke([
    new SystemMessage("あなたは優秀な要約AIです。"),
    new HumanMessage({
      content: `以下は、6つの視点からの3Dオブジェクト比較コメントです。これらを参考にして、全体の総評コメントを1〜3文で作成してください。出力は、小学生低学年にも分かりやすいかんたんな日本語で行ってください。例：「ちがっているかしょがあるよ」，「もっと工夫しようね！！」，「もっと改良しよう！！」\n\n${comments}`,
    }),
  ]);
  const comment = summaryAi.content;
  return { object_score: overallScore, comment, user_level, user_score };
};

const compareTwoImages = async (
  userDataUrl: string,
  answerDataUrl: string,
): Promise<{ score: number; comment: string }> => {
  try {
    const { OPENAI_API_KEY } = getConfig();
    const model = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      model: "gpt-4.1-mini",
      maxTokens: 256,
    });
    const ai = model.withStructuredOutput(CompareObjectOutputSchema);

    const res = await ai.invoke([
      new SystemMessage(systemInstruction),
      new HumanMessage({
        content: [
          { type: "text", text: "次の2枚の画像を比較してください。" },
          { type: "image_url", image_url: { url: userDataUrl } },
          { type: "image_url", image_url: { url: answerDataUrl } },
        ],
      }),
    ]);
    return {
      score: Number(res.user_score),
      comment: String(res.comment),
    };
  } catch (_e) {
    throw new Error("Failed to compare images");
  }
};

// Blob/File を Base64 data URL に変換
const blobLikeToDataUrl = async (blobLike: Blob | File): Promise<string> => {
  const ab = await (blobLike as Blob).arrayBuffer();
  const buf = Buffer.from(ab);
  const mime = (blobLike as Blob).type || "application/octet-stream";
  const b64 = buf.toString("base64");
  return `data:${mime};base64,${b64}`;
};

// オブジェクト適合率をD1に保存する
const saveObjectScoreToD1 = async (
  prisma: PrismaClient,
  userId: string,
  precision: number,
  objectId: string,
) => {
  const existingObject = await prisma.userObject.findFirst({
    where: { id: objectId, userId: userId },
  });
  if (!existingObject) {
    throw new Error("オブジェクトが見つかりません");
  }
  await prisma.userObject.update({
    where: { id: objectId, userId: userId },
    data: {
      objectPrecision: precision,
    },
  });
};

// levelとscoreを設定する
const updateUserLevelAndScoreToD1 = async (
  prisma: PrismaClient,
  userId: string,
  precision: number,
  questId: string,
) => {
  const userInfo = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userInfo) {
    throw new Error("ユーザーが見つかりません");
  }

  const questObject = await prisma.quest.findFirst({
    where: { id: questId },
  });
  if (!questObject) {
    throw new Error("クエストが見つかりません");
  }
  const nowUserScore = userInfo.score || 0;
  const updateScore =
    nowUserScore + Math.floor(questObject.score * (precision / 100));
  const updateLevel = Math.floor(0.02 * updateScore);

  const updateUserInfo = await prisma.user.update({
    where: { id: userId },
    data: {
      score: updateScore,
      level: updateLevel,
    },
  });

  return { user_level: updateLevel, user_score: updateScore };
};
