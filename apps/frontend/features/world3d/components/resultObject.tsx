"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useRef } from "react";
import * as THREE from "three";
import { useObjectStore } from "@/stores";
import type { BuildingPartData } from "@/types";
import {
  CaptureController,
  type CaptureControllerHandle,
} from "./captureController";

const TriangleWall = ({ size }: { size: [number, number, number] }) => {
  const [width, height, depth = 0.1] = size;
  const triangleShape = new THREE.Shape();
  triangleShape.moveTo(-width / 2, 0);
  triangleShape.lineTo(width / 2, 0);
  triangleShape.lineTo(0, height);
  triangleShape.lineTo(-width / 2, 0);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };
  return <extrudeGeometry args={[triangleShape, extrudeSettings]} />;
};

// 建物パーツのレンダリング
function BuildingPart({
  size,
  position,
  rotation,
  color,
  type,
}: BuildingPartData["parts"][number]) {
  let geometry: THREE.BufferGeometry | null = null;

  if (type === "triangleWall") {
    const [width, height] = size;
    // 三角形の形状を作成
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(-width / 2, 0); // 左下
    triangleShape.lineTo(width / 2, 0); // 右下
    triangleShape.lineTo(0, height); // 上の頂点
    triangleShape.lineTo(-width / 2, 0); // 左下に戻る

    geometry = new THREE.ShapeGeometry(triangleShape);
  }
  return (
    <mesh
      position={position as [number, number, number]}
      rotation={rotation as [number, number, number]}
    >
      {geometry ? (
        <TriangleWall size={size as [number, number, number]} />
      ) : (
        <boxGeometry args={size as [number, number, number]} />
      )}

      <meshLambertMaterial color={color || "#8B4513"} />
    </mesh>
  );
}

// 建物コンポーネント
export function Buildings({
  buildingData,
}: {
  buildingData: BuildingPartData;
}) {
  return (
    <group position={buildingData.position} rotation={buildingData.rotation}>
      {buildingData.parts?.map((part, i) => (
        <BuildingPart
          // biome-ignore lint/suspicious/noArrayIndexKey: key
          key={i}
          type={part.type}
          position={part.position}
          rotation={part.rotation}
          color={part.color}
          size={part.size}
        />
      ))}
    </group>
  );
}

export type ResultObjectHandle = {
  capture: () => Promise<Record<string, Blob>>;
  captureThumbnail: () => Promise<Blob>;
};

const ResultObject = forwardRef<ResultObjectHandle>((_props, ref) => {
  const data = useObjectStore((state) => state.objectData);
  const captureRef = useRef<CaptureControllerHandle>(null);
  const buildingGroupRef = useRef<THREE.Group>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  const hasBuilding = !!data?.BuildingPartData;

  // 外部からキャプチャを呼び出せるようにする
  useImperativeHandle(ref, () => ({
    capture: async () => {
      if (!captureRef.current) {
        throw new Error("CaptureController is not ready");
      }
      return await captureRef.current.capture();
    },
    captureThumbnail: async () => {
      if (!displayCanvasRef.current) {
        throw new Error("Display canvas is not ready");
      }

      // 現在の表示用Canvasから4:3の比率でキャプチャ
      const sourceCanvas = displayCanvasRef.current;

      // 4:3の比率で800x600pxのオフスクリーンCanvasを作成
      const targetWidth = 800;
      const targetHeight = 600;
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = targetWidth;
      offscreenCanvas.height = targetHeight;
      const ctx = offscreenCanvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to get 2D context");
      }

      // ソースCanvasから中央部分を4:3の比率でクロップして描画
      const sourceWidth = sourceCanvas.width;
      const sourceHeight = sourceCanvas.height;
      const sourceAspect = sourceWidth / sourceHeight;
      const targetAspect = targetWidth / targetHeight;

      let sx = 0;
      let sy = 0;
      let sWidth = sourceWidth;
      let sHeight = sourceHeight;

      // 4:3の比率でクロップ
      if (sourceAspect > targetAspect) {
        // ソースの方が横長の場合、横をクロップ
        sWidth = sourceHeight * targetAspect;
        sx = (sourceWidth - sWidth) / 2;
      } else {
        // ソースの方が縦長の場合、縦をクロップ
        sHeight = sourceWidth / targetAspect;
        sy = (sourceHeight - sHeight) / 2;
      }

      // クロップした部分を描画
      ctx.drawImage(
        sourceCanvas,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        targetWidth,
        targetHeight,
      );

      // BlobとしてPNG画像を返す
      return new Promise<Blob>((resolve, reject) => {
        offscreenCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create thumbnail blob"));
          }
        }, "image/png");
      });
    },
  }));

  return (
    <>
      {/* キャプチャ用の隠しCanvas（512x512の正方形） */}
      {data && (
        <div className="sr-only" style={{ width: "512px", height: "512px" }}>
          <Canvas
            shadows
            camera={{ position: [10, 6, 10], fov: 50 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <ambientLight intensity={1.6} />
            <directionalLight position={[5, 10, 5]} intensity={2} castShadow />

            {hasBuilding && (
              <group ref={buildingGroupRef} position={[0, -1, 0]}>
                <Buildings buildingData={data.BuildingPartData} />
              </group>
            )}
            <CaptureController
              ref={captureRef}
              target={buildingGroupRef.current || undefined}
              padding={1.5}
            />
          </Canvas>
        </div>
      )}

      {/* 表示用Canvas */}
      {data ? (
        <Canvas
          shadows
          camera={{ position: [10, 6, 10], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            displayCanvasRef.current = gl.domElement;
          }}
        >
          <ambientLight intensity={1.6} />
          <directionalLight position={[5, 10, 5]} intensity={2} castShadow />

          {hasBuilding && (
            <group position={[0, -1, 0]}>
              <Buildings buildingData={data.BuildingPartData} />
            </group>
          )}
          <OrbitControls />
        </Canvas>
      ) : (
        <p className="text-muted-foreground text-center grow grid items-center">
          プロンプトを入力すると表示されます
        </p>
      )}
    </>
  );
});

ResultObject.displayName = "ResultObject";

export default ResultObject;
