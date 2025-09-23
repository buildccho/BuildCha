import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Chat from "@/features/quest/components/chat";
import { DifficultyBadge } from "@/features/quest/components/questCard";
import ResultObject from "@/features/world3d/components/resultObject";

export default function QuestDetailPage() {
  return (
    <main className="w-full flex flex-col h-svh grow mx-auto xl:container max-w-7xl px-4 py-2 xl:py-6">
      <div className="flex justify-between items-end">
        <div>
          <Button variant={"link"} size={"sm"} asChild className="text-xs">
            <Link href="/quests">
              <ChevronLeft className="size-3.5" />
              クエスト一覧にもどる
            </Link>
          </Button>
          <div className="flex items-center gap-1 xl:gap-2 pl-2">
            <h2 className="text-xl xl:text-2xl font-bold">家</h2>
            <DifficultyBadge difficulty="normal" />
          </div>
        </div>
        <Button size={"lg"} asChild>
          <Link href="/quests/position">おく場所を選ぶ</Link>
        </Button>
      </div>

      <div className="grid gap-x-4 gap-y-5 xl:gap-x-8 lg:gap-y-5 py-3 lg:py-4 xl:py-5 grid-cols-7 grid-rows-7 grow h-[calc(100%-100px)]">
        <div className="bg-white rounded-xl p-4 xl:p-6 col-span-3 row-span-3">
          <h2 className="text-base xl:text-lg">お手本</h2>
        </div>
        <div className="bg-white rounded-xl h-full flex flex-col p-4 xl:p-6 col-span-3 row-span-4 col-start-1 row-start-4">
          <h2 className="text-base xl:text-lg">結果</h2>
          <ResultObject />
        </div>
        <div className="bg-white rounded-xl h-full p-4 xl:p-6 flex flex-col col-span-4 row-span-7 col-start-4 row-start-1">
          <h2 className="text-base xl:text-lg">チャット</h2>
          <Chat />
        </div>
      </div>
    </main>
  );
}
