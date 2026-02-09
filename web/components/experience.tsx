"use client";
import { Environment, Gltf } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { CameraManager, Teacher } from "@/components";
import { degToRad } from "three/src/math/MathUtils.js";

export const Experience = () => {
  return (
    <Canvas camera={{ position: [0, 0, 0.0001] }}>
      <Environment preset="sunset" />
      <CameraManager />
      <ambientLight intensity={0.8} color={"pink"} />
      <Teacher teacher={"Nanami"} position={[-1,-1.7,-3]} scale={1.5} rotation-y={degToRad(20)}/>
      <Gltf src="/models/classroom_default.glb" position={[0.2, -1.7, -2]} />
    </Canvas>
  );
};
