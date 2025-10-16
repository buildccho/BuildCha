"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useSignIn } from "@/features/auth/hooks/useSignIn";

const initialAvatarImage = `https://api.dicebear.com/9.x/bottts/svg?scale=90`;

export default function SignInForm() {
  const [avatarImage, setAvatarImage] = useState<string>(initialAvatarImage);
  const { signIn, error, isLoading } = useSignIn();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();

    if (!name) {
      return;
    }

    await signIn(name, avatarImage);
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
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner />
            あなたのまちを作っているよ〜
          </>
        ) : (
          "はじめる"
        )}
      </Button>
    </form>
  );
}
