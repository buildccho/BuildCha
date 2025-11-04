"use client";
import { Cloud, Clouds, Html, OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Hammer, Move, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as THREE from "three";
import Ground from "@/features/world3d/components/ground";
import { Buildings } from "@/features/world3d/components/resultObject";
import { useGetMyTown } from "@/features/world3d/hooks/useGetMaps";
import { useUpdateBuilding } from "@/features/world3d/hooks/useUpdateBuilding";
import { calculateBoundingBox } from "@/features/world3d/utils/buildingCalculations";
import { useObjectStore } from "@/stores";
import type { BuildingPartData } from "@/types";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

export default function MyTown() {
  const { map, isLoading, mutate } = useGetMyTown();
  const { reset } = useObjectStore();
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [movingObjectId, setMovingObjectId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    z: number;
  } | null>(null);
  const [confirmedPosition, setConfirmedPosition] = useState<{
    objectId: string;
    position: [number, number, number];
  } | null>(null);
  const { updatePosition, updateRotation } = useUpdateBuilding();
  const router = useRouter();

  useEffect(() => {
    reset();
  }, [reset]);

  const handleGroundHover = (pos: { x: number; z: number }) => {
    if (movingObjectId && !Number.isNaN(pos.x) && !Number.isNaN(pos.z)) {
      setHoverPosition(pos);
    } else {
      setHoverPosition(null);
    }
  };

  const handleGroundSelect = async (pos: {
    x: number;
    z: number;
    world: THREE.Vector3;
  }) => {
    if (!movingObjectId) return;

    const newPosition: [number, number, number] = [pos.x, 1, pos.z];
    const objectId = movingObjectId;

    // クリックした瞬間に位置を確定表示
    setConfirmedPosition({ objectId, position: newPosition });
    setMovingObjectId(null);
    setHoverPosition(null);

    try {
      // バックグラウンドでAPI呼び出し
      await updatePosition(objectId, newPosition, async () => {
        // データ再取得を待つ
        await mutate();
      });

      // API成功後、確定位置をクリア（サーバーデータが反映される）
      setConfirmedPosition(null);
      setSelectedObject(null);
    } catch {
      // エラー時も確定位置をクリアして元に戻す
      setConfirmedPosition(null);
    }
  };

  const cancelMove = () => {
    setMovingObjectId(null);
    setHoverPosition(null);
  };

  const handleRetryQuest = (questId: string | null) => {
    if (!questId) return;
    router.push(`/quests/${questId}`);
  };

  const handleMove = (objectId: string | undefined) => {
    if (!objectId) return;
    setMovingObjectId(objectId);
  };

  const handleRotate = async (
    objectId: string | undefined,
    currentRotation: [number, number, number] | undefined,
  ) => {
    if (!objectId) return;
    const rotation = currentRotation || [0, 0, 0];
    const newRotationY = (rotation[1] + Math.PI / 2) % (Math.PI * 2);

    try {
      await updateRotation(
        objectId,
        [rotation[0], newRotationY, rotation[2]],
        async () => {
          await mutate();
        },
      );
    } catch {
      // エラーは useUpdateBuilding 内でトースト表示される
    }
  };

  return (
    <div className="w-full h-full grow relative">
      {movingObjectId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <Move className="w-5 h-5" />
          <span className="font-medium">
            たてものをうごかせるよ！ - クリックして配置
          </span>
          <Button variant="secondary" size="sm" onClick={cancelMove}>
            キャンセル
          </Button>
        </div>
      )}
      <Canvas shadows camera={{ fov: 45, position: [5, 15, -40] }}>
        <ambientLight intensity={Math.PI / 1.5} />
        <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />
        <directionalLight
          castShadow
          intensity={0.5}
          position={[-10, 10, -10]}
        />
        {/* 空 */}
        <Sky inclination={0.7} rayleigh={0.3} turbidity={3} />
        <Clouds material={THREE.MeshBasicMaterial} limit={100}>
          <Cloud
            scale={2}
            volume={4}
            color="white"
            fade={100}
            position={[0, 25, 50]}
          />
          <Cloud
            scale={2}
            volume={5}
            color="white"
            fade={100}
            position={[20, 20, 40]}
          />
          <Cloud
            scale={2}
            volume={4}
            color="white"
            fade={100}
            position={[80, 28, 40]}
          />
          <Cloud
            scale={2}
            volume={5}
            color="white"
            fade={100}
            position={[90, 23, 70]}
          />
        </Clouds>

        {!isLoading &&
          map?.userObjects.map((object) => {
            const isMoving = movingObjectId === object.id;
            const showAtHoverPosition = isMoving && hoverPosition;
            const isConfirmed = confirmedPosition?.objectId === object.id;

            // 表示する位置を決定
            let displayPosition = object.position;
            if (showAtHoverPosition) {
              // ホバー中はホバー位置
              displayPosition = [hoverPosition.x, 1, hoverPosition.z];
            } else if (isConfirmed) {
              // 確定後（API待ち中）は確定位置
              displayPosition = confirmedPosition.position;
            }

            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: クリックで選択解除
              <group
                key={object.id}
                onClick={(e) => {
                  if (isMoving) return; // 移動モード中はクリック無効
                  e.stopPropagation();
                  if (selectedObject === object.id) {
                    setSelectedObject(null);
                  } else {
                    setSelectedObject(object.id);
                  }
                }}
              >
                <Buildings
                  buildingData={{
                    ...object,
                    position: displayPosition,
                  }}
                />

                {selectedObject === object.id && !isMoving && (
                  <ControlPanel
                    object={object}
                    onRetryQuest={() => handleRetryQuest(object.questId)}
                    onMove={() => handleMove(object.id)}
                    onRotate={() => handleRotate(object.id, object.rotation)}
                  />
                )}
              </group>
            );
          })}

        {/* <mesh castShadow position={[0, 3.5, 0]} key={object.id}>
              <boxGeometry args={[2, 5, 2]} />
              <meshLambertMaterial color="#008080" />
            </mesh> */}
        {/* 地面 */}
        <Ground
          onHover={movingObjectId ? handleGroundHover : undefined}
          onSelect={movingObjectId ? handleGroundSelect : undefined}
        />
        <OrbitControls
          enabled={!movingObjectId}
          target={[0, 3, 0]} // 注視点を少し上に
        />
      </Canvas>
    </div>
  );
}

const ControlPanel = ({
  object,
  onRetryQuest,
  onMove,
  onRotate,
}: {
  object: BuildingPartData;
  onRetryQuest: () => void;
  onMove: () => void;
  onRotate: () => void;
}) => {
  const { position } = object;
  const size = calculateBoundingBox(object);
  return (
    <Html
      position={[
        position?.[0] || 0,
        (position?.[1] || 0) + (size?.[1] || 0),
        position?.[2] || 0,
      ]}
      center
      style={{ pointerEvents: "auto" }}
    >
      <ButtonGroup>
        <Button variant="secondary" onClick={onRetryQuest}>
          <Hammer />
          同じクエストをやる
        </Button>
        <Button variant="secondary" onClick={onMove}>
          <Move />
          うごかす
        </Button>
        <Button variant="secondary" onClick={onRotate}>
          <RotateCw />
          まわす
        </Button>
      </ButtonGroup>
    </Html>
  );
};
