import QuestCard from "@/features/quest/components/questCard";
import { client } from "@/lib/rpc-client";
import type { Quest } from "@/types";

const getQuests = async (): Promise<Quest[]> => {
  try {
    const res = await client.quests.$get();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const quests = data.map((quest) => ({
      ...quest,
      difficulty: quest.difficulty as "Easy" | "Medium" | "Hard",
      createdAt: new Date(quest.createdAt),
    }));
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
      <h1 className="text-2xl font-black py-6">クエスト一覧</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {quests.map((quest) => (
          <QuestCard quest={quest} key={quest.id} />
        ))}
      </div>
    </main>
  );
}
