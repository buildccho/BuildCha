"use client";
import type { BuildingPartData } from "@/types";
import { calculateHoverGuideSize } from "../utils/buildingCalculations";

type HoverGuideProps = {
  hoverPosition: [number, number, number] | null;
  objectData: { BuildingPartData: BuildingPartData } | null;
  cellSize: number;
  rotation?: number; // Y軸回転（ラジアン）
};

export default function HoverGuide({
  hoverPosition,
  objectData,
  cellSize,
  rotation,
}: HoverGuideProps) {
  if (!hoverPosition) return null;

  const hoverGuideSize = calculateHoverGuideSize(
    objectData,
    cellSize,
    rotation,
  );

  return (
    <mesh
      position={[hoverPosition[0], 0.982, hoverPosition[2]]}
      rotation-x={-Math.PI / 2}
    >
      <planeGeometry args={hoverGuideSize as [number, number]} />
      <meshBasicMaterial color="#00aaff" transparent opacity={0.25} />
    </mesh>
  );
}
