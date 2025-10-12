"use client";
import { Cloud, Clouds, OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Ground from "@/features/world3d/components/ground";

export default function MyTown() {
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
        {/* 地面 */}
        <Ground />
        <OrbitControls
          target={[0, 3, 0]} // 注視点を少し上に
        />
      </Canvas>
    </div>
  );
}
