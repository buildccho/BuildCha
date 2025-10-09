"use client";

import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserAction } from "@/features/auth/actions/updateUser";
import { createMapAction } from "@/features/world3d/actions/createMap";
import { authClient } from "@/lib/auth-client";

const initialAvatarImage = `https://api.dicebear.com/9.x/bottts/svg?scale=90`;

export default function SignInForm() {
  const router = useRouter();
  const [avatarImage, setAvatarImage] = useState<string>(initialAvatarImage);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      setError("なまえを入力してね〜");
      return;
    }

    // 匿名ログイン
    const res = await authClient.signIn.anonymous();
    if (res.error) {
      console.error(res.error.code, res.error.message);
      setError(res.error.message || "ログインに失敗しました");
      return;
    }

    // ユーザー情報更新
    const updateResult = await updateUserAction({
      name: name,
      image: avatarImage,
    });

    if (!updateResult.success) {
      setError(updateResult.error);
      return;
    }

    // マップ作成
    const createResult = await createMapAction("First Town");

    if (!createResult.success) {
      setError(createResult.error);
      return;
    }

    // トップに移動
    router.push("/");
  };

  return (
    <form className="max-w-sm mx-auto w-full space-y-8" onSubmit={handleSubmit}>
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      <div className="flex gap-5 items-center w-full">
        <Avatar className="bg-neutral-200 size-22 cursor-pointer relative overflow-visible">
          <AvatarImage
            src={avatarImage || undefined}
            onClick={() => {
              const newSeed = Math.floor(Math.random() * 100);
              const newAvatarImage = `${initialAvatarImage}&seed=${newSeed}`;
              setAvatarImage(newAvatarImage);
            }}
            alt="アイコン"
          />
          <AvatarFallback>U</AvatarFallback>
          <div className="absolute bg-background rounded-full p-1.5 right-0 bottom-0 shadow-sm">
            <RefreshCcw className="size-3.5" />
          </div>
        </Avatar>
        <div className="flex flex-col gap-2 w-full">
          <Label className="font-semibold" htmlFor="name">
            なまえ
          </Label>
          <Input
            type="text"
            className="py-3 text-base bg-white"
            id="name"
            name="name"
          />
        </div>
      </div>
      <Button
        size={"lg"}
        className="w-full text-base font-bold h-auto py-3 shadow"
        type="submit"
      >
        はじめる
      </Button>
    </form>
  );
}
