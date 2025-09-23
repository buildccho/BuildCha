import { Grid } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import type { Vector3 } from "three";

type GroundProps = {
  cellSize?: number;
  dragThreshold?: number;
  onHover?: (pos: { x: number; z: number }) => void;
  onSelect?: (pos: { x: number; z: number; world: Vector3 }) => void;
};

export default function Ground({
  cellSize = 1,
  dragThreshold = 6,
  onHover,
  onSelect,
}: GroundProps) {
  const pointerRef = useRef<{
    downX: number;
    downY: number;
    isDown: boolean;
    isDragging: boolean;
  }>({ downX: 0, downY: 0, isDown: false, isDragging: false });
  const snap = (v: number) => Math.round(v / cellSize) * cellSize;

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerRef.current = {
      downX: e.clientX,
      downY: e.clientY,
      isDown: true,
      isDragging: false,
    };
  };
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const worldPoint = e.point as unknown as Vector3;
    const snappedX = snap(worldPoint.x);
    const snappedZ = snap(worldPoint.z);

    // グリッド範囲内かチェック（50x50グリッドの場合、-25から+25の範囲）
    const gridHalfSize = 25;
    if (
      Math.abs(snappedX) <= gridHalfSize &&
      Math.abs(snappedZ) <= gridHalfSize
    ) {
      onHover?.({ x: snappedX, z: snappedZ });
    } else {
      onHover?.({ x: Number.NaN, z: Number.NaN });
    }

    if (!pointerRef.current.isDown) return;
    const dx = e.clientX - pointerRef.current.downX;
    const dy = e.clientY - pointerRef.current.downY;
    if (Math.hypot(dx, dy) >= dragThreshold)
      pointerRef.current.isDragging = true;
  };
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    const wasDragging = pointerRef.current.isDragging;
    pointerRef.current = {
      downX: 0,
      downY: 0,
      isDown: false,
      isDragging: false,
    };
    if (wasDragging || !onSelect) return;

    const worldPoint = e.point as unknown as Vector3;
    const snappedX = snap(worldPoint.x);
    const snappedZ = snap(worldPoint.z);

    // グリッド範囲内の場合のみ選択を確定
    const gridHalfSize = 25;
    if (
      Math.abs(snappedX) <= gridHalfSize &&
      Math.abs(snappedZ) <= gridHalfSize
    ) {
      onSelect({
        x: snappedX,
        z: snappedZ,
        world: worldPoint.clone(),
      });
    }
  };
  return (
    <>
      <Grid
        args={[50, 50]}
        position={[0, 1, 0]}
        cellSize={cellSize}
        sectionSize={2}
      />
      <mesh
        position={[0, 0.98, 0]}
        rotation-x={-Math.PI / 2}
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => e.stopPropagation()}
        onPointerOut={() => onHover?.({ x: Number.NaN, z: Number.NaN })}
      >
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    </>
  );
}
