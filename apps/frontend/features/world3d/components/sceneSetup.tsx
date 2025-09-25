type SceneSetupProps = {
  children: React.ReactNode;
};

export default function SceneSetup({ children }: SceneSetupProps) {
  return (
    <>
      <ambientLight intensity={Math.PI / 1.5} />
      <pointLight castShadow intensity={0.8} position={[100, 100, 100]} />
      <directionalLight castShadow intensity={0.5} position={[-10, 10, -10]} />
      {children}
    </>
  );
}
