"use client";
import { CameraControls } from "@react-three/drei";

export const CameraManager = () => {
  return (
    <CameraControls
      makeDefault
      minDistance={1}
      maxDistance={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{
        left: 1,
        middle: 0,
        right: 0,
        wheel: 16,
      }}
      touches={{
        one: 32,
        two: 512,
        three: 0,
      }}
    />
  );
};
