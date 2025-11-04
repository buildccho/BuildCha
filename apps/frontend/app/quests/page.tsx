import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/rpc-client";
import type { Quest } from "@/types";
import QuestsList from "./questsList";

const getQuests = async (): Promise<Quest[]> => {
  try {
    const res = await client.quests.$get(
      {},
      {
        init: {
          next: {
            tags: ["quests"],
            revalidate: 300, // 5分キャッシュ
          },
        },
      },
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const quests = await res.json();
    return quests;
  } catch (error) {
    console.error("Error fetching quests:", error);
    throw error;
  }
};

export default async function QuestListPage() {
  const quests = await getQuests();

  return (
    <main className="w-full xl:container max-w-7xl mx-auto px-4 py-6">
      <div>
        <Button variant={"link"} size={"sm"} asChild>
          <Link href="/">
            <ChevronLeft className="size-3.5" />
            ホームにもどる
          </Link>
        </Button>
        <h1 className="text-2xl font-black pb-6">クエスト一覧</h1>
      </div>
      <QuestsList quests={quests} />
    </main>
  );
}
