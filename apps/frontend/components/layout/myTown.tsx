"use client";
import { Cloud, Clouds, Html, OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Hammer, Move, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import * as THREE from "three";
import Ground from "@/features/world3d/components/ground";
import { Buildings } from "@/features/world3d/components/resultObject";
import { useGetMyTown } from "@/features/world3d/hooks/useGetMaps";
import { useObjectStore } from "@/stores";
import type { BuildingPartData } from "@/types";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";

export default function MyTown() {
  const { map, isLoading } = useGetMyTown();
  const { reset } = useObjectStore();
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  useEffect(() => {
    reset();
  }, [reset]);

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

        {!isLoading &&
          map?.userObjects.map((object) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: クリックで選択解除
            <group
              key={object.id}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedObject === object.id) {
                  setSelectedObject(null);
                } else {
                  setSelectedObject(object.id);
                }
              }}
            >
              <Buildings buildingData={object} />
              {selectedObject === object.id && <ControlPanel object={object} />}
            </group>
          ))}

        {/* <mesh castShadow position={[0, 3.5, 0]} key={object.id}>
              <boxGeometry args={[2, 5, 2]} />
              <meshLambertMaterial color="#008080" />
            </mesh> */}
        {/* 地面 */}
        <Ground />
        <OrbitControls
          target={[0, 3, 0]} // 注視点を少し上に
        />
      </Canvas>
    </div>
  );
}

const ControlPanel = ({ object }: { object: BuildingPartData }) => {
  const { position, boundingBox } = object;
  // TODO: 作りなおす、うごかす、まわすを実装 patch叩く
  return (
    <Html
      position={[
        position?.[0] || 0,
        (position?.[1] || 0) + (boundingBox?.[1] || 0) - 0.5,
        position?.[2] || 0,
      ]}
      center
      style={{ pointerEvents: "auto" }}
    >
      <ButtonGroup>
        <Button variant="secondary">
          <Hammer />
          作りなおす
        </Button>
        <Button variant="secondary">
          <Move />
          うごかす
        </Button>
        <Button variant="secondary">
          <RotateCw />
          まわす
        </Button>
      </ButtonGroup>
    </Html>
  );
};
