"use client";
import { OrbitControls, Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export default function MyTown() {
  return (
    <div className="w-full h-full">
      <Canvas>
        <Sky />
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshNormalMaterial />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
