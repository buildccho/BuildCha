import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Quest } from "@/types";
export default function QuestCard({ quest }: { quest: Quest }) {
  return (
    <Link
      href={`/quests/${quest.id}`}
      className={`${quest.difficulty === "Easy" ? "bg-background" : quest.difficulty === "Medium" ? "bg-yellow-50" : "bg-purple-50"} shadow rounded-2xl p-2.5 flex flex-col w-full max-w-60 space-y-1`}
    >
      <DifficultyBadge difficulty={quest.difficulty} />
      <div className="flex-1 relative w-full h-full flex items-center justify-center aspect-video">
        <Image
          src={`https://pub-68bb760998324b59b97c4622e8ba2d68.r2.dev/thumbnail/${encodeURIComponent(quest.id)}.png`}
          alt="画像"
          fill
          className="object-contain w-full h-full block"
        />
      </div>
      <h2 className="text-base font-semibold text-end">{quest.name}</h2>
    </Link>
  );
}

type Difficulty = "Easy" | "Medium" | "Hard";

const DIFFICULTY: Record<Difficulty, { text: string; className: string }> = {
  Easy: {
    text: "かんたん",
    className: "bg-green-600 text-white font-semibold",
  },
  Medium: {
    text: "ふつう",
    className: "bg-yellow-600 text-white font-semibold",
  },
  Hard: {
    text: "むずかしい",
    className: "bg-purple-600 text-white font-semibold",
  },
};

export const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => {
  const d = DIFFICULTY[difficulty] ?? DIFFICULTY.Easy;
  return <Badge className={d.className}>{d.text}</Badge>;
};
