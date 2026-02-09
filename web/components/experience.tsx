"use client";
import { Environment, Gltf, Html } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { BoardSettings, CameraManager, MessagesList, Teacher, TypingBox } from "@/components";
import { degToRad } from "three/src/math/MathUtils.js";
import { itemPlacement } from "@/constants";
import { useAITeacher } from "@/hooks";

export const Experience = () => {
  const { classroom } = useAITeacher();

  return (
    <>
      <div className="fixed right-4 bottom-4 left-4 z-10 flex flex-wrap justify-stretch gap-3 md:justify-center">
        <TypingBox />
      </div>
      <Canvas camera={{ position: [0, 0, 0.0001] }}>
        <Environment preset="sunset" />
        <CameraManager />
        <ambientLight intensity={0.8} color={"pink"} />
        <Html transform {...itemPlacement[classroom].board} distanceFactor={1}>
          <MessagesList />
          <BoardSettings />
        </Html>
        <Teacher
          teacher={"Nanami"}
          position={[-1, -1.7, -2.5]}
          scale={1.5}
          rotation-y={degToRad(20)}
        />
        <Gltf src="/models/classroom_default.glb" position={[0.2, -1.7, -0.4]} />
      </Canvas>
    </>
  );
};
