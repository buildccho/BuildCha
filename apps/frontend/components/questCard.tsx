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
      className="bg-background shadow rounded-2xl p-3 block w-full max-w-60 space-y-2"
    >
      <DifficultyBadge difficulty={difficulty} />
      <Image
        src={"/house.png"}
        alt="画像"
        width={80}
        height={80}
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
    className: "bg-green-100 text-green-800 font-semibold",
  },
  normal: {
    text: "ふつう",
    className: "bg-yellow-100 text-yellow-800 font-semibold",
  },
  hard: {
    text: "むずかしい",
    className: "bg-purple-100 text-purple-800 font-semibold",
  },
};

const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => {
  const d = DIFFICULTY[difficulty] ?? DIFFICULTY.easy;
  return <Badge className={d.className}>{d.text}</Badge>;
};
