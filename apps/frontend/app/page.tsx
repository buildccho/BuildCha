import { Hammer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MyTown from "@/components/layout/myTown";
import { Button } from "@/components/ui/button";
import { ProfileSection } from "@/features/auth/components/profileSection";
import { generateTextShadow } from "@/lib/text-shadow";

export default async function Home() {
  const style = generateTextShadow({
    strokes: [{ width: 4, color: "#fff" }],
    directionCount: 256,
    blur: 1,
    digits: 1,
  });

  return (
    <main className="mx-auto py-10 px-4 md:px-6 lg:px-8 xl:px-10 min-h-svh flex">
      <div className="relative grow grid grid-cols-2 content-between">
        <div className="z-30 flex items-center gap-2">
          <Image
            src={"/AICharacter.png"}
            alt="AIキャラ"
            width={64}
            height={64}
          />
          <div className="bg-white shadow-sm text-base rounded-xl w-fit px-4 py-2.5">
            あそびかたを知りたかったら
            <br />
            ぼくにきいてね！
          </div>
        </div>
        <ProfileSection />

        <Button
          asChild
          size={"round"}
          variant={"game"}
          style={{ textShadow: style }}
          className="place-self-end z-30 col-span-2"
        >
          <Link href={"/quests"}>
            <Hammer />
            クエスト
          </Link>
        </Button>
      </div>
      <div className="fixed inset-0 z-0">
        <MyTown />
      </div>
    </main>
  );
}
