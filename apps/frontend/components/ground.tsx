import { Grid } from "@react-three/drei";

export default function Ground() {
  return (
    <>
      <Grid args={[50, 50]} position={[0, 1, 0]} cellSize={1} sectionSize={2} />
      <mesh position={[0, 0.98, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
    </>
  );
}
