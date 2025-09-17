import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";

export default function QuestCard({
  difficulty = "normal",
}: {
  difficulty?: "easy" | "normal" | "hard";
}) {
  return (
    <Link
      href={"/quests/detail"}
      className={`${difficulty === "easy" ? "bg-background" : difficulty === "normal" ? "bg-yellow-50" : "bg-purple-50"} shadow rounded-2xl p-2.5 block w-full max-w-60 space-y-2`}
    >
      <DifficultyBadge difficulty={difficulty} />
      <Image
        src={"/house.png"}
        alt="画像"
        width={100}
        height={100}
        className="object-cover mx-auto"
      />
      <h2 className="text-base font-semibold text-end">家</h2>
    </Link>
  );
}

type Difficulty = "easy" | "normal" | "hard";

const DIFFICULTY: Record<Difficulty, { text: string; className: string }> = {
  easy: {
    text: "かんたん",
    className: "bg-green-600 text-white font-semibold",
  },
  normal: {
    text: "ふつう",
    className: "bg-yellow-600 text-white font-semibold",
  },
  hard: {
    text: "むずかしい",
    className: "bg-purple-600 text-white font-semibold",
  },
};

export const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => {
  const d = DIFFICULTY[difficulty] ?? DIFFICULTY.easy;
  return <Badge className={d.className}>{d.text}</Badge>;
};
