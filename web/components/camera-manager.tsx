"use client"
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
        console.log([position.x, position.y, position.z], zoom);
      }
    }),
  });

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{
        left: 1, // ACTION.ROTATE
        wheel: 16, // ACTION.ZOOM
      }}
      touches={{
        one: 32, // ACTION.TOUCH_ROTATE
        two: 512, // ACTION.TOUCH_ZOOM
      }}
    />
  );
};
