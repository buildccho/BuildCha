"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { useObjectStore } from "@/stores/store";
import type { BuildingPartData } from "@/types";
import Ground from "./ground";
import { Buildings } from "./resultObject";

// objectDataから建物の占有サイズを計算する関数
function calculateBuildingSize(data: BuildingPartData): [number, number] {
  if (!data.parts || data.parts.length === 0) return [1, 1];

  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  data.parts.forEach((part) => {
    const [x, , z] = part.position;
    const [sizeX, , sizeZ] = part.size;

    // Y軸回転（ラジアン想定）
    const ry = Array.isArray(part.rotation) ? (part.rotation[1] ?? 0) : 0;

    const halfX = sizeX / 2;
    const halfZ = sizeZ / 2;

    // 回転矩形の軸揃え半径（XZ）
    const cos = Math.cos(ry);
    const sin = Math.sin(ry);
    const extentX = Math.abs(halfX * cos) + Math.abs(halfZ * sin);
    const extentZ = Math.abs(halfX * sin) + Math.abs(halfZ * cos);

    const partMinX = x - extentX;
    const partMaxX = x + extentX;
    const partMinZ = z - extentZ;
    const partMaxZ = z + extentZ;

    minX = Math.min(minX, partMinX);
    maxX = Math.max(maxX, partMaxX);
    minZ = Math.min(minZ, partMinZ);
    maxZ = Math.max(maxZ, partMaxZ);
  });

  const width = Math.ceil(maxX - minX);
  const depth = Math.ceil(maxZ - minZ);

  return [Math.max(1, width), Math.max(1, depth)];
}

export default function SelectPosition() {
  // 固定のテスト用Box位置
  const fixedBoxPosition: [number, number, number] = [5, 3.5, 5];

  const { objectData } = useObjectStore();
  const [placedObject, setPlacedObject] = useState<{
    data: NonNullable<typeof objectData>["BuildingPartData"];
    position: [number, number, number];
  } | null>(null);

  const [hoverPosition, setHoverPosition] = useState<
    [number, number, number] | null
  >(null);
  const cellSize = 1;

  // ホバーガイドのサイズを計算
  const hoverGuideSize = useMemo(() => {
    if (!objectData?.BuildingPartData) return [cellSize, cellSize];
    const [width, depth] = calculateBuildingSize(objectData.BuildingPartData);
    return [width * cellSize, depth * cellSize];
  }, [objectData]);
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ fov: 45, position: [5, 15, -40] }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={Math.PI / 1.5} />
        <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />
        <directionalLight
          castShadow
          intensity={0.5}
          position={[-10, 10, -10]}
        />

        {/* 固定位置のテスト用Box */}
        <mesh castShadow position={fixedBoxPosition}>
          <boxGeometry args={[2, 5, 2]} />
          <meshLambertMaterial color="#008080" />
        </mesh>

        {/* 配置されたオブジェクト */}
        {placedObject && (
          <Buildings
            buildingData={placedObject.data}
            position={placedObject.position}
          />
        )}
        {/* ホバーガイド */}
        {hoverPosition && (
          <mesh
            position={[hoverPosition[0], 0.982, hoverPosition[2]]}
            rotation-x={-Math.PI / 2}
          >
            <planeGeometry args={hoverGuideSize as [number, number]} />
            <meshBasicMaterial color="#00aaff" transparent opacity={0.25} />
          </mesh>
        )}
        {/* 地面 */}
        <Ground
          cellSize={cellSize}
          dragThreshold={6}
          onHover={({ x, z }) => {
            if (Number.isNaN(x) || Number.isNaN(z)) {
              setHoverPosition(null);
            } else {
              setHoverPosition([x, 0, z]);
            }
          }}
          onSelect={({ x, z }) => {
            if (objectData?.BuildingPartData) {
              setPlacedObject({
                data: objectData.BuildingPartData,
                position: [x, 1.1, z],
              });
            }
            setHoverPosition([x, 0, z]);
          }}
        />
        <OrbitControls
          target={[0, 3, 0]} // 注視点を少し上に
        />
      </Canvas>
    </div>
  );
}
