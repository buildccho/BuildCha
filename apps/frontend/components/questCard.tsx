import Image from "next/image";
import Link from "next/link";
import { Badge } from "./ui/badge";

export default function QuestCard({
  dificulty = "normal",
}: {
  dificulty?: "easy" | "normal" | "hard";
}) {
  return (
    <Link
      href={"/quests/detail"}
      className="bg-background shadow rounded-2xl p-3 block w-full max-w-60 space-y-2"
    >
      <DificultyBadge dificulty={dificulty} />
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

const DificultyBadge = ({
  dificulty,
}: {
  dificulty: "easy" | "normal" | "hard";
}) => {
  if (dificulty === "easy") {
    return (
      <Badge className="bg-green-100 text-green-800 font-semibold">
        かんたん
      </Badge>
    );
  } else if (dificulty === "normal") {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 font-semibold">
        ふつう
      </Badge>
    );
  } else if (dificulty === "hard") {
    return (
      <Badge className="bg-purple-100 text-purple-800 font-semibold">
        むずかしい
      </Badge>
    );
  }
  return <Badge>かんたん</Badge>;
};
