import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ResultObjectHandle } from "@/features/world3d/components/resultObject";
import { useGetMyTown } from "@/features/world3d/hooks/useGetMaps";
import { calculateBoundingBox } from "@/features/world3d/utils/buildingCalculations";
import { client } from "@/lib/rpc-client";
import { useObjectStore } from "@/stores";
import type { UserObject } from "@/types";

export function useSaveObject() {
  const [isLoading, setIsLoading] = useState(false);
  const resultObjectRef = useRef<ResultObjectHandle>(null);
  const [object, setObject] = useState<UserObject | null>(null);
  const objectData = useObjectStore((state) => state.objectData);
  const name = useObjectStore((state) => state.name);
  const chatHistory = useObjectStore((state) => state.chatHistory);
  const [result, setResult] = useState<{
    objectScore: number;
    userLevel: number;
    userScore: number;
    comment: string;
  } | null>(null);

  const { map, isLoading: isLoadingMap } = useGetMyTown();

  const handleSaveObject = async ({
    questId,
    handleChangeMode,
  }: {
    questId: string;
    handleChangeMode: () => void;
  }) => {
    // バリデーション
    if (!objectData?.BuildingPartData) {
      toast.error("オブジェクトデータがありません");
      return;
    }

    if (!name) {
      toast.error("オブジェクト名がありません");
      return;
    }

    if (!map?.id) {
      toast.error("マップが見つかりません");
      return;
    }

    setIsLoading(true);

    try {
      const boundingBox = calculateBoundingBox(objectData.BuildingPartData);

      // chatHistoryをバックエンドの形式に変換
      // "assistant" -> "system"に変換
      const formattedChatHistory = chatHistory.map((chat) => ({
        role: chat.role === "assistant" ? ("system" as const) : chat.role,
        message: chat.content,
      }));

      // partsにroleを追加
      const formattedParts = objectData.BuildingPartData.parts.map((part) => ({
        ...part,
        role: "User" as const,
      }));

      // オブジェクトを保存
      const response = await client.objects.$post({
        json: {
          name,
          questId,
          mapId: map.id,
          boundingBox: boundingBox,
          parts: formattedParts,
          chatHistory: formattedChatHistory,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          "message" in errorData
            ? errorData.message
            : "オブジェクトの保存に失敗しました",
        );
      }

      toast.success("オブジェクトを保存しました");

      const data = await response.json();
      setObject({
        ...data,
        position: data.position ? JSON.parse(data.position) : undefined,
        rotation: data.rotation ? JSON.parse(data.rotation) : undefined,
        boundingBox: JSON.parse(data.boundingBox),
        parts: data.parts.map((part) => ({
          ...part,
          position: JSON.parse(part.position),
          rotation: JSON.parse(part.rotation),
          size: JSON.parse(part.size),
        })),
      });

      // 位置選択ページへ遷移
      handleChangeMode();

      // 6方向のキャプチャを取得
      if (!resultObjectRef.current) {
        throw new Error("ResultObject is not ready");
      }

      toast.info("画像をキャプチャしています...");
      const capturedViews = await resultObjectRef.current.capture();

      const res = await client.ai.compareObject[":objectId"].$post({
        param: {
          objectId: data.id,
        },
        form: {
          topView: new File([capturedViews.top], "top.png", {
            type: "image/png",
          }),
          bottomView: new File([capturedViews.bottom], "bottom.png", {
            type: "image/png",
          }),
          leftView: new File([capturedViews.left], "left.png", {
            type: "image/png",
          }),
          rightView: new File([capturedViews.right], "right.png", {
            type: "image/png",
          }),
          frontView: new File([capturedViews.front], "front.png", {
            type: "image/png",
          }),
          backView: new File([capturedViews.back], "back.png", {
            type: "image/png",
          }),
        },
      });
      if (!res.ok) {
        throw new Error("オブジェクトの比較に失敗しました");
      }
      const resultData = await res.json();
      console.log("resultData", resultData);
      setResult({
        objectScore: resultData.object_score,
        userLevel: resultData.user_level,
        userScore: resultData.user_score,
        comment: resultData.comment as unknown as string,
      });
    } catch (error) {
      console.error("Error saving object:", error);
      toast.error(
        error instanceof Error ? error.message : "保存中にエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled =
    isLoading ||
    isLoadingMap ||
    !objectData?.BuildingPartData ||
    !name ||
    !map?.id;

  return {
    isLoading,
    handleSaveObject,
    isDisabled,
    resultObjectRef,
    object,
    result,
  };
}
