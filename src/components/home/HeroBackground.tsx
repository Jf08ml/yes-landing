'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { feature } from 'topojson-client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const worldAtlas = require('world-atlas/countries-110m.json');

// ─────────────────────────────────────────────────────────────────────────────
// AURORA SHADER — fondo animado con blobs orgánicos FBM (sin cambios)
// ─────────────────────────────────────────────────────────────────────────────
const auroraVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;
const auroraFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float vnoise(vec2 p) {
    vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
  }
  float fbm(vec2 p) {
    float v=0.0,a=0.5;
    for(int i=0;i<3;i++){v+=a*vnoise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}
    return v;
  }
  void main() {
    vec2 uv=vUv; float t=uTime*0.13;
    vec2 q=vec2(fbm(uv*1.9+t*0.45),fbm(uv*1.9+vec2(5.2,1.3)+t*0.35));
    vec2 r=vec2(fbm(uv*1.6+q+vec2(1.7,9.2)+t*0.22),fbm(uv*1.6+q+vec2(8.3,2.8)+t*0.18));
    vec2 w=uv+r*0.26;
    float bA=pow(smoothstep(0.86,0.0,length(w-vec2(0.08+0.07*sin(t*0.50),0.05+0.06*cos(t*0.40)))),1.3);
    float rA=pow(smoothstep(0.68,0.0,length(w-vec2(0.93+0.05*cos(t*0.55),0.08+0.07*sin(t*0.68)))),1.7);
    float pA=pow(smoothstep(0.74,0.0,length(w-vec2(0.47+0.11*sin(t*0.28+0.8),0.40+0.08*cos(t*0.22)))),1.8);
    float r2A=pow(smoothstep(0.60,0.0,length(w-vec2(0.04+0.06*cos(t*0.44),0.82+0.05*sin(t*0.37)))),2.1);
    float b2A=pow(smoothstep(0.64,0.0,length(w-vec2(0.90+0.06*sin(t*0.35),0.85+0.05*cos(t*0.30)))),2.0);
    float shimmer=fbm(uv*5.5+t*0.5)*0.04;
    vec3 base=vec3(0.918,0.935,0.995),blue=vec3(0.196,0.239,0.431),red=vec3(0.929,0.067,0.094),lav=vec3(0.68,0.72,0.97);
    vec3 col=base+shimmer;
    col=mix(col,blue,bA*0.48); col=mix(col,red,rA*0.32);
    col=mix(col,lav,pA*0.36);  col=mix(col,red,r2A*0.22); col=mix(col,blue,b2A*0.26);
    float vign=1.0-smoothstep(0.40,1.10,length(uv-0.5)*1.6);
    col=mix(base+shimmer*0.4,col,vign*0.93+0.07);
    gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
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
      <shaderMaterial ref={matRef} vertexShader={auroraVert} fragmentShader={auroraFrag}
        uniforms={{ uTime: { value: 0 } }} depthTest={false} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHADER — Atmósfera (halo sutil solo en el borde, FrontSide)
// ─────────────────────────────────────────────────────────────────────────────
const atmVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const atmFrag = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vec3  viewDir = normalize(-vViewPos);
    float rim     = 1.0 - max(dot(vNormal, viewDir), 0.0);
    // Solo el borde extremo — pow alto = halo fino
    rim = pow(rim, 4.5);
    gl_FragColor  = vec4(0.38, 0.65, 1.0, rim * 0.50);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHADER — Puntos de países con halo pulsante
// ─────────────────────────────────────────────────────────────────────────────
const dotVert = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 0.42 * (280.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;
const dotFrag = /* glsl */ `
  varying vec3 vColor;
  uniform float uTime;
  void main() {
    vec2  uv   = gl_PointCoord - 0.5;
    float d    = length(uv);
    // Núcleo sólido
    float core = 1.0 - smoothstep(0.15, 0.20, d);
    // Halo pulsante con offset por color (rojo y azul pulsan desfasados)
    float beat = sin(uTime * 2.2 + vColor.b * 3.14) * 0.5 + 0.5;
    float halo = (1.0 - smoothstep(0.22, 0.50, d)) * 0.30 * beat;
    float alpha = core + halo;
    if (alpha < 0.01) discard;
    vec3  bright = vColor + vec3(0.3) * core;
    gl_FragColor = vec4(clamp(bright, 0.0, 1.0), alpha);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// SHADER — Anillo de llegada (ripple al destino del arco)
// aArrivalPhase: 0 = sin efecto, 1 = llegada completa/fade out
// ─────────────────────────────────────────────────────────────────────────────
const ringVert = /* glsl */ `
  attribute float aArrivalPhase;
  varying  float vPhase;
  void main() {
    vPhase = aArrivalPhase;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // El punto crece a medida que el anillo se expande
    gl_PointSize = (0.46 + vPhase * 2.3) * (280.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;
const ringFrag = /* glsl */ `
  varying float vPhase;
  void main() {
    if (vPhase < 0.01) discard;
    vec2  uv    = gl_PointCoord - 0.5;
    float d     = length(uv);
    // Anillo que se expande hacia afuera
    float ringR = 0.06 + vPhase * 0.40;
    float ring  = 1.0 - smoothstep(0.0, 0.04, abs(d - ringR));
    float alpha = ring * pow(1.0 - vPhase, 1.8) * 0.90;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(0.80, 0.92, 1.0, alpha);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBO CON MAPAMUNDI REAL
// ─────────────────────────────────────────────────────────────────────────────
const GLOBE_R  = 1.8;
const ARC_LIFT = 0.52;
const ARC_PTS  = 64;
const CYCLE_S  = 6.0;
const TAIL_PTS = Math.floor(ARC_PTS * 0.55);

function toVec3(lat: number, lng: number, r = GLOBE_R): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta),
  );
}

// IDs numéricos ISO 3166-1 de los países destacados (world-atlas usa estos IDs)
const EN_IDS = new Set([840, 826, 36, 124, 566, 710, 372, 554]); // USA, UK, AU, CA, NG, ZA, IE, NZ
const FR_IDS = new Set([250, 56, 504, 686, 180, 756, 384, 450]);  // FR, BE, MA, SN, CD, CH, CI, MG

// Países de habla inglesa (puntos y arcos)
const EN_COUNTRIES = [
  { lat: 38,   lng: -97   }, // EE.UU.
  { lat: 51.5, lng: -0.1  }, // Reino Unido
  { lat: -25,  lng: 133   }, // Australia
  { lat: 56,   lng: -96   }, // Canadá
  { lat:  9,   lng:  8    }, // Nigeria
  { lat: -30,  lng: 25    }, // Sudáfrica
  { lat: 53,   lng: -8    }, // Irlanda
  { lat: -41,  lng: 174   }, // Nueva Zelanda
];

// Países de habla francesa (puntos y arcos)
const FR_COUNTRIES = [
  { lat: 46,   lng:  2    }, // Francia
  { lat: 50.5, lng:  4.5  }, // Bélgica
  { lat: 32,   lng: -5    }, // Marruecos
  { lat: 14,   lng: -14   }, // Senegal
  { lat: -4,   lng: 24    }, // R.D. Congo
  { lat: 47,   lng:  8    }, // Suiza
  { lat:  7,   lng: -6    }, // Costa de Marfil
  { lat: -20,  lng: 47    }, // Madagascar
];

const PAIRS: [number, number][] = [
  [0, 0], [1, 2], [2, 5], [3, 1],
  [4, 6], [5, 4], [6, 3], [7, 7],
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE GLOBO
// ─────────────────────────────────────────────────────────────────────────────
function GlobeScene() {
  const groupRef  = useRef<THREE.Group>(null);
  const dotMatRef = useRef<THREE.ShaderMaterial>(null);
  const ringMatRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const globeScale = Math.max(0.77, Math.min(1.31, viewport.aspect * 0.79));
  const xOffset    = viewport.aspect > 1
    ? Math.max(-0.8, -(viewport.aspect * 0.22))  // desktop: centrado, apenas hacia la izquierda
    : 0;                                           // mobile: centrado

  const { borderGeo, enBorderGeo, frBorderGeo, dotsGeo, arcLines, ringGeo } = useMemo(() => {
    // ── Fronteras 3D — base + resaltadas por grupo ──────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countries = feature(worldAtlas, worldAtlas.objects.countries) as any;
    const borderPts: number[] = [];
    const enPts: number[]     = [];
    const frPts: number[]     = [];

    const collectRing = (ring: number[][], dst: number[]) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = toVec3(ring[i][1],   ring[i][0]);
        const b = toVec3(ring[i+1][1], ring[i+1][0]);
        dst.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    countries.features.forEach((feat: any) => {
      const g  = feat.geometry;
      const id = Number(feat.id);
      if (!g) return;
      const isEN = EN_IDS.has(id);
      const isFR = FR_IDS.has(id);
      const rings: number[][][] = g.type === 'Polygon'
        ? g.coordinates
        : g.type === 'MultiPolygon'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? g.coordinates.flatMap((p: any) => p)
          : [];
      rings.forEach((ring: number[][]) => {
        collectRing(ring, borderPts);
        if (isEN) collectRing(ring, enPts);
        if (isFR) collectRing(ring, frPts);
      });
    });

    const mkGeo = (pts: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      return g;
    };
    const borderGeo   = mkGeo(borderPts);
    const enBorderGeo = mkGeo(enPts);
    const frBorderGeo = mkGeo(frPts);

    // ── Puntos de países (shader personalizado con glow) ─────────────────────
    const dotPts: number[] = [], dotCols: number[] = [];
    EN_COUNTRIES.forEach(({ lat, lng }) => {
      const p = toVec3(lat, lng, GLOBE_R + 0.04);
      dotPts.push(p.x, p.y, p.z);
      dotCols.push(0.929, 0.067, 0.094); // rojo marca
    });
    FR_COUNTRIES.forEach(({ lat, lng }) => {
      const p = toVec3(lat, lng, GLOBE_R + 0.04);
      dotPts.push(p.x, p.y, p.z);
      dotCols.push(0.216, 0.435, 0.831); // azul vivo
    });
    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dotPts), 3));
    dotsGeo.setAttribute('color',    new THREE.BufferAttribute(new Float32Array(dotCols), 3));

    // ── Arcos animados (curvas Bézier) ───────────────────────────────────────
    const arcLines = PAIRS.map(([ei, fi]) => {
      const from = toVec3(EN_COUNTRIES[ei].lat, EN_COUNTRIES[ei].lng);
      const to   = toVec3(FR_COUNTRIES[fi].lat, FR_COUNTRIES[fi].lng);
      const mid  = from.clone().add(to).normalize().multiplyScalar(GLOBE_R + ARC_LIFT);
      const pts  = new THREE.QuadraticBezierCurve3(from, mid, to).getPoints(ARC_PTS);
      const geo  = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array(pts.flatMap(p => [p.x, p.y, p.z])), 3,
      ));
      geo.setDrawRange(0, 0);
      const mat  = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.92, depthTest: false });
      const line = new THREE.Line(geo, mat);
      line.renderOrder = 4;
      return line;
    });

    // ── Posiciones de llegada: destino de cada arco (FR country en orden de PAIRS)
    const ringPts = PAIRS.flatMap(([, fi]) => {
      const p = toVec3(FR_COUNTRIES[fi].lat, FR_COUNTRIES[fi].lng, GLOBE_R + 0.05);
      return [p.x, p.y, p.z];
    });
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position',      new THREE.BufferAttribute(new Float32Array(ringPts), 3));
    ringGeo.setAttribute('aArrivalPhase', new THREE.BufferAttribute(new Float32Array(PAIRS.length), 1));

    return { borderGeo, enBorderGeo, frBorderGeo, dotsGeo, arcLines, ringGeo };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = t * 0.07;
    if (dotMatRef.current) dotMatRef.current.uniforms.uTime.value = t;

    const arrivalAttr = ringGeo.getAttribute('aArrivalPhase') as THREE.BufferAttribute;
    const arrivalArr  = arrivalAttr.array as Float32Array;

    arcLines.forEach((line, i) => {
      const phase = ((t / CYCLE_S) + i / arcLines.length) % 1;
      const head  = Math.floor(phase * ARC_PTS);
      const tail  = Math.max(0, head - TAIL_PTS);
      line.geometry.setDrawRange(tail, head - tail);

      // Fase de llegada: sube de 0→1 en el último 25% del ciclo, luego cae a 0
      arrivalArr[i] = Math.max(0, (phase - 0.75) / 0.25);
    });
    arrivalAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[xOffset, 0, 0]} scale={globeScale}>

      {/* Océano — tinte muy suave para dar profundidad sin tapar la aurora */}
      <mesh renderOrder={1}>
        <sphereGeometry args={[GLOBE_R, 32, 20]} />
        <meshBasicMaterial color="#1A3A6A" transparent opacity={0.18} depthTest={false} />
      </mesh>

      {/* Atmósfera — halo fino en el borde, FrontSide */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[GLOBE_R + 0.08, 28, 14]} />
        <shaderMaterial
          vertexShader={atmVert}
          fragmentShader={atmFrag}
          transparent
          depthTest={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Fronteras base — todos los países */}
      <lineSegments geometry={borderGeo} renderOrder={3}>
        <lineBasicMaterial color="#5A90D0" transparent opacity={0.55} depthTest={false} />
      </lineSegments>

      {/* Fronteras resaltadas — países de habla inglesa (rojo marca) */}
      <lineSegments geometry={enBorderGeo} renderOrder={4}>
        <lineBasicMaterial color="#ED1118" transparent opacity={0.95} depthTest={false} />
      </lineSegments>

      {/* Fronteras resaltadas — países de habla francesa (azul marca) */}
      <lineSegments geometry={frBorderGeo} renderOrder={4}>
        <lineBasicMaterial color="#4A6FD8" transparent opacity={0.95} depthTest={false} />
      </lineSegments>

      {/* Puntos de países con glow pulsante */}
      <points geometry={dotsGeo} renderOrder={5}>
        <shaderMaterial
          ref={dotMatRef}
          vertexShader={dotVert}
          fragmentShader={dotFrag}
          uniforms={{ uTime: { value: 0 } }}
          transparent
          depthTest={false}
        />
      </points>

      {/* Arcos animados */}
      {arcLines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}

      {/* Anillos de llegada — ripple al destino de cada arco */}
      <points geometry={ringGeo} renderOrder={6}>
        <shaderMaterial
          ref={ringMatRef}
          vertexShader={ringVert}
          fragmentShader={ringFrag}
          transparent
          depthTest={false}
        />
      </points>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroBackground() {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, zIndex: -20 }}
      camera={{ position: [0, 0, 4], near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: 'default', alpha: false }}
      resize={{ debounce: 100 }}
    >
      <AuroraPlane />
      <GlobeScene />
    </Canvas>
  );
}
