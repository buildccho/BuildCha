import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SelectPosition from "@/features/world3d/components/selectPosition";

export default function PositionPage() {
  return (
    <main className="flex flex-col grow h-svh">
      <div className="grid mx-auto w-full px-4 xl:px-8 2xl:px-20 py-4 xl:py-10 gap-2 lg:gap-4 xl:gap-8 grow">
        <div className="flex justify-between items-end">
          <div>
            <Button variant={"link"} size={"sm"} asChild>
              <Link href="/quests/detail">
                <ChevronLeft className="size-3.5" />
                クエストにもどる
              </Link>
            </Button>
            <h2 className="text-base md:text-xl xl:text-2xl font-bold pl-2">
              まちのどこにおくかえらんでね！
            </h2>
          </div>
          <Button size={"lg"} asChild>
            <Link href="/quests/complete">できた！</Link>
          </Button>
        </div>

        <div className="relative bg-white/50 border border-white backdrop-blur-sm rounded-3xl overflow-hidden h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <SelectPosition />
          </div>
        </div>
      </div>
    </main>
  );
}
