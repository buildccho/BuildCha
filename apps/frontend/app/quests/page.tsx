import QuestCard from "@/features/quest/components/questCard";
import type { Quest } from "@/types";

const getQuests = async (): Promise<Quest[]> => {
  const url = `${process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8787"}/quests`;
  console.log("Fetching from:", url);
  try {
    const res = await fetch(url, {
      next: {
        tags: ["quests"],
      },
    });
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    const data = await res.json();
    return data as Quest[];
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
