"use client";
import { Cloud, Clouds, Html, OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Hammer, Move, RotateCw } from "lucide-react";
import { useState } from "react";
import * as THREE from "three";
import Ground from "@/features/world3d/components/ground";
import { Buildings } from "@/features/world3d/components/resultObject";
import type { BuildingPartData } from "@/types";
import { Button } from "../ui/button";

export default function MyTown({
  objectsData,
}: {
  objectsData: BuildingPartData[];
}) {
  const [selectedObject, setSelectedObject] = useState<BuildingPartData | null>(
    null,
  );

  return (
    <div className="w-full h-full grow">
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

        <mesh castShadow position={[0, 3.5, 0]}>
          <boxGeometry args={[2, 5, 2]} />
          <meshLambertMaterial color="#008080" />
        </mesh>

        {/* 配置されたオブジェクト */}
        {objectsData.map((object) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: クリックで選択解除
          <group
            key={object.id}
            onClick={() => {
              setSelectedObject(object);
            }}
            onPointerOver={(e) => e.stopPropagation()}
            onPointerOut={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
          >
            <Buildings buildingData={object} />
          </group>
        ))}

        {selectedObject && <Controls object={selectedObject} />}

        {/* 地面 */}
        <Ground />
        <OrbitControls
          target={[0, 3, 0]} // 注視点を少し上に
        />
      </Canvas>
    </div>
  );
}

const Controls = ({ object }: { object: BuildingPartData }) => {
  return (
    <Html
      position={[
        object.position?.[0] || 0,
        (object.position?.[1] || 0) + 7,
        object.position?.[2] || 0,
      ]}
      center
    >
      <div className="bg-white/70 border border-white backdrop-blur-sm rounded-xl p-1 shrink-0 relative flex gap-0.5">
        <Button variant="ghost" className="font-semibold">
          <Hammer />
          作りかえる
        </Button>
        <Button variant="ghost" onClick={() => {}} className="font-semibold">
          <RotateCw />
          まわす
        </Button>
        <Button variant="ghost" onClick={() => {}} className="font-semibold">
          <Move />
          うごかす
        </Button>
      </div>
    </Html>
  );
};
