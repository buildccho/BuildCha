import { Hammer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MyTown from "@/components/layout/myTown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateTextShadow } from "@/lib/text-shadow";
import { AccountSettingDialog } from "../components/layout/accountSettingDialog";

export default function Home() {
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
        <div className="z-30 max-w-sm w-full relative pt-5 pr-12 place-self-end shrink-0">
          <AccountSettingDialog />
          <div className="bg-white/65 border border-white backdrop-blur-md rounded-xl px-2 py-0.5 w-full divide-y divide-foreground/15">
            <div className="flex items-center gap-6 w-full py-2 px-2">
              <div className="text-sm shrink-0">
                作った数 <span className="font-semibold text-2xl ml-1">4</span>
              </div>
              <div className="font-bold w-full text-center">なまえ</div>
            </div>
            <div className="flex items-center gap-6 w-full py-2 px-2">
              <div className="text-sm shrink-0">
                レベル <span className="font-semibold text-2xl ml-1">4</span>
              </div>
              <Progress value={40} />
            </div>
          </div>
        </div>

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
