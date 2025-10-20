import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Chat from "@/features/quest/components/chat";
import { QuestCreateForm } from "@/features/quest/components/questCreateForm";
import ResultObject from "@/features/world3d/components/resultObject";

export default function QuestDetailPage() {
  return (
    <main className="w-full flex flex-col md:h-svh grow mx-auto xl:container max-w-7xl px-4 py-2 xl:py-6">
      <div className="">
        <Button variant={"link"} size={"sm"} asChild>
          <Link href="/quests">
            <ChevronLeft className="size-3.5" />
            クエスト一覧にもどる
          </Link>
        </Button>
        <h1 className="text-xl xl:text-2xl font-bold ml-2">クエスト作成</h1>
      </div>

      <div className="grid gap-x-4 gap-y-5 xl:gap-x-8 py-3 lg:py-4 xl:py-5 grid-rows-2 grid-cols-1 md:grid-cols-2 grow h-[calc(100%-80px)]">
        {/* 左側: 3D作成エリア */}
        <div className="bg-white row-span-1 col-span-1 rounded-xl h-full flex flex-col p-4 xl:p-6">
          <h2 className="text-base xl:text-lg mb-2">3Dプレビュー</h2>
          <ResultObject />
        </div>
        <div className="bg-white rounded-xl h-full row-span-1 col-span-1 p-4 xl:p-6 flex flex-col">
          <h2 className="text-base xl:text-lg mb-2">チャット</h2>
          <Chat />
        </div>

        {/* 右側: クエスト情報入力フォーム */}
        <div className="bg-white row-start-1 row-span-2 col-end-3 rounded-xl p-4 xl:p-6 overflow-y-auto">
          <h2 className="text-base xl:text-lg mb-4">クエスト情報</h2>
          <QuestCreateForm />
        </div>
      </div>
    </main>
  );
}
