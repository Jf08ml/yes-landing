"use client";

import { memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

function FlagPlane({ textureUrl }: { textureUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useTexture(textureUrl);

  const aspect = (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
  });

  return (
    <mesh
      ref={meshRef}
      scale={[aspect * 3, 3, 1]}
    >
      <planeGeometry args={[1, 1, 180, 180]} />
      <shaderMaterial
        uniforms={{
          uTexture: { value: texture },
          uTime: { value: 0 },
        }}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;

          void main() {
            vUv = uv;
            vec3 pos = position;

            // Envelope: 0 en el borde izquierdo (mástil fijo), 1 en el derecho (libre)
            float envelope = smoothstep(-0.5, 0.5, pos.x);

            // Onda principal — propagación horizontal fuerte
            float wave  = sin(pos.x * 4.5 - uTime * 3.2) * 0.58;
            // Segunda onda — textura orgánica
            float wave2 = sin(pos.x * 2.8 - uTime * 2.1 + 1.2) * 0.14;
            // Micro-detalle
            float wave3 = sin(pos.x * 8.0 - uTime * 4.0) * 0.05;

            pos.z += (wave + wave2 + wave3) * envelope;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uTexture;
          uniform float uTime;
          varying vec2 vUv;

          void main() {
            vec4 color = texture2D(uTexture, vUv);

            // Sombra dinámica que sigue las ondas — da sensación de volumen real
            float shadow = sin(vUv.x * 4.5 - uTime * 3.2) * 0.28
                         + sin(vUv.x * 2.8 - uTime * 2.1 + 1.2) * 0.14;
            float envelope = smoothstep(0.0, 1.0, vUv.x);
            float light = 0.82 + shadow * envelope * 0.38;

            color.rgb *= clamp(light, 0.55, 1.25);
            color.a *= 0.9;

            gl_FragColor = color;
          }
        `}
        transparent
      />
    </mesh>
  );
}

const FlagShaderBg = memo(function FlagShaderBg({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 z-0 opacity-[0.55] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ alpha: true }}>
        <ambientLight intensity={1} />
        <FlagPlane textureUrl={src} />
      </Canvas>
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
});

export default FlagShaderBg;
