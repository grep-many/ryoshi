"use client";
import { CameraControls } from "@react-three/drei";

export const CameraManager = () => {
  return (
    <CameraControls
      // dollySpeed={-1}
      zoom={[1, 1]}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{
        left: 1,
        right: 0,
        middle: 0,
        wheel: 16,
      }}
      touches={{
        one: 32,
        three: 0,
        two: 512,
      }}
    />
  );
};
