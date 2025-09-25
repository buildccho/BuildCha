"use client";
import { useState } from "react";
import type { BuildingPartData } from "@/types";

export function useObjectPlacement() {
  const [placedObject, setPlacedObject] = useState<BuildingPartData | null>(
    null,
  );
  const [hoverPosition, setHoverPosition] = useState<
    [number, number, number] | null
  >(null);

  const placeObject = (data: BuildingPartData, x: number, z: number) => {
    // BuildingPartData 自体の position/rotation を更新
    const updatedData: BuildingPartData = {
      ...data,
      position: [x, 1.1, z],
      rotation: data.rotation || [0, 0, 0], // 既存回転を保持、なければ初期化
    };
    setPlacedObject(updatedData);
    setHoverPosition([x, 0, z]);
  };

  const updateHoverPosition = (x: number, z: number) => {
    if (Number.isNaN(x) || Number.isNaN(z)) {
      setHoverPosition(null);
    } else {
      setHoverPosition([x, 0, z]);
    }
  };

  const rotateObject = () => {
    if (!placedObject) return;

    const currentRotation = placedObject.rotation || [0, 0, 0];
    const newRotationY = (currentRotation[1] + Math.PI / 2) % (Math.PI * 2);
    const newRotation: [number, number, number] = [
      currentRotation[0],
      newRotationY,
      currentRotation[2],
    ];

    setPlacedObject({
      ...placedObject,
      rotation: newRotation,
    });
  };

  const setRotationAngle = (angleRadians: number) => {
    if (!placedObject) return;

    const currentRotation = placedObject.rotation || [0, 0, 0];
    const normalizedAngle = angleRadians % (Math.PI * 2);
    const newRotation: [number, number, number] = [
      currentRotation[0],
      normalizedAngle,
      currentRotation[2],
    ];

    setPlacedObject({
      ...placedObject,
      rotation: newRotation,
    });
  };

  const getCurrentRotationY = () => {
    return placedObject?.rotation?.[1] || 0;
  };

  const getCurrentRotationDegrees = () => {
    const radians = getCurrentRotationY();
    return Math.round((radians * 180) / Math.PI) % 360;
  };

  return {
    placedObject,
    hoverPosition,
    placeObject,
    updateHoverPosition,
    rotateObject,
    setRotation: setRotationAngle,
    getCurrentRotationY,
    getCurrentRotationDegrees,
  };
}
