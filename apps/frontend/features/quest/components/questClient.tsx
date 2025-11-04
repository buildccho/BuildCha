"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  ChevronLeft,
  Home,
  Plus,
  RefreshCw,
  RotateCw,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Chat from "@/features/quest/components/chat";
import QuestCard, {
  DifficultyBadge,
} from "@/features/quest/components/questCard";
import ResultObject, {
  Buildings,
} from "@/features/world3d/components/resultObject";
import SelectPosition from "@/features/world3d/components/selectPosition";
import { useObjectPlacement } from "@/features/world3d/hooks/useObjectPlacement";
import { calculateBoundingBox } from "@/features/world3d/utils/buildingCalculations";
import { client } from "@/lib/rpc-client";
import type { Quest, UserObject } from "@/types";
import { useSaveObject } from "../hooks/useSaveObject";

export default function QuestClient({ quest }: { quest: Quest }) {
  const [displayMode, setDisplayMode] = useState<
    "chat" | "position" | "result"
  >("chat");

  const {
    isLoading,
    handleSaveObject,
    isDisabled,
    resultObjectRef,
    object,
    result,
  } = useSaveObject();

  const objectPlacement = useObjectPlacement();

  return (
    <>
      {displayMode === "chat" && (
        <ChatMode
          quest={quest}
          setDisplayMode={setDisplayMode}
          handleSaveObject={handleSaveObject}
          isDisabled={isDisabled}
          isLoading={isLoading}
        />
      )}
      {displayMode === "position" && (
        <PositionMode
          setDisplayMode={setDisplayMode}
          objectId={object?.id}
          objectPlacement={objectPlacement}
        />
      )}
      {displayMode === "result" &&
        (result && object && !isLoading ? (
          <ResultMode quest={quest} result={result} object={object} />
        ) : isLoading ? (
          <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center p-4 lg:py-6 gap-6">
            <div className="flex items-center justify-center gap-4 w-full h-fit">
              <div className="bg-white rounded-xl overflow-hidden w-full relative max-w-52 h-fit">
                <Image
                  src={`https://pub-68bb760998324b59b97c4622e8ba2d68.r2.dev/thumbnail/${quest.id}.png`}
                  alt="お手本"
                  width={200}
                  height={200}
                  className="object-contain block w-full h-full"
                />
              </div>
              <RefreshCw className="size-6 animate-spin" />
              <div className="bg-white rounded-xl overflow-hidden w-full relative max-w-52 h-full">
                <ResultObject />
              </div>
            </div>

            <div className="flex items-center gap-2 animate-pulse">
              <Image
                src={"/AICharacter.png"}
                alt="AIキャラ"
                width={44}
                height={44}
                className="object-cover block"
              />
              <p className="text-base font-semibold">
                お手本と作ったものをくらべているよ
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 lg:py-6 gap-4">
            <p className="text-lg font-bold">ごめんね。エラーが発生したよ</p>
            <Button
              size={"lg"}
              variant={"secondary"}
              onClick={() => {
                setDisplayMode("chat");
              }}
            >
              <RefreshCw />
              もう一度やり直す
            </Button>
          </div>
        ))}
      <div className="sr-only">
        <ResultObject ref={resultObjectRef} />
      </div>
    </>
  );
}

const ChatMode = ({
  quest,
  setDisplayMode,
  handleSaveObject,
  isDisabled,
  isLoading,
}: {
  quest: Quest;
  setDisplayMode: (mode: "chat" | "position" | "result") => void;
  handleSaveObject: ({
    questId,
    handleChangeMode,
  }: {
    questId: string;
    handleChangeMode: () => void;
  }) => Promise<void>;
  isDisabled: boolean;
  isLoading: boolean;
}) => {
  return (
    <main className="w-full flex flex-col md:h-svh grow mx-auto xl:container max-w-7xl px-4 py-2 xl:py-6">
      <div className="flex justify-between items-end">
        <div>
          <Button variant={"link"} size={"sm"} asChild>
            <Link href="/quests">
              <ChevronLeft className="size-3.5" />
              クエスト一覧にもどる
            </Link>
          </Button>
          <div className="flex items-center gap-1 xl:gap-2 pl-2">
            <h2 className="text-xl xl:text-2xl font-bold">{quest.name}</h2>
            <DifficultyBadge
              difficulty={quest.difficulty as "Easy" | "Medium" | "Hard"}
            />
          </div>
        </div>
        <Button
          size="lg"
          onClick={() =>
            handleSaveObject({
              questId: quest.id,
              handleChangeMode: () => setDisplayMode("position"),
            })
          }
          disabled={isDisabled}
        >
          {isLoading ? "保存中..." : "おく場所を選ぶ"}
        </Button>
      </div>
      <div className="grid gap-x-4 gap-y-5 xl:gap-x-8 lg:gap-y-5 py-3 lg:py-4 xl:py-5 grid-cols-1 md:grid-cols-7 md:grid-rows-7 grow h-[calc(100%-100px)]">
        <div className="bg-white flex flex-col gap-2 rounded-xl p-4 xl:p-6 col-span-1 md:col-span-3 md:row-span-3 pb-4">
          <h2 className="text-base xl:text-lg">お手本</h2>
          <div className="w-full h-full grow max-h-full flex items-center justify-center relative">
            {quest.answerObject && quest.answerObject.length > 0 ? (
              <Canvas
                shadows
                camera={{ position: [10, 6, 10], fov: 50 }}
                gl={{ preserveDrawingBuffer: true }}
              >
                <ambientLight intensity={1.6} />
                <directionalLight
                  position={[5, 10, 5]}
                  intensity={2}
                  castShadow
                />
                <Buildings
                  buildingData={{
                    parts: quest.answerObject,
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                  }}
                />
                <OrbitControls />
              </Canvas>
            ) : (
              <Image
                src={`https://pub-68bb760998324b59b97c4622e8ba2d68.r2.dev/thumbnail/${quest.id}.png`}
                alt="お手本"
                fill
                className="object-contain block"
              />
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl h-full flex flex-col p-4 xl:p-6 col-span-1 md:col-span-3 md:row-span-4 md:col-start-1 md:row-start-4">
          <h2 className="text-base xl:text-lg">結果</h2>
          <ResultObject />
        </div>
        <div className="bg-white rounded-xl h-full p-4 xl:p-6 flex flex-col col-span-1 md:col-span-4 md:row-span-7 md:col-start-4 md:row-start-1">
          <h2 className="text-base xl:text-lg">チャット</h2>
          <Chat />
        </div>
      </div>
    </main>
  );
};

const PositionMode = ({
  setDisplayMode,
  objectId,
  objectPlacement,
}: {
  setDisplayMode: (mode: "chat" | "position" | "result") => void;
  objectId: string | undefined;
  objectPlacement: ReturnType<typeof useObjectPlacement>;
}) => {
  const handleUpdatePosition = async () => {
    try {
      if (!objectId) {
        throw new Error("オブジェクトIDがありません");
      }

      const { placedObject } = objectPlacement;
      if (!placedObject) {
        throw new Error("オブジェクトが配置されていません");
      }

      // SelectPositionで選択された位置と回転を使用
      const position = placedObject.position || [0, 0, 0];
      const rotation = placedObject.rotation || [0, 0, 0];
      const boundingBox = calculateBoundingBox(placedObject);

      const res = await client.objects[":id"].$patch({
        param: {
          id: objectId,
        },
        json: {
          position: position,
          rotation: rotation,
          boundingBox: boundingBox,
        },
      });
      if (!res.ok) {
        throw new Error("位置更新に失敗しました");
      }
      const data = await res.json();
      console.log("位置と回転を更新しました:", { position, rotation, data });
      toast.success("建物を配置しました！");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "位置更新に失敗しました",
      );
    }
    setDisplayMode("result");
  };
  return (
    <main className="flex flex-col grow h-svh">
      <div className="grid mx-auto w-full px-4 xl:px-8 2xl:px-20 py-4 xl:py-10 gap-2 lg:gap-4 xl:gap-8 grow">
        <div className="flex justify-between items-end">
          <h2 className="text-base md:text-xl xl:text-2xl font-bold pl-2">
            まちのどこにおくかえらんでね！
          </h2>
          <Button size={"lg"} onClick={handleUpdatePosition}>
            できた！
          </Button>
        </div>

        <div className="relative bg-white/50 border border-white backdrop-blur-sm rounded-3xl overflow-hidden h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <SelectPosition objectPlacement={objectPlacement} />
          </div>
        </div>
      </div>
    </main>
  );
};

const ResultMode = ({
  quest,
  result,
  object,
}: {
  quest: Quest;
  result: {
    objectScore: number;
    userLevel: number;
    userScore: number;
    comment: string;
  } | null;
  object: UserObject | null;
}) => {
  if (!result || !object) {
    return null;
  }

  const LEVEL_COEFFICIENT = 0.02;
  const currentLevelStartScore = Math.floor(
    (result.userLevel || 0) / LEVEL_COEFFICIENT,
  );
  const nextLevelScore = Math.floor(
    ((result.userLevel || 0) + 1) / LEVEL_COEFFICIENT,
  );
  const scoreInCurrentLevel = (result.userScore || 0) - currentLevelStartScore;
  const scoreNeededForNextLevel = nextLevelScore - currentLevelStartScore;
  const progressPercentage =
    scoreNeededForNextLevel > 0
      ? (scoreInCurrentLevel / scoreNeededForNextLevel) * 100
      : 0;

  return (
    <main className="w-full min-h-screen grid place-items-center p-4 lg:py-6">
      <div className="max-w-6xl grid w-full px-6 py-6 lg:px-9 lg:py-9 xl:px-12 xl:py-12 rounded-3xl gap-6 xl:gap-9 bg-white/60 border border-white backdrop-blur-sm shadow-lg shadow-black/5">
        <div className="flex flex-row gap-2 items-center justify-between py-1">
          <h1 className="text-2xl xl:text-3xl font-bold">
            クエストクリア！{object.name}を作ったよ
          </h1>
          <div className="flex gap-3">
            <Button asChild size={"lg"} variant={"secondary"}>
              <Link href="/">
                <Home />
                ホームに戻る
              </Link>
            </Button>
            <Button asChild size={"lg"} variant={"default"}>
              <Link href="/quests">
                <Plus />
                新しいクエスト
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex gap-8 xl:gap-12">
          <div className="bg-white rounded-xl py-8 px-10 w-fit shrink-0 shadow">
            <ResultObject />
          </div>

          <div className="flex flex-col gap-6 w-full justify-center items-start">
            <div className="flex items-center gap-2">
              <Image
                src={"/AICharacter.png"}
                alt="AIキャラ"
                width={44}
                height={44}
                className="object-cover block"
              />
              <div className="bg-white rounded-md px-3 py-2 text-sm lg:text-base font-medium">
                {String(result.comment)}
              </div>
            </div>

            <div className="flex flex-col gap-4 shrink-0 w-full">
              <div className="flex gap-3 items-baseline w-full">
                <div className="flex gap-1 items-center text-foreground/80">
                  <Sparkles size={18} className="text-primary" />
                  そっくり
                </div>
                <div className="font-bold text-4xl">
                  {result.objectScore}
                  <span className="text-base ml-1">%</span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <div className="w-full max-w-sm">
                  <div className="flex gap-2 justify-between items-baseline w-full">
                    <div className="flex items-baseline text-foreground/80">
                      レベル
                      <span className="font-bold text-foreground text-3xl ml-1.5">
                        {result.userLevel}
                      </span>
                    </div>
                    <div className="text-muted-foreground shrink-0 flex items-baseline gap-1">
                      <span className="font-bold text-foreground">
                        {scoreInCurrentLevel}
                      </span>{" "}
                      / {scoreNeededForNextLevel}
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 md:gap-6 pt-3 md:pt-6">
          <div className="flex flex-col gap-2 col-span-1">
            <h3 className="font-semibold text-base flex items-center gap-1.5">
              <RotateCw size={14} className="text-foreground/80" /> つくりなおす
            </h3>
            <QuestCard quest={quest} />
          </div>
          <div className="flex flex-col gap-2 col-span-3">
            <h3 className="font-semibold text-base">次はどれをつくる？</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* <QuestCard quest={quest} />
        <QuestCard quest={quest} />
        <QuestCard quest={quest} /> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
