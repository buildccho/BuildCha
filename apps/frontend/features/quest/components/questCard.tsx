import { Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Quest } from "@/types";

export default function QuestCard({
  quest,
  isUnlocked = true,
}: {
  quest: Quest;
  isUnlocked?: boolean;
}) {
  return (
    <Link
      href={isUnlocked ? `/quests/${quest.id}` : "#"}
      className={`${quest.difficulty === "Easy" ? "bg-background" : quest.difficulty === "Medium" ? "bg-yellow-50" : "bg-purple-50"} relative shadow rounded-2xl p-2.5 flex flex-col w-full max-w-60 space-y-1 ${isUnlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
    >
      {!isUnlocked && (
        <div className="absolute top-0 left-0 z-30 w-full h-full bg-black/55 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-2">
          <Lock className="size-6 text-white" />
          <p className="text-white text-sm font-semibold text-center leading-relaxed">
            レベル {quest.level} になったら
            <br />
            作れるよ
          </p>
        </div>
      )}
      <DifficultyBadge difficulty={quest.difficulty as Difficulty} />
      <div className="flex-1 relative w-full h-full flex items-center justify-center aspect-video">
        <Image
          src={`https://pub-68bb760998324b59b97c4622e8ba2d68.r2.dev/thumbnail/${encodeURIComponent(quest.id)}.png`}
          alt="画像"
          fill
          className="object-contain w-full h-full block"
          loading="lazy"
        />
      </div>
      <h2 className="text-base font-semibold text-end line-clamp-1">
        {quest.name}
      </h2>
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
