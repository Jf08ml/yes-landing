'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// AURORA SHADER — fondo animado con blobs orgánicos FBM
// ─────────────────────────────────────────────────────────────────────────────
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p = p*2.1 + vec2(1.7,9.2); a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.13;

    // Two-pass domain warp — shapes orgánicas, no circulares
    vec2 q = vec2(fbm(uv*1.9 + t*0.45), fbm(uv*1.9 + vec2(5.2,1.3) + t*0.35));
    vec2 r = vec2(fbm(uv*1.6 + q + vec2(1.7,9.2) + t*0.22),
                  fbm(uv*1.6 + q + vec2(8.3,2.8) + t*0.18));
    vec2 w = uv + r * 0.26;

    // Blobs
    float bA  = pow(smoothstep(0.86,0.0, length(w - vec2(0.08+0.07*sin(t*0.50), 0.05+0.06*cos(t*0.40)))), 1.3);
    float rA  = pow(smoothstep(0.68,0.0, length(w - vec2(0.93+0.05*cos(t*0.55), 0.08+0.07*sin(t*0.68)))), 1.7);
    float pA  = pow(smoothstep(0.74,0.0, length(w - vec2(0.47+0.11*sin(t*0.28+0.8), 0.40+0.08*cos(t*0.22)))), 1.8);
    float r2A = pow(smoothstep(0.60,0.0, length(w - vec2(0.04+0.06*cos(t*0.44), 0.82+0.05*sin(t*0.37)))), 2.1);
    float b2A = pow(smoothstep(0.64,0.0, length(w - vec2(0.90+0.06*sin(t*0.35), 0.85+0.05*cos(t*0.30)))), 2.0);

    float shimmer = fbm(uv * 5.5 + t * 0.5) * 0.04;

    vec3 base = vec3(0.918, 0.935, 0.995);
    vec3 blue = vec3(0.196, 0.239, 0.431); // #323D6E
    vec3 red  = vec3(0.929, 0.067, 0.094); // #ED1118
    vec3 lav  = vec3(0.68,  0.72,  0.97);

    vec3 col = base + shimmer;
    col = mix(col, blue, bA  * 0.48);
    col = mix(col, red,  rA  * 0.32);
    col = mix(col, lav,  pA  * 0.36);
    col = mix(col, red,  r2A * 0.22);
    col = mix(col, blue, b2A * 0.26);

    float vign = 1.0 - smoothstep(0.40, 1.10, length(uv - 0.5) * 1.6);
    col = mix(base + shimmer*0.4, col, vign * 0.93 + 0.07);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;

function AuroraPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh renderOrder={0}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={{ uTime: { value: 0 } }}
        depthTest={false}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RED NEURONAL — nodos (Points) + conexiones dinámicas (LineSegments)
// Cada frame: se calculan pares de nodos dentro del umbral de distancia y se
// dibujan líneas cuyo color se desvanece hacia el fondo según la distancia
// (cerca = color de marca saturado, lejos = casi invisible).
// ─────────────────────────────────────────────────────────────────────────────
const COUNT    = 90;                        // nodos — 90 da densidad visual limpia
const MAX_SEGS = COUNT * (COUNT - 1) / 2;  // cota superior de segmentos posibles

// Datos estáticos aleatorios fuera del componente (react-hooks/purity)
const RAND_POS   = Float32Array.from({ length: COUNT * 3 }, () => Math.random());
const RAND_IS_BLUE = Array.from({ length: COUNT }, () => Math.random() > 0.42);
const RAND_VX    = Float32Array.from({ length: COUNT }, () => Math.random());
const RAND_VY    = Float32Array.from({ length: COUNT }, () => Math.random());
const RAND_PHASE = Float32Array.from({ length: COUNT }, () => Math.random());

// Colores de nodo por índice (calculados una sola vez)
const NODE_COLORS = (() => {
  const c = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    c[i*3]   = RAND_IS_BLUE[i] ? 0.196 : 0.929;
    c[i*3+1] = RAND_IS_BLUE[i] ? 0.239 : 0.067;
    c[i*3+2] = RAND_IS_BLUE[i] ? 0.431 : 0.094;
  }
  return c;
})();

// Color de fondo del hero (para interpolar líneas hacia invisible)
const BG_R = 0.918, BG_G = 0.935, BG_B = 0.995;

function NeuralNet() {
  const { viewport } = useThree();

  // ── Geometría de nodos (posiciones actualizadas en useFrame) ──────────────
  const { nodeGeo, vx, vy, phase } = useMemo(() => {
    const hw = viewport.width  * 0.52;
    const hh = viewport.height * 0.52;

    const positions = new Float32Array(COUNT * 3);
    const vx    = new Float32Array(COUNT);
    const vy    = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (RAND_POS[i*3]   - 0.5) * hw * 2;
      positions[i*3+1] = (RAND_POS[i*3+1] - 0.5) * hh * 2;
      positions[i*3+2] =  RAND_POS[i*3+2] * 0.1;

      vx[i]    = (RAND_VX[i]  - 0.5) * 0.00045;
      vy[i]    =  RAND_VY[i]  * 0.00025 + 0.00006;
      phase[i] =  RAND_PHASE[i] * Math.PI * 2;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute('color',    new THREE.BufferAttribute(NODE_COLORS.slice(), 3));
    return { nodeGeo, vx, vy, phase };
  }, [viewport.width, viewport.height]);

  // ── Geometría de líneas (pre-alocada al máximo, drawRange controla cuántas) ─
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // 2 vértices por segmento × 3 componentes
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_SEGS * 6), 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(MAX_SEGS * 6), 3));
    geo.setDrawRange(0, 0); // empieza vacío
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const nodePosAttr  = nodeGeo.getAttribute('position') as THREE.BufferAttribute;
    const linePosAttr  = lineGeo.getAttribute('position') as THREE.BufferAttribute;
    const lineColAttr  = lineGeo.getAttribute('color')    as THREE.BufferAttribute;
    if (!nodePosAttr || !linePosAttr || !lineColAttr) return;

    const pos     = nodePosAttr.array as Float32Array;
    const linePos = linePosAttr.array as Float32Array;
    const lineCol = lineColAttr.array as Float32Array;
    const t       = clock.getElapsedTime();
    const hw      = viewport.width  * 0.55;
    const hh      = viewport.height * 0.55;

    // Umbral de conexión: ~18 % del ancho del viewport
    const THRESH  = viewport.width * 0.18;
    const THRESH2 = THRESH * THRESH; // evitar sqrt en el inner loop

    // ── 1. Mover nodos ──────────────────────────────────────────────────────
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]     += vx[i] + Math.sin(t * 0.26 + phase[i]) * 0.00014;
      pos[i*3 + 1] += vy[i];
      if (pos[i*3+1] >  hh) pos[i*3+1] -= hh * 2;
      if (pos[i*3]   >  hw) pos[i*3]   -= hw * 2;
      if (pos[i*3]   < -hw) pos[i*3]   += hw * 2;
    }
    nodePosAttr.needsUpdate = true;

    // ── 2. Recalcular conexiones ─────────────────────────────────────────────
    let seg = 0; // índice de segmento activo

    for (let i = 0; i < COUNT && seg < MAX_SEGS; i++) {
      const xi = pos[i*3], yi = pos[i*3+1], zi = pos[i*3+2];

      for (let j = i + 1; j < COUNT && seg < MAX_SEGS; j++) {
        const dx = xi - pos[j*3];
        const dy = yi - pos[j*3+1];
        const d2 = dx*dx + dy*dy;

        if (d2 < THRESH2) {
          // Fuerza de conexión: 1 = tocándose, 0 = en el umbral
          const strength = 1 - Math.sqrt(d2) / THRESH;

          // Color interpolado entre el fondo (invisible) y el color del nodo i
          const ni = i * 3;
          const base6 = seg * 6;

          // Vértice A (nodo i)
          linePos[base6]   = xi;
          linePos[base6+1] = yi;
          linePos[base6+2] = zi;
          lineCol[base6]   = BG_R + (NODE_COLORS[ni]   - BG_R) * strength;
          lineCol[base6+1] = BG_G + (NODE_COLORS[ni+1] - BG_G) * strength;
          lineCol[base6+2] = BG_B + (NODE_COLORS[ni+2] - BG_B) * strength;

          // Vértice B (nodo j)
          const nj = j * 3;
          linePos[base6+3] = pos[j*3];
          linePos[base6+4] = pos[j*3+1];
          linePos[base6+5] = pos[j*3+2];
          lineCol[base6+3] = BG_R + (NODE_COLORS[nj]   - BG_R) * strength;
          lineCol[base6+4] = BG_G + (NODE_COLORS[nj+1] - BG_G) * strength;
          lineCol[base6+5] = BG_B + (NODE_COLORS[nj+2] - BG_B) * strength;

          seg++;
        }
      }
    }

    lineGeo.setDrawRange(0, seg * 2); // 2 vértices por segmento
    linePosAttr.needsUpdate = true;
    lineColAttr.needsUpdate = true;
  });

  return (
    <>
      {/* Nodos */}
      <points geometry={nodeGeo} renderOrder={2}>
        <pointsMaterial
          vertexColors
          transparent
          opacity={0.80}
          size={3.5}
          sizeAttenuation={false}
          depthTest={false}
        />
      </points>

      {/* Conexiones */}
      <lineSegments geometry={lineGeo} renderOrder={1}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={1}
          depthTest={false}
          linewidth={1}  // >1 solo funciona en WebGL2 / algunas GPUs
        />
      </lineSegments>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroBackground() {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, zIndex: -20 }}
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'default', alpha: false }}
      resize={{ debounce: 100 }}
    >
      <AuroraPlane />
      <NeuralNet />
    </Canvas>
  );
}
