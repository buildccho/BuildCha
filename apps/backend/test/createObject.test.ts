import * as fs from "node:fs";
import { compareImages } from "../src/ai/compareImages";
import { getConfig } from "../src/config";
import { getAnswerObjectImageUrls } from "../src/moc/getAnswerObject";

let FileCtor: typeof File;
try {
  FileCtor = File;
} catch {
  FileCtor = require("undici").File;
}

jest.setTimeout(240000);

// 環境変数が正しく設定されているかを確認するテスト
describe("環境変数の設定", () => {
  test("OPENAI_API_KEYが定義されていること", () => {
    const config = getConfig();
    expect(config.OPENAI_API_KEY).toBeDefined();
  });
});

describe("データベースから正解オブジェクトのURLが取得できること", () => {
  test("正解オブジェクトのURLが取得できる", async () => {
    const urls = await getAnswerObjectImageUrls("ABC");
    expect(urls).toBeDefined();
    expect(Object.values(urls).filter(Boolean).length).toBeGreaterThan(0);
  }, 10000);
});

describe("画像比較", () => {
  // 比較用の画像をダウンロードして保存
  beforeAll(async () => {
    const downLoadImageUrl =
      "https://www.silhouette-illust.com/wp-content/uploads/2016/11/15878-600x600.jpg";
    const response = await fetch(downLoadImageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.mkdirSync("./testImage", { recursive: true });
    fs.writeFileSync("./testImage/test_a.png", buffer);
  });

  afterAll(() => {
    fs.rmSync("./testImage", { recursive: true, force: true });
  });

  test("オブジェクト比較ができること", async () => {
    const answerObjectUrls = await getAnswerObjectImageUrls("ABC");
    const testImagePath = "./testImage/test_a.png";
    const buffer = fs.readFileSync(testImagePath);
    const file = new FileCtor([new Uint8Array(buffer)], "test_a.png", {
      type: "image/png",
    });

    const testImageUrlObj: { [key: string]: File } = {
      topView: file,
      frontView: file,
      backView: file,
      bottomView: file,
      leftView: file,
      rightView: file,
    };

    const { score, results } = await compareImages(
      testImageUrlObj,
      answerObjectUrls,
    );
    console.log("平均値:", score);
    console.log("詳細結果:", JSON.stringify(results, null, 2));

    expect(results).toBeDefined();
    expect(score).toBeGreaterThan(0);
  }, 240000);
});
