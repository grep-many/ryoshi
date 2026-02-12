"use client";
import { CAMERA_POSITIONS, CAMERA_ZOOMS } from "@/constants";
import { useAITeacher } from "@/hooks";
import { CameraControls } from "@react-three/drei";
import { button, useControls } from "leva";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const CameraManager = () => {
  const controls = useRef<CameraControls>(null);
  const { loading, currentMessage } = useAITeacher();

  useEffect(() => {
    if (loading) {
      controls.current?.setPosition(...CAMERA_POSITIONS.loading, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.loading, true);
    } else if (currentMessage) {
      controls.current?.setPosition(...CAMERA_POSITIONS.speaking, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.speaking, true);
    }
  }, [loading, currentMessage]);

  useControls("Helper", {
    getCameraPosition: button(() => {
      if (controls.current) {
        const position = new THREE.Vector3();
        controls.current.getPosition(position);
        const zoom = controls.current.camera.zoom;
      }
    }),
  });

  return (
    <CameraControls
      ref={controls}
      minZoom={0.5}
      maxZoom={3}
      mouseButtons={{
        left: 1, // Rotate (ACTION.ROTATE)
        middle: 0, // None
        right: 0, // None
        wheel: 16, // Zoom (ACTION.ZOOM)
      }}
      touches={{
        one: 32, // One finger: Rotate (ACTION.TOUCH_ROTATE)
        two: 512, // Two fingers: Pinch to Zoom (ACTION.TOUCH_ZOOM)
        three: 0, // None
      }}
      dollySpeed={0.5}
      truckSpeed={0} // Disable "panning" (moving camera sideways) to keep focus on teacher
    />
  );
};