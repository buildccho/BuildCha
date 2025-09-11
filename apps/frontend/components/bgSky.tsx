"use client";
import { Cloud, Clouds, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

export default function BgSky() {
  return (
    <Canvas camera={{ position: [-120, 60, 40] }}>
      <Sky />
      <Clouds material={THREE.MeshBasicMaterial} limit={100}>
        <Cloud
          scale={3}
          volume={12}
          color="white"
          fade={150}
          position={[-120, 50, 40]}
          speed={0.2}
        />
        <Cloud
          scale={6}
          volume={15}
          color="white"
          fade={150}
          position={[0, 0, 40]}
          speed={0.15}
        />
        <Cloud
          scale={5}
          volume={12}
          color="white"
          fade={150}
          position={[100, 20, 20]}
          speed={0.18}
        />
        <Cloud
          scale={6}
          volume={15}
          color="white"
          fade={150}
          position={[60, 60, 90]}
          speed={0.22}
        />
      </Clouds>
    </Canvas>
  );
}
