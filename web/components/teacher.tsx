"use client"
import { useGLTF } from "@react-three/drei";
import React from "react";

export const teachers = ["Nanami", "Naoki"] as const;

type Teachers = (typeof teachers)[number];

type Props = React.JSX.IntrinsicElements["group"] & {
  teacher: Teachers;
};

export const Teacher = ({ teacher, ...props }: Props) => {
  const { scene } = useGLTF(`/models/Teacher_${teacher}.glb`);

  return (
    <group {...props}>
      <primitive object={scene} />
    </group>
  );
};

teachers.forEach((teacher) => useGLTF.preload(`/models/Teacher_${teacher}.glb`));
