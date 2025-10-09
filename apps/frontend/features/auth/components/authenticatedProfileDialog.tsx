"use client";

import { Loader2, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";
import { updateUserAction } from "../actions/updateUser";

const initialAvatarImage = `https://api.dicebear.com/9.x/bottts/svg?scale=90`;

export function AuthenticatedProfileDialog({ user }: { user: User }) {
  const [newAvatarImage, setNewAvatarImage] = useState<string>(
    user.image || initialAvatarImage,
  );
  const [newName, setNewName] = useState<string>(user.name || "");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await updateUserAction({
        name: newName === user.name ? undefined : newName,
        image: newAvatarImage === user.image ? undefined : newAvatarImage,
      });

      if (res.success) {
        toast.success("プロフィールをかえたよ！");
        setOpen(false);
      } else {
        throw new Error("プロフィールをかえられなかったよ");
      }
    } catch (err) {
      // エラートーストを表示
      toast.error(
        err instanceof Error ? err.message : "プロフィールをかえられなかったよ",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Avatar className="bg-neutral-200 border-4 border-white shadow size-20 absolute top-0 right-0 z-40">
          <AvatarImage src={user.image || initialAvatarImage} />
          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="p-9 rounded-2xl">
        <DialogHeader>
          <DialogTitle>プロフィール</DialogTitle>
          <DialogDescription>
            なまえやアバターをかえることができるよ！
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6 pt-4" onSubmit={handleSave}>
          <div className="flex gap-5 items-center">
            <Avatar
              className="bg-neutral-200 size-20 cursor-pointer relative"
              onClick={() => {
                const newSeed = Math.floor(Math.random() * 100);
                const newAvatarImage = `${initialAvatarImage}&seed=${newSeed}`;
                setNewAvatarImage(newAvatarImage);
              }}
            >
              <AvatarImage src={newAvatarImage || undefined} alt="アイコン" />
              <div className="absolute inset-0 flex items-center justify-center hover:bg-foreground/20 text-transparent hover:text-background">
                <RefreshCcw className="size-6 stroke-3" />
              </div>
            </Avatar>
            <div className="flex flex-col gap-2 w-full">
              <Label className="font-semibold" htmlFor="name">
                なまえ
              </Label>
              <Input
                type="text"
                className="py-2.5 text-base"
                id="name"
                placeholder="なまえを入力してください"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
          </div>
          <Button
            size="lg"
            className="font-bold"
            type="submit"
            disabled={
              (newName === user.name && newAvatarImage === user.image) ||
              isLoading
            }
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "保存"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
