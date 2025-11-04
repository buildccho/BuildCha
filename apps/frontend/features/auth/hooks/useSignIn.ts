"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/rpc-client";
import { useAuthStore } from "@/stores";

export function useSignIn() {
  const router = useRouter();
  const { checkSession } = useAuthStore();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const signIn = async (name: string, avatarImage: string) => {
    setIsLoading(true);
    setError("");

    try {
      // 匿名ログイン
      const res = await authClient.signIn.anonymous();
      if (res.error || !res.data) {
        throw new Error(res.error?.message || "ログインに失敗しました");
      }

      // ユーザー情報更新
      const updateRes = await client.user.$patch({
        json: {
          name: name,
          image: avatarImage,
        },
      });
      if (!updateRes.ok) {
        console.error(updateRes.status, (await updateRes.json()).message);
        throw new Error("ユーザー情報の更新に失敗しました");
      }
      await updateRes.json();

      // マップ作成
      const createMapRes = await client.maps.$post({
        json: {
          name: "First Town",
        },
      });
      if (!createMapRes.ok) {
        console.error(createMapRes.status, (await createMapRes.json()).message);
        throw new Error("マップの作成に失敗しました");
      }
      await createMapRes.json();

      // セッション情報を更新してからリダイレクト
      await checkSession();
      router.push("/");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    error,
    isLoading,
  };
}
