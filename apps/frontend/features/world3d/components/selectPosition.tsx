"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useObjectStore } from "@/stores";
import { useObjectPlacement } from "../hooks/useObjectPlacement";
import Ground from "./ground";
import HoverGuide from "./hoverGuide";
import { Buildings } from "./resultObject";
import RotationControl from "./rotationControl";
import SceneSetup from "./sceneSetup";

export default function SelectPosition() {
  const fixedBoxPosition: [number, number, number] = [5, 3.5, 5];
  const cellSize = 1;

  const { objectData } = useObjectStore();
  const { isTouchDevice } = useDeviceDetection();
  const {
    placedObject,
    hoverPosition,
    placeObject,
    updateHoverPosition,
    rotateObject,
    getCurrentRotationY,
  } = useObjectPlacement();

  const [selectedObject, setSelectedObject] = useState<boolean>(false);

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

  // 建物選択時の処理
  const handleBuildingClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation(); // イベントバブリングを停止
    if (placedObject) {
      setSelectedObject(true);
    }
  };

  // 他の場所クリック時の選択解除
  const handleGroundSelect = ({ x, z }: { x: number; z: number }) => {
    setSelectedObject(false);
    if (objectData?.BuildingPartData) {
      placeObject(objectData.BuildingPartData, x, z);
    }
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 45, position: [5, 15, -40] }}>
        <SceneSetup>
          {/* 固定位置のテスト用Box */}
          <mesh castShadow position={fixedBoxPosition}>
            <boxGeometry args={[2, 5, 2]} />
            <meshLambertMaterial color="#008080" />
          </mesh>

          {/* 配置されたオブジェクト */}
          {placedObject && (
            // biome-ignore lint/a11y/noStaticElementInteractions: クリックで選択解除
            <group
              onClick={handleBuildingClick}
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
              visible={isTouchDevice ? true : selectedObject}
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
