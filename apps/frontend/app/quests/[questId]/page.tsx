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
  return <QuestClient quest={{ ...quest, answerObject }} />;
}
