import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QuestDetailPage() {
  return (
    <div className="min-h-screen bg-neutral-200 flex flex-col">
      <div className="mx-auto xl:container max-w-7xl px-4 py-6 flex flex-col grow">
        <Button variant={"ghost"} asChild size={"icon"}>
          <Link href={"/quests"}>
            <ChevronLeft className="size-5" />
          </Link>
        </Button>

        <div className="grid gap-x-8 gap-y-5 py-8 grid-cols-7 grid-rows-7 grow">
          <div className="bg-white rounded-xl p-6 col-span-3 row-span-3">
            <h2 className="text-lg">お手本</h2>
          </div>
          <div className="bg-white rounded-xl p-6 col-span-3 row-span-4 col-start-1 row-start-4">
            <h2 className="text-lg">結果</h2>
          </div>
          <div className="bg-white rounded-xl p-6 col-span-4 row-span-7 col-start-4 row-start-1">
            <h2 className="text-lg">チャット</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
