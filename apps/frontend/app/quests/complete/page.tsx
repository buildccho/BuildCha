import { Home, Plus, RotateCw, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuestCard from "@/features/quest/components/questCard";

export default function CompletePage() {
  return (
    <main className="w-full min-h-screen grid place-items-center p-4 lg:py-6">
      <div className="max-w-6xl grid w-full px-6 py-6 lg:px-9 lg:py-9 xl:px-12 xl:py-12 rounded-3xl gap-6 xl:gap-9 bg-white/60 border border-white backdrop-blur-sm shadow-lg shadow-black/5">
        <div className="flex flex-row gap-2 items-center justify-between py-1">
          <h1 className="text-2xl lg:text-3xl font-bold">
            クエストクリア！家を作ったよ
          </h1>
          <div className="flex gap-3">
            <Button asChild size={"lg"} variant={"secondary"}>
              <Link href="/">
                <Home />
                ホームに戻る
              </Link>
            </Button>
            <Button asChild size={"lg"} variant={"default"}>
              <Link href="/quests">
                <Plus />
                新しいクエスト
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex gap-8 xl:gap-12">
          <div className="bg-white rounded-xl py-8 px-10 w-fit shrink-0 shadow">
            <Image
              src={"/house.png"}
              alt="家"
              width={200}
              height={200}
              className="object-cover block"
            />
          </div>

          <div className="flex flex-col gap-6 w-full justify-center items-start">
            <div className="flex items-center gap-2">
              <Image
                src={"/AICharacter.png"}
                alt="AIキャラ"
                width={44}
                height={44}
                className="object-cover block"
              />
              <div className="bg-white rounded-md px-3 py-2 text-sm lg:text-base font-medium">
                屋根も壁もバッチリ！天才だね！
              </div>
            </div>

            <div className="flex flex-col gap-4 shrink-0 w-full">
              <div className="flex gap-3 items-baseline w-full">
                <div className="flex gap-1 items-center text-foreground/80">
                  <Sparkles size={18} className="text-primary" />
                  そっくり
                </div>
                <div className="font-bold text-4xl">
                  80<span className="text-base ml-1">%</span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <div className="w-full max-w-sm">
                  <div className="flex gap-2 justify-between items-baseline w-full">
                    <div className="flex items-baseline text-foreground/80">
                      レベル
                      <span className="font-bold text-foreground text-3xl ml-1.5">
                        2
                      </span>
                    </div>
                    <div className="text-muted-foreground shrink-0 flex items-baseline gap-1">
                      20 → <span className="font-bold text-foreground">40</span>{" "}
                      / 100
                    </div>
                  </div>
                  <Progress value={40} className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 md:gap-6 pt-3 md:pt-6">
          <div className="flex flex-col gap-2 col-span-1">
            <h3 className="font-semibold text-base flex items-center gap-1.5">
              <RotateCw size={14} className="text-foreground/80" /> つくりなおす
            </h3>
            <QuestCard difficulty="easy" />
          </div>
          <div className="flex flex-col gap-2 col-span-3">
            <h3 className="font-semibold text-base">次はどれをつくる？</h3>
            <div className="grid grid-cols-3 gap-2">
              <QuestCard difficulty="easy" />
              <QuestCard difficulty="normal" />
              <QuestCard difficulty="hard" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
