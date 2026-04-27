"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom, Glitch, Scanline } from "@react-three/postprocessing"
import { GlitchMode } from "postprocessing"
import * as THREE from "three"

/* ─────────────────────────────────────────────────────────────── *
 *  GLSL — Particle vertex/fragment shaders                        *
 * ─────────────────────────────────────────────────────────────── */
const VERT = /* glsl */`
  attribute float size;
  attribute float opacity;
  attribute vec3  color;

  varying float  vOpacity;
  varying vec3   vColor;
  varying float  vDist;    // distance from camera

  uniform vec2   uMouse;   // normalized -1..1
  uniform float  uTime;

  void main() {
    vOpacity = opacity;
    vColor   = color;

    vec3 pos = position;

    // Mouse repulsion: push particles away from pointer
    vec2 delta = pos.xy - uMouse * 4.0;
    float dist = length(delta);
    float repel = smoothstep(2.5, 0.0, dist) * 0.8;
    pos.xy += normalize(delta + 0.001) * repel;

    // Subtle drift oscillation
    pos.x += sin(uTime * 0.3 + position.y * 0.4) * 0.04;
    pos.y += cos(uTime * 0.2 + position.x * 0.3) * 0.04;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vDist = -mvPos.z;

    // Perspective size attenuation
    gl_PointSize = size * (300.0 / vDist);
    gl_Position  = projectionMatrix * mvPos;
  }
`

const FRAG = /* glsl */`
  varying float vOpacity;
  varying vec3  vColor;
  varying float vDist;

  void main() {
    // Circular point with soft edge
    vec2 uv   = gl_PointCoord - 0.5;
    float r   = length(uv);
    if (r > 0.5) discard;

    float alpha = (1.0 - r * 2.0) * vOpacity;
    alpha = pow(alpha, 1.4);

    // Depth fade
    float depthFade = 1.0 - smoothstep(8.0, 22.0, vDist);
    alpha *= depthFade;

    gl_FragColor = vec4(vColor, alpha);
  }
`

/* ─────────────────────────────────────────────────────────────── *
 *  Node geometry                                                  *
 * ─────────────────────────────────────────────────────────────── */
const NODE_COUNT = 2200
const EDGE_DIST  = 2.2   // max distance to draw a connection line
const SPREAD     = 14    // world-space spread

function generateNodes() {
  const positions = new Float32Array(NODE_COUNT * 3)
  const sizes     = new Float32Array(NODE_COUNT)
  const opacities = new Float32Array(NODE_COUNT)
  const colors    = new Float32Array(NODE_COUNT * 3)

  // Palettes: green, cyan, white-ish
  const palette = [
    new THREE.Color("#00ff41"),
    new THREE.Color("#00d4ff"),
    new THREE.Color("#00ff88"),
    new THREE.Color("#7c3aed"),
    new THREE.Color("#94a3b8"),
  ]

  for (let i = 0; i < NODE_COUNT; i++) {
    // Spherical distribution with density fall-off
    const r     = Math.pow(Math.random(), 0.6) * SPREAD
    const theta = Math.random() * Math.PI * 2
    const phi   = Math.acos(2 * Math.random() - 1)

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55
    positions[i * 3 + 2] = r * Math.cos(phi)

    sizes[i]     = Math.random() < 0.04 ? 4.5 : Math.random() * 2.0 + 0.8
    opacities[i] = Math.random() * 0.5 + 0.2

    const c = palette[Math.floor(Math.random() * palette.length)]
    colors[i * 3]     = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }

  return { positions, sizes, opacities, colors }
}

/* ─────────────────────────────────────────────────────────────── *
 *  Edge line geometry (force graph connections)                   *
 * ─────────────────────────────────────────────────────────────── */
function buildEdges(positions: Float32Array) {
  const edges: number[] = []

  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const dx = positions[i*3]   - positions[j*3]
      const dy = positions[i*3+1] - positions[j*3+1]
      const dz = positions[i*3+2] - positions[j*3+2]
      const d  = Math.sqrt(dx*dx + dy*dy + dz*dz)
      if (d < EDGE_DIST) {
        edges.push(
          positions[i*3], positions[i*3+1], positions[i*3+2],
          positions[j*3], positions[j*3+1], positions[j*3+2],
        )
      }
    }
  }

  return new Float32Array(edges)
}

/* ─────────────────────────────────────────────────────────────── *
 *  Particles mesh                                                 *
 * ─────────────────────────────────────────────────────────────── */
function Particles({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const matRef  = useRef<THREE.ShaderMaterial>(null!)
  const meshRef = useRef<THREE.Points>(null!)

  const { positions, sizes, opacities, colors } = useMemo(generateNodes, [])
  const edgePositions = useMemo(() => buildEdges(positions), [positions])

  const uniforms = useMemo(
    () => ({
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  )

  useFrame(({ clock }) => {
    uniforms.uTime.value  = clock.elapsedTime
    uniforms.uMouse.value.set(mouse.current[0], mouse.current[1])
  })

  return (
    <group rotation={[0.1, 0, 0]}>
      {/* Nodes */}
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={NODE_COUNT} itemSize={3} />
          <bufferAttribute attach="attributes-size"     array={sizes}     count={NODE_COUNT} itemSize={1} />
          <bufferAttribute attach="attributes-opacity"  array={opacities} count={NODE_COUNT} itemSize={1} />
          <bufferAttribute attach="attributes-color"    array={colors}    count={NODE_COUNT} itemSize={3} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors
        />
      </points>

      {/* Edges / connections */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={edgePositions}
            count={edgePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#00ff41"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────── *
 *  Camera slow drift                                              *
 * ─────────────────────────────────────────────────────────────── */
function CameraRig({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  const { camera } = useThree()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const [mx, my] = mouse.current
    camera.position.x += (mx * 1.2 - camera.position.x) * 0.02
    camera.position.y += (my * 0.8 - camera.position.y) * 0.02
    camera.position.z = 18 + Math.sin(t * 0.08) * 0.8
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ─────────────────────────────────────────────────────────────── *
 *  Inner scene (uses R3F hooks — must be inside <Canvas>)         *
 * ─────────────────────────────────────────────────────────────── */
function Scene({ mouse }: { mouse: React.MutableRefObject<[number, number]> }) {
  return (
    <>
      <ambientLight intensity={0.01} />
      <CameraRig mouse={mouse} />
      <Particles mouse={mouse} />
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.0}
          luminanceSmoothing={0.2}
          intensity={1.4}
          mipmapBlur
        />
        <Glitch
          delay={new THREE.Vector2(8, 16) as any}
          duration={new THREE.Vector2(0.08, 0.2) as any}
          strength={new THREE.Vector2(0.002, 0.008) as any}
          mode={GlitchMode.SPORADIC}
          active
          ratio={0.8}
        />
        <Scanline density={1.4} opacity={0.06} />
      </EffectComposer>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────── *
 *  Public export                                                  *
 * ─────────────────────────────────────────────────────────────── */
export default function ThreeCanvas() {
  const mouse = useRef<[number, number]>([0, 0])
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return

    function onMove(e: MouseEvent) {
      const { innerWidth: w, innerHeight: h } = window
      mouse.current = [
        (e.clientX / w) * 2 - 1,
        -(e.clientY / h) * 2 + 1,
      ]
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0"
      aria-hidden="true"
      role="presentation"
    >
      <Canvas
        camera={{ position: [0, 0, 18], fov: 60, near: 0.1, far: 100 }}
        gl={{
          antialias:       false,
          alpha:           true,
          powerPreference: "high-performance",
          stencil:         false,
          depth:           false,
        }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  )
}
