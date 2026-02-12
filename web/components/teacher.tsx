"use client";

import { useAITeacher, TeacherOpt, teachers } from "@/hooks";
import { Html, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MathUtils, SkinnedMesh, Group, MeshStandardMaterial, Mesh } from "three";
import { randInt } from "three/src/math/MathUtils.js";
import { GLTF } from "three-stdlib";

// Constants
const ANIMATION_FADE_TIME = 0.5;

// Typing for the GLTF structure
interface TeacherGLTF extends GLTF {
  nodes: { [key: string]: THREE.Object3D };
  materials: { [key: string]: THREE.Material };
}

type TeacherActionName = "Idle" | "Talking" | "Talking2" | "Thinking";

interface Props extends React.ComponentPropsWithoutRef<"group"> {
  teacher: TeacherOpt;
}

export function Teacher({ teacher, ...props }: Props) {
  const group = useRef<Group>(null);

  // Load Teacher Model & Animations
  const { scene } = useGLTF(`/models/Teacher_${teacher}.glb`) as TeacherGLTF;
  const { animations } = useGLTF(`/models/animations_${teacher}.glb`);

  // Use generic for useAnimations to get typed actions
  const { actions, mixer } = useAnimations(animations, group);

  const [animation, setAnimation] = useState<TeacherActionName>("Idle");
  const [blink, setBlink] = useState(false);
  const [thinkingText, setThinkingText] = useState(".");

  const { currentMessage, loading } = useAITeacher();

  // Material setup - ensuring standard material for better lighting/performance
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        const oldMat = child.material as MeshStandardMaterial;
        child.material = new MeshStandardMaterial({
          map: oldMat.map,
        });
      }
    });
  }, [scene]);

  // Blinking logic
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const nextBlink = () => {
      blinkTimeout = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => {
            setBlink(false);
            nextBlink();
          }, 100);
        },
        randInt(1000, 5000),
      );
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Animation State Switcher
  useEffect(() => {
    if (loading) {
      setAnimation("Thinking");
    } else if (currentMessage) {
      setAnimation(randInt(0, 1) ? "Talking" : "Talking2");
    } else {
      setAnimation("Idle");
    }
  }, [currentMessage, loading]);

  /**
   * Helper for Morph Targets
   * target can be a name (string) or index (number)
   */
  const lerpMorphTarget = (target: string | number, value: number, speed = 0.1) => {
    scene.traverse((child) => {
      if (
        child instanceof SkinnedMesh &&
        child.morphTargetDictionary &&
        child.morphTargetInfluences
      ) {
        const index =
          typeof target === "string" ? child.morphTargetDictionary[target] : (target as number);

        if (index !== undefined && child.morphTargetInfluences[index] !== undefined) {
          child.morphTargetInfluences[index] = MathUtils.lerp(
            child.morphTargetInfluences[index],
            value,
            speed,
          );
        }
      }
    });
  };

  useFrame(() => {
    // 1. CONSTANT FACIAL EXPRESSIONS
    lerpMorphTarget("mouthSmile", 0.2, 0.5);
    lerpMorphTarget("eye_close", blink ? 1 : 0, 0.5);

    // 2. MOUTH RESET (This ensures the mouth closes perfectly when not talking)
    // We reset indices 0-21 every frame so lerp pulls them back to 0
    for (let i = 0; i <= 21; i++) {
      lerpMorphTarget(i, 0, 0.1);
    }

    // 3. LIP SYNC LOGIC (Overwrites reset if audio is active)
    if (
      currentMessage &&
      currentMessage.visemes &&
      (currentMessage as any).audioContext &&
      (currentMessage as any).startTime !== undefined
    ) {
      // Calculate elapsed time from the Web Audio Context
      const playbackTimeMs =
        ((currentMessage as any).audioContext.currentTime - (currentMessage as any).startTime) * 1000;

      // Find the current viseme based on timing
      for (let i = currentMessage.visemes.length - 1; i >= 0; i--) {
        const viseme = currentMessage.visemes[i];
        if (playbackTimeMs >= viseme[0]) {
          // Viseme indices usually map to 0-5 (A, I, U, E, O)
          lerpMorphTarget(viseme[1], 1, 0.25);
          break;
        }
      }

      // Handle Animation Transitions for Talking
      const currentAction = actions[animation];
      if (
        currentAction &&
        currentAction.time > currentAction.getClip().duration - ANIMATION_FADE_TIME
      ) {
        setAnimation((prev) => (prev === "Talking" ? "Talking2" : "Talking"));
      }
    }
  });

  // Handle Animation Transitions
  useEffect(() => {
    const action = actions[animation];
    if (action) {
      action
        .reset()
        .fadeIn(mixer.time > 0 ? ANIMATION_FADE_TIME : 0)
        .play();
      return () => {
        action.fadeOut(ANIMATION_FADE_TIME);
      };
    }
  }, [animation, actions, mixer]);

  // Loading Dots Logic
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setThinkingText((prev) => (prev.length === 3 ? "." : prev + "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <group {...props} dispose={null} ref={group}>
      {loading && (
        <Html position-y={teacher === "Nanami" ? 1.6 : 1.8}>
          <div className="flex -translate-x-1/2 items-center justify-center">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 font-bold text-black">
                {thinkingText}
              </span>
            </span>
          </div>
        </Html>
      )}
      <primitive object={scene} />
    </group>
  );
}

// Preload assets for a smooth experience
teachers.forEach((teacher) => {
  useGLTF.preload(`/models/Teacher_${teacher}.glb`);
  useGLTF.preload(`/models/animations_${teacher}.glb`);
});
