"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ResultObject, {
  type ResultObjectHandle,
} from "@/features/world3d/components/resultObject";

export function SubmitButton() {
  const resultObjectRef = useRef<ResultObjectHandle>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!resultObjectRef.current) {
        throw new Error("3Dオブジェクトがまだ準備できていません");
      }

      // 6方向キャプチャを実行
      const capturedViews = await resultObjectRef.current.capture();
      console.log("capturedViews", capturedViews);

      // FormDataを作成
      const formData = new FormData();
      Object.entries(capturedViews).forEach(([view, blob]) => {
        formData.append("images", blob, `${view}.png`);
      });

      // TODO: APIエンドポイントに送信
      console.log("FormData ready for upload:", formData);
      // const response = await fetch('/api/quests/submit', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) {
      //   throw new Error('送信に失敗しました');
      // }

      // 成功後の処理 (例: /quests/position へ遷移)
      // router.push('/quests/position');
    } catch (error) {
      console.error("送信エラー:", error);
      alert(
        error instanceof Error ? error.message : "送信中にエラーが発生しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 非表示の3Dオブジェクト */}
      <div className="sr-only">
        <ResultObject ref={resultObjectRef} />
      </div>

      {/* 送信ボタン */}
      <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "送信中..." : "おく場所を選ぶ"}
      </Button>
    </>
  );
}
