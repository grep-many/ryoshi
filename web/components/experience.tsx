"use client";
import { useAITeacher } from "@/hooks";
import { Environment, Float, Gltf, Html, Loader, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense } from "react";
import { degToRad } from "three/src/math/MathUtils.js";
import { BoardSettings, MessagesList, Teacher, TypingBox, CameraManager } from "@/components";
import { itemPlacement } from "@/constants";

export const Experience = () => {
  const teacher = useAITeacher((state) => state.teacher);
  const classroom = useAITeacher((state) => state.classroom);

  return (
    <>
      <div className="fixed right-4 bottom-4 left-4 z-10 flex flex-wrap justify-stretch gap-3 md:justify-center">
        <TypingBox />
      </div>
      <Leva hidden />
      <Loader />
      <Canvas
        camera={{
          position: [0, 0, 0.0001],
        }}
      >
        <CameraManager />

        <Suspense fallback={null}>
          <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
            <Html transform position={itemPlacement[classroom].board.position} distanceFactor={1}>
              <MessagesList />
              <BoardSettings />
            </Html>
            <Environment preset="sunset" />
            <ambientLight intensity={0.8} color="pink" />

            <Gltf
              src={`/models/classroom_${classroom}.glb`}
              {...itemPlacement[classroom].classroom}
            />
            <Teacher
              teacher={teacher}
              key={teacher}
              position={itemPlacement[classroom].teacher.position}
              scale={1.5}
              rotation-y={degToRad(20)}
            />
          </Float>
        </Suspense>
      </Canvas>
    </>
  );
};

useGLTF.preload("/models/classroom_default.glb");
useGLTF.preload("/models/classroom_alternative.glb");
