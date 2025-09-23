import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SelectPosition from "@/features/world3d/components/selectPosition";

export default function PositionPage() {
  return (
    <main className="flex flex-col grow h-svh">
      <div className="grid mx-auto w-full px-4 xl:px-8 2xl:px-20 py-4 xl:py-10 gap-2 lg:gap-4 xl:gap-6 grow">
        <div className="flex justify-between items-end">
          <div>
            <Button variant={"link"} size={"sm"} asChild className="text-xs">
              <Link href="/quests/detail">
                <ChevronLeft className="size-3.5" />
                クエストにもどる
              </Link>
            </Button>
            <h2 className="text-xl xl:text-2xl font-bold pl-2">
              まちにおく場所を選ぶ
            </h2>
          </div>
          <Button size={"lg"} asChild>
            <Link href="/quests/complete">できた！</Link>
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-3 h-full flex flex-col">
          <div className="flex items-center gap-2 h-fit py-3">
            <Image
              src={"/AICharacter.png"}
              alt="AICharacter"
              width={50}
              height={50}
            />
            <p>置く場所を選んでね</p>
          </div>
          <div className="flex-1 min-h-0 rounded-xl overflow-hidden">
            <SelectPosition />
          </div>
        </div>
      </div>
    </main>
  );
}
