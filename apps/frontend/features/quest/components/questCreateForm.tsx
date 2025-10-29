"use client";
import Image from "next/image";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ResultObject, {
  type ResultObjectHandle,
} from "@/features/world3d/components/resultObject";
import { client } from "@/lib/rpc-client";
import { useObjectStore } from "@/stores";

type QuestCreateFormProps = {
  resultObjectRef?: RefObject<ResultObjectHandle | null>;
};

export function QuestCreateForm({ resultObjectRef }: QuestCreateFormProps) {
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    "Easy",
  );
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(100);
  const [challenge, setChallenge] = useState("");
  const [isCreatingQuest, setIsCreatingQuest] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [createdQuestId, setCreatedQuestId] = useState<string | null>(null);
  const [capturedViews, setCapturedViews] = useState<Record<
    string,
    Blob
  > | null>(null);
  const [capturedThumbnail, setCapturedThumbnail] = useState<Blob | null>(null);
  const [isCapturingThumbnail, setIsCapturingThumbnail] = useState(false);

  const internalResultObjectRef = useRef<ResultObjectHandle>(null);
  const objectData = useObjectStore((state) => state.objectData);

  // BlobのURLを生成してメモリリークを防ぐ
  const previewUrls = useMemo(() => {
    if (!capturedViews) return null;
    return {
      top: URL.createObjectURL(capturedViews.top),
      bottom: URL.createObjectURL(capturedViews.bottom),
      left: URL.createObjectURL(capturedViews.left),
      right: URL.createObjectURL(capturedViews.right),
      front: URL.createObjectURL(capturedViews.front),
      back: URL.createObjectURL(capturedViews.back),
    };
  }, [capturedViews]);

  // サムネイルのプレビューURL
  const thumbnailPreviewUrl = useMemo(() => {
    if (!capturedThumbnail) return null;
    return URL.createObjectURL(capturedThumbnail);
  }, [capturedThumbnail]);

  // クリーンアップ: URLを解放
  useEffect(() => {
    return () => {
      if (previewUrls) {
        Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));
      }
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [previewUrls, thumbnailPreviewUrl]);

  // クエスト作成
  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("クエスト名を入力してください");
      return;
    }

    try {
      setIsCreatingQuest(true);

      const questResponse = await client.quests.$post({
        json: {
          name,
          difficulty,
          level,
          score,
          challenge: challenge.trim() || undefined,
          answerObject: objectData?.BuildingPartData.parts,
        },
      });

      if (!questResponse.ok) {
        throw new Error("クエストの作成に失敗しました");
      }

      const quest = await questResponse.json();
      setCreatedQuestId(quest.id);

      toast.success(`クエストを作成しました (ID: ${quest.id})`);
    } catch (error) {
      console.error("クエスト作成エラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "クエスト作成中にエラーが発生しました",
      );
    } finally {
      setIsCreatingQuest(false);
    }
  };

  // キャプチャ実行
  const handleCapture = async () => {
    if (!objectData) {
      toast.error("3Dオブジェクトを作成してください");
      return;
    }

    if (!internalResultObjectRef.current) {
      toast.error("3Dオブジェクトがまだ準備できていません");
      return;
    }

    try {
      setIsCapturing(true);

      // 6方向キャプチャを実行
      const views = await internalResultObjectRef.current.capture();
      setCapturedViews(views);

      toast.success("キャプチャが完了しました");
    } catch (error) {
      console.error("キャプチャエラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "キャプチャ中にエラーが発生しました",
      );
    } finally {
      setIsCapturing(false);
    }
  };

  // サムネイルキャプチャ実行
  const handleCaptureThumbnail = async () => {
    if (!objectData) {
      toast.error("3Dオブジェクトを作成してください");
      return;
    }

    const targetRef = resultObjectRef || internalResultObjectRef;
    if (!targetRef.current) {
      toast.error("3Dオブジェクトがまだ準備できていません");
      return;
    }

    try {
      setIsCapturingThumbnail(true);

      // 現在のカメラアングルでサムネイルキャプチャを実行
      const thumbnail = await targetRef.current.captureThumbnail();
      setCapturedThumbnail(thumbnail);

      toast.success("サムネイルキャプチャが完了しました");
    } catch (error) {
      console.error("サムネイルキャプチャエラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "サムネイルキャプチャ中にエラーが発生しました",
      );
    } finally {
      setIsCapturingThumbnail(false);
    }
  };

  // 画像アップロード
  const handleUploadImages = async () => {
    if (!createdQuestId) {
      toast.error("先にクエストを作成してください");
      return;
    }

    if (!capturedViews) {
      toast.error("先に6方向キャプチャを実行してください");
      return;
    }

    if (!capturedThumbnail) {
      toast.error("先にサムネイルキャプチャを実行してください");
      return;
    }

    try {
      setIsUploadingImages(true);

      // BlobをFileに変換してR2にアップロード
      const views = [
        "top",
        "bottom",
        "left",
        "right",
        "front",
        "back",
      ] as const;
      const formData = Object.fromEntries(
        views.map((view) => [
          `${view}View`,
          new File([capturedViews[view]], `${createdQuestId}.png`, {
            type: "image/png",
          }),
        ]),
      ) as Record<`${(typeof views)[number]}View`, File>;

      const uploadResponse = await client.r2.objectImages.$post({
        form: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("画像のアップロードに失敗しました");
      }

      // サムネイル画像をアップロード
      const thumbnailUploadResponse = await client.r2.image[":key"].$post({
        param: { key: `thumbnail` },
        form: {
          image: new File([capturedThumbnail], `${createdQuestId}.png`, {
            type: "image/png",
          }),
        },
      });

      if (!thumbnailUploadResponse.ok) {
        throw new Error("サムネイルのアップロードに失敗しました");
      }

      toast.success("画像をアップロードしました");

      // フォームをリセット
      setName("");
      setDifficulty("Easy");
      setLevel(1);
      setScore(100);
      setChallenge("");
      setCreatedQuestId(null);
      setCapturedViews(null);
      setCapturedThumbnail(null);
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "画像アップロード中にエラーが発生しました",
      );
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <>
      {/* 非表示の3Dオブジェクト（6方向キャプチャ用） */}
      <div className="sr-only">
        <ResultObject ref={internalResultObjectRef} />
      </div>

      <form onSubmit={handleCreateQuest} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">クエスト名</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 家"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>難易度</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={difficulty === "Easy" ? "default" : "outline"}
              onClick={() => setDifficulty("Easy")}
              className="flex-1"
            >
              かんたん
            </Button>
            <Button
              type="button"
              variant={difficulty === "Medium" ? "default" : "outline"}
              onClick={() => setDifficulty("Medium")}
              className="flex-1"
            >
              ふつう
            </Button>
            <Button
              type="button"
              variant={difficulty === "Hard" ? "default" : "outline"}
              onClick={() => setDifficulty("Hard")}
              className="flex-1"
            >
              むずかしい
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">レベル</Label>
          <Input
            id="level"
            type="number"
            min={1}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="score">スコア</Label>
          <Input
            id="score"
            type="number"
            min={0}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="challenge">チャレンジ説明（オプション）</Label>
          <Textarea
            id="challenge"
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="このクエストの説明を入力してください"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={isCreatingQuest || !!createdQuestId}
            >
              {isCreatingQuest ? "作成中..." : "クエストを作成"}
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={isCapturing}
              onClick={handleCapture}
            >
              {isCapturing
                ? "6方向キャプチャ中..."
                : capturedViews
                  ? "6方向再キャプチャ"
                  : "6方向キャプチャ"}
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              disabled={
                !createdQuestId ||
                !capturedViews ||
                !capturedThumbnail ||
                isUploadingImages
              }
              onClick={handleUploadImages}
            >
              {isUploadingImages ? "アップロード中..." : "アップロード"}
            </Button>
          </div>
          <Button
            type="button"
            size="lg"
            className="w-full"
            variant="secondary"
            disabled={isCapturingThumbnail || !objectData}
            onClick={handleCaptureThumbnail}
          >
            {isCapturingThumbnail
              ? "サムネイルキャプチャ中..."
              : capturedThumbnail
                ? "サムネイル再キャプチャ"
                : "サムネイルキャプチャ"}
          </Button>
        </div>
      </form>

      {/* プレビュー */}
      {thumbnailPreviewUrl && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg">サムネイルプレビュー（4:3）</h3>
          <div className="border rounded p-4 bg-gray-50">
            <Image
              src={thumbnailPreviewUrl}
              alt="Thumbnail preview"
              width={800}
              height={600}
              className="w-full h-auto rounded shadow-sm"
            />
          </div>
        </div>
      )}

      {previewUrls && (
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg">
            キャプチャプレビュー（6方向）
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {(["top", "bottom", "left", "right", "front", "back"] as const).map(
              (view) => (
                <div key={view} className="space-y-2">
                  <p className="text-sm font-medium capitalize">{view}</p>
                  <Image
                    src={previewUrls[view]}
                    alt={`${view} view`}
                    width={100}
                    height={100}
                    className="w-full h-auto border rounded object-contain"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </>
  );
}
