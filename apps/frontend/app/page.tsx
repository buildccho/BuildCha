import Link from "next/link";
import MyTown from "@/components/myTown";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4 min-h-svh">
      <div className="z-30 relative">
        <h1 className="font-bold text-2xl">BuildCha</h1>
        <Button asChild>
          <Link href={"/quests"}>作る</Link>
        </Button>
      </div>
      <div className="fixed inset-0 z-0">
        <MyTown />
      </div>
    </main>
  );
}
