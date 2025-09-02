import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { compareObjectOutputSchema } from "../ai/schemas";
import { getConfig } from "../config";

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
  correctObjectUrls: { [key: string]: string },
) => {
  const results: {
    [view: string]: { score: number; comment: string };
  } = {};
  for (const view of Object.keys(userObjectImages)) {
    try {
      const userFile = userObjectImages[view];
      const correctUrl = correctObjectUrls[view];
      if (!userFile || !correctUrl) {
        results[view] = { score: 0, comment: "画像が不足しています" };
        continue;
      }
      const userDataUrl = await blobLikeToDataUrl(userFile);
      const correctBlob = await fetch(correctUrl).then((r) => r.blob());
      const correctDataUrl = await blobLikeToDataUrl(correctBlob);

      results[view] = await compareTwoImages(userDataUrl, correctDataUrl);
    } catch (_e) {
      results[view] = {
        score: 0,
        comment: "比較中にエラーが発生しました",
      };
    }
  }

  const scores = Object.values(results).map((r) => r.score);
  const overallScore =
    scores.length === 0
      ? 0
      : Math.round(scores.reduce((acc, cur) => acc + cur, 0) / scores.length);

  return { overallScore, results };
};

const compareTwoImages = async (
  userDataUrl: string,
  correctDataUrl: string,
): Promise<{ score: number; comment: string }> => {
  try {
    const { OPENAI_API_KEY, USE_OPENAI_MODEL } = getConfig();

    const model = new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      model: USE_OPENAI_MODEL,
    });
    const ai = model.withStructuredOutput(compareObjectOutputSchema);

    const res = await ai.invoke([
      new SystemMessage(systemInstruction),
      new HumanMessage({
        content: [
          { type: "text", text: "次の2枚の画像を比較してください。" },
          { type: "image_url", image_url: { url: userDataUrl } },
          { type: "image_url", image_url: { url: correctDataUrl } },
        ],
      }),
    ]);
    return {
      score: Number(res.score),
      comment: String(res.comment),
    };
  } catch (_e) {
    throw new Error("Failed to compare images");
  }
};

// Blob/File を Base64 data URL に変換
const blobLikeToDataUrl = async (blobLike: Blob | File): Promise<string> => {
  const hasFileReader =
    typeof (globalThis as { FileReader?: unknown }).FileReader !== "undefined";
  if (hasFileReader) {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blobLike);
    });
    return base64;
  }
  const ab = await (blobLike as Blob).arrayBuffer();
  const buf = Buffer.from(ab);
  const mime = (blobLike as Blob).type || "application/octet-stream";
  const b64 = buf.toString("base64");
  return `data:${mime};base64,${b64}`;
};
