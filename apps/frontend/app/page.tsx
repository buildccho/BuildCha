import MyTown from "@/components/myTown";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto py-6 px-4 min-h-svh">
      <div className="z-30 relative">
        <h1 className="font-bold text-3xl">BuildCha</h1>
        <Button>ボタン</Button>
      </div>
      <div className="fixed inset-0 z-0">
        <MyTown />
      </div>
    </div>
  );
}
