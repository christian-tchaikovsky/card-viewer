import { useRef } from "react";
import type React from "react";

import * as THREE from "three";
import classNames from "classnames";
import {Canvas} from "@react-three/fiber";
import {Center, Decal, Environment, OrbitControls, Text3D} from "@react-three/drei";

import {useCardSettings} from "./store/card.ts";

import "./App.css";

const CARD_WIDTH = 3.4;
const CARD_HEIGHT = 2.1;
const CARD_RADIUS = 0.2;
const CARD_COLORS = ["#b0b0b0", "#707070", "#000000"];

const createCardShape = () => {
  const shape = new THREE.Shape();

  shape.moveTo(-CARD_WIDTH / 2 + CARD_RADIUS, -CARD_HEIGHT / 2);
  shape.lineTo(CARD_WIDTH / 2 - CARD_RADIUS, -CARD_HEIGHT / 2);
  shape.quadraticCurveTo(CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH / 2, -CARD_HEIGHT / 2 + CARD_RADIUS);
  shape.lineTo(CARD_WIDTH / 2, CARD_HEIGHT / 2 - CARD_RADIUS);
  shape.quadraticCurveTo(CARD_WIDTH / 2, CARD_HEIGHT / 2, CARD_WIDTH / 2 - CARD_RADIUS, CARD_HEIGHT / 2);
  shape.lineTo(-CARD_WIDTH / 2 + CARD_RADIUS, CARD_HEIGHT / 2);
  shape.quadraticCurveTo(-CARD_WIDTH / 2, CARD_HEIGHT / 2, -CARD_WIDTH / 2, CARD_HEIGHT / 2 - CARD_RADIUS);
  shape.lineTo(-CARD_WIDTH / 2, -CARD_HEIGHT / 2 + CARD_RADIUS);
  shape.quadraticCurveTo(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, -CARD_WIDTH / 2 + CARD_RADIUS, -CARD_HEIGHT / 2);

  return shape;
};

const Card3DText = ({
  text = "primary",
  letterSpacing,
  position,
  children,
}: React.PropsWithChildren<{
  letterSpacing?: number,
  text?: "primary" | "secondary";
  position?: [number, number, number];
}>) => {
  const font = text === "primary"
    ? "/Century-Gothic_Regular.json"
    : "/Farrington-7B-Qiqi_Regular.json";

  return (
    <Text3D
      font={font}
      size={0.1}
      height={0.02}
      position={position}
      letterSpacing={letterSpacing}
    >
      {children}
    </Text3D>
  );
};

const Card = () => {
  const color = useCardSettings((state) => state.color);
  const texture = useCardSettings((state) => state.texture);

  const shape = createCardShape();

  const geometry = {
    card: new THREE.ExtrudeGeometry(shape, {
      depth: 0.041,
      bevelEnabled: false,
    }),
    image: new THREE.ExtrudeGeometry(shape, {
      depth: 0.001,
      bevelEnabled: false,
    }),
  };

  return (
    <group>
      <mesh geometry={geometry.card}>
        <meshStandardMaterial
          color={color}
          metalness={0.5}
          roughness={0.3}
        />
        {texture && (
          <mesh
            geometry={geometry.image}
            position={[0, 0, 0.041]}
          >
            <Decal scale={[-CARD_WIDTH, CARD_HEIGHT, 1]}>
              <meshStandardMaterial
                map={texture}
                metalness={0.5}
                roughness={0.3}
                side={THREE.FrontSide}
              />
            </Decal>
          </mesh>
        )}
      </mesh>
      <Card3DText text="secondary" position={[-1.3, 0.6, 0.04]} letterSpacing={0.02}>
        1234 5678 9012 3456
      </Card3DText>
      <Card3DText position={[-1.3, -0.7, 0.04]}>
        JOHN DOE
      </Card3DText>
      <Card3DText position={[0.95, -0.7, 0.04]}>
        12/25
      </Card3DText>
    </group>
  );
};

function App() {
  const {color, setColor, setTexture} = useCardSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const texture = new THREE.Texture(image);

        texture.flipY = false;
        texture.offset.set(0, 0);
        texture.center.set(0.5, 0.5);
        texture.repeat.set(1, CARD_HEIGHT / CARD_WIDTH);
        texture.needsUpdate = true;

        setTexture(texture);
      };
      image.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="wrapper">
      <Canvas camera={{position: [2, 0, 5], fov: 50}}>
        <ambientLight intensity={0.5 * Math.PI}/>
        <Environment preset="city"/>
        <Center>
          <Card/>
        </Center>
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
      <div className="colors">
        {CARD_COLORS.map((item, i) => (
          <div
            key={`${item}_${i}`}
            style={{backgroundColor: item}}
            onClick={() => {
              setColor(item);
            }}
            className={classNames("color", {
              "color-active": color === item,
            })}
          />
        ))}
      </div>
      <button
        style={{backgroundColor: color}}
        className="upload-button"
        onClick={() => {
          fileRef.current?.click();
        }}
      >
        UPLOAD IMAGE
        <input
          hidden
          name="texture"
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />
      </button>
    </div>
  );
}

export default App;
