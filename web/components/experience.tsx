"use client";
import { Environment, Gltf } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CameraManager } from "@/components";

export const Experience = () => {
  return (
    <Canvas camera={{ position: [0, 0, 0.0001] }}>
      <Environment preset="sunset" />
      <CameraManager />
      <ambientLight intensity={0.8} color={"pink"} />
      <Gltf src="/models/classroom_default.glb" position={[0.2, -1.7, -2]} />
    </Canvas>
  );
};
