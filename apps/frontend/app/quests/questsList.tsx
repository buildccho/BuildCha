"use client";
import QuestCard from "@/features/quest/components/questCard";
import { useAuthStore } from "@/stores";
import type { Quest } from "@/types";

export default function QuestsList({ quests }: { quests: Quest[] }) {
  const { user } = useAuthStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {quests.map((quest) => (
        <QuestCard
          quest={quest}
          key={quest.id}
          isUnlocked={
            (user?.level || 0) === 0
              ? (user?.level || 0) + 1 >= quest.level
              : (user?.level || 0) >= quest.level
          }
        />
      ))}
    </div>
  );
}
