import QuestCard from "@/features/quest/components/questCard";
import { client } from "@/lib/rpc-client";

export default async function QuestList() {
  const res = await client.quests.$get();
  if (!res.ok) {
    console.error(res.statusText);
  }
  const data = await res.json();
  console.log("quests", data);

  if (data.length === 0) {
    const newQuest = await client.quests.$post({
      json: {
        name: "家",
        imageUrl:
          "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1548",
        difficulty: "Easy",
        score: 100,
        level: 1,
      },
    });
    if (!newQuest.ok) {
      console.error(res.statusText);
    }
    const quest = await newQuest.json();
    data.unshift(quest);
    console.log("quests", data);
  }

  const quests = data.map((quest) => ({
    ...quest,
    difficulty: quest.difficulty as "Easy" | "Medium" | "Hard",
    createdAt: new Date(quest.createdAt),
  }));

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
