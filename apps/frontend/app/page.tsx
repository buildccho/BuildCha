import { Hammer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import MyTown from "@/components/layout/myTown";
import { Button } from "@/components/ui/button";
import { ProfileSection } from "@/features/auth/components/profileSection";
import {
  createMap,
  fetchMapById,
  fetchMaps,
} from "@/features/world3d/api/maps";
import { fetchObjectById } from "@/features/world3d/api/objects";
import { generateTextShadow } from "@/lib/text-shadow";
import type { BuildingPartData } from "@/types";

const jsonNumberArrayParser = (json: string) => {
  return JSON.parse(json) as [number, number, number];
};

export default async function Home() {
  const style = generateTextShadow({
    strokes: [{ width: 4, color: "#fff" }],
    directionCount: 256,
    blur: 1,
    digits: 1,
  });

  // マップを取得 or 作成
  let mapList = await fetchMaps();
  if (mapList.length === 0) {
    const newMap = await createMap("First Town");
    mapList = [newMap];
  }
  const map = await fetchMapById(mapList[0].id);
  if (!map) return null;

  // オブジェクトを取得
  const rawObjects: (BuildingPartData | null)[] = await Promise.all(
    map.userObjects.map(async (object) => {
      const objectData = await fetchObjectById(object.id);
      if (!objectData) {
        return null;
      }
      return {
        ...object,
        parts: objectData.parts.map((part) => ({
          ...part,
          position: jsonNumberArrayParser(part.position),
          rotation: jsonNumberArrayParser(part.rotation),
          size: jsonNumberArrayParser(part.size),
          role: part.role as "Answer" | "User",
        })),
        position: jsonNumberArrayParser(object.position),
        rotation: jsonNumberArrayParser(object.rotation),
        boundingBox: jsonNumberArrayParser(object.boundingBox),
      };
    }),
  );

  const objectsData: BuildingPartData[] = rawObjects.filter(
    (data): data is BuildingPartData => data !== null,
  );

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
        <MyTown objectsData={objectsData} />
      </div>
    </main>
  );
}
