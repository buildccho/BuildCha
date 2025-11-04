import { useState } from "react";
import { toast } from "sonner";
import { client } from "@/lib/rpc-client";

export function useUpdateBuilding() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePosition = async (
    id: string,
    position: [number, number, number],
    onSuccess?: () => void,
  ) => {
    setIsUpdating(true);
    try {
      const response = await client.objects[":id"].$patch({
        param: { id },
        json: { position },
      });

      if (!response.ok) {
        throw new Error("Failed to update position");
      }

      toast.success("たてものをうごかしたよ！");

      // onSuccess のエラーは PATCH の成功状態に影響させない
      if (onSuccess) {
        try {
          await onSuccess();
        } catch (error) {
          console.error("onSuccess callback error:", error);
        }
      }
    } catch (error) {
      toast.error("たてものをうごかせなかったよ…もういちどためしてね");
      console.error(error);
      throw error; // エラーを再スロー
    } finally {
      setIsUpdating(false);
    }
  };

  const updateRotation = async (
    id: string,
    rotation: [number, number, number],
    onSuccess?: () => void,
  ) => {
    setIsUpdating(true);
    try {
      const response = await client.objects[":id"].$patch({
        param: { id },
        json: { rotation },
      });

      if (!response.ok) {
        throw new Error("Failed to update rotation");
      }

      toast.success("たてものをまわしたよ！");

      // onSuccess のエラーは PATCH の成功状態に影響させない
      if (onSuccess) {
        try {
          await onSuccess();
        } catch (error) {
          console.error("onSuccess callback error:", error);
        }
      }
    } catch (error) {
      toast.error("たてものをまわせなかったよ…もういちどためしてね");
      console.error(error);
      throw error; // エラーを再スロー
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updatePosition,
    updateRotation,
  };
}
