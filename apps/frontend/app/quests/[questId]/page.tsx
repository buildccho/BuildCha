import QuestClient from "@/features/quest/components/questClient";
import { client } from "@/lib/rpc-client";

export default async function QuestDetailPage({
  params,
}: {
  params: Promise<{ questId: string }>;
}) {
  const { questId } = await params;
  const res = await client.quests[":id"].$get({
    param: {
      id: questId,
    },
  });
  if (!res.ok) {
    console.error(res.statusText);
    return <div>Error</div>;
  }
  const quest = await res.json();
  const answerObject =
    quest.answerObject?.map((answerObject) => ({
      ...answerObject,
      position: JSON.parse(answerObject.position) as [number, number, number],
      rotation: JSON.parse(answerObject.rotation) as [number, number, number],
      size: JSON.parse(answerObject.size) as [number, number, number],
    })) ?? [];

  const questsRes = await client.quests.$get();
  if (!questsRes.ok) {
    console.error(questsRes.statusText);
    return <div>Error</div>;
  }
  const quests = await questsRes.json();
  const questIndex = quests.findIndex((quest) => quest.id === questId);
  const filteredQuests =
    questIndex !== -1 ? quests.slice(questIndex + 1, questIndex + 4) : [];

  return (
    <QuestClient
      quest={{ ...quest, answerObject }}
      nextQuests={filteredQuests}
    />
  );
}
