import * as THREE from "three";
import {create} from "zustand/react";

type Store = {
  color: string;
  texture: THREE.Texture | null;
  setColor: (color: string) => void;
  setTexture: (texture: THREE.Texture | null) => void;
}

export const useCardSettings = create<Store>((set => ({
  color: "#707070",
  texture: null,
  setColor: (color) => set((state => ({
    ...state,
    color,
  }))),
  setTexture: (texture) => set((state) => ({
    ...state,
    texture,
  })),
})));
