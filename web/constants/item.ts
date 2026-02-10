import { degToRad } from "three/src/math/MathUtils.js";

type Placement = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

type ItemPlacement = {
  [key: string]: {
    classroom: Placement;
    teacher: Placement;
    board: Placement;
  };
};

export const itemPlacement: ItemPlacement = {
  default: {
    classroom: {
      position: [0.2, -1.7, -2],
    },
    teacher: {
      position: [-1, -1.7, -3],
    },
    board: {
      position: [0.45, 0.382, -6],
    },
  },
  alternative: {
    classroom: {
      position: [0.3, -1.7, -1.5],
      rotation: [0, degToRad(-90), 0],
      scale: 0.4,
    },
    teacher: { position: [-1, -1.7, -3] },
    board: { position: [1.4, 0.84, -8] },
  },
};