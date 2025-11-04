"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useObjectStore } from "@/stores";
import { useGetMyTown } from "../hooks/useGetMaps";
import type { useObjectPlacement } from "../hooks/useObjectPlacement";
import Ground from "./ground";
import HoverGuide from "./hoverGuide";
import { Buildings } from "./resultObject";
import RotationControl from "./rotationControl";
import SceneSetup from "./sceneSetup";

interface SelectPositionProps {
  objectPlacement: ReturnType<typeof useObjectPlacement>;
}

export default function SelectPosition({
  objectPlacement,
}: SelectPositionProps) {
  const cellSize = 1;

  const { objectData } = useObjectStore();
  const { isTouchDevice } = useDeviceDetection();
  const { map, isLoading } = useGetMyTown();
  const {
    placedObject,
    hoverPosition,
    placeObject,
    updateHoverPosition,
    rotateObject,
    getCurrentRotationY,
  } = objectPlacement;

  // キーボード操作（PC補助機能）
  useEffect(() => {
    if (isTouchDevice) return; // タッチデバイスでは無効

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (placedObject) {
          rotateObject();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [placedObject, rotateObject, isTouchDevice]);

  // 他の場所クリック時の選択解除
  const handleGroundSelect = ({ x, z }: { x: number; z: number }) => {
    if (objectData?.BuildingPartData) {
      placeObject(objectData.BuildingPartData, x, z);
    }
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 45, position: [5, 15, -40] }}>
        <SceneSetup>
          {!isLoading &&
            map?.userObjects
              .filter((object) => object.position)
              .map((object) => (
                <Buildings buildingData={object} key={object.id} />
              ))}
          {/* 配置されたオブジェクト */}
          {placedObject && (
            <group
              onPointerOver={(e) => e.stopPropagation()}
              onPointerOut={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
            >
              <Buildings buildingData={placedObject} />
            </group>
          )}

          {/* 回転コントロール */}
          {placedObject && (
            <RotationControl
              visible={true}
              currentRotation={getCurrentRotationY()}
              onRotate={rotateObject}
              position={[
                placedObject.position?.[0] || 0,
                (placedObject.position?.[1] || 0) + 3,
                placedObject.position?.[2] || 0,
              ]}
              isTouchDevice={isTouchDevice}
            />
          )}

          {/* ホバーガイド */}
          <HoverGuide
            hoverPosition={hoverPosition}
            objectData={objectData}
            cellSize={cellSize}
            rotation={getCurrentRotationY()}
          />

          {/* 地面 */}
          <Ground
            cellSize={cellSize}
            dragThreshold={6}
            onHover={({ x, z }) => updateHoverPosition(x, z)}
            onSelect={handleGroundSelect}
          />

          <OrbitControls target={[0, 3, 0]} />
        </SceneSetup>
      </Canvas>
    </div>
  );
}
