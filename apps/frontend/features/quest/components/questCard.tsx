import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Quest } from "@/types";
export default function QuestCard({ quest }: { quest: Quest }) {
  return (
    <Link
      href={`/quests/${quest.id}`}
      className={`${quest.difficulty === "Easy" ? "bg-background" : quest.difficulty === "Medium" ? "bg-yellow-50" : "bg-purple-50"} shadow rounded-2xl p-2.5 block w-full max-w-60 space-y-2`}
    >
      <DifficultyBadge difficulty={quest.difficulty} />
      <Image
        src={"/house.png"}
        alt="画像"
        width={100}
        height={100}
        className="object-cover mx-auto"
      />
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
