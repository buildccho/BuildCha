import QuestCard from "@/features/quest/components/questCard";
import { client } from "@/lib/rpc-client";
import type { Quest } from "@/types";

export default async function QuestList() {
  let quests: Quest[] = [];

  try {
    const res = await client.quests.$get();
    if (!res.ok) {
      console.error("Error fetching quests:", res.status, res.statusText, res);
      quests = [];
    } else {
      const data = await res.json();
      console.log("quests", data);
      quests = data.map((quest) => ({
        ...quest,
        difficulty: quest.difficulty as "Easy" | "Medium" | "Hard",
        createdAt: new Date(quest.createdAt),
      }));
    }

    if (quests.length === 0) {
      const newQuest = await client.quests.$post({
        json: {
          name: "家",
          difficulty: "Easy",
          score: 100,
          level: 1,
        },
      });
      if (!newQuest.ok) {
        console.error(
          "Error creating quest:",
          newQuest.status,
          newQuest.statusText,
        );
      } else {
        const quest = await newQuest.json();
        quests.unshift({
          ...quest,
          difficulty: quest.difficulty as "Easy" | "Medium" | "Hard",
          createdAt: new Date(quest.createdAt),
        } as Quest);
        console.log("quests", quests);
      }
    }
  } catch (error) {
    console.error("Error fetching quests:", error);
    quests = [];
  }

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
