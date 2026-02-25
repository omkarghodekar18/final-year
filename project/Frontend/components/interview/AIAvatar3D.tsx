"use client"

import { useRef, useEffect, Suspense, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"

// Avatar at position [0, -1.65, 0] → head is at world Y ≈ 0
const AVATAR_URL =
  "https://models.readyplayer.me/699efa24f005c9608f683347.glb?morphTargets=ARKit,Oculus+Visemes"

useGLTF.preload(AVATAR_URL)

const VISEME_CYCLE = [
  "viseme_aa", "viseme_E", "viseme_I", "viseme_O", "viseme_U",
  "viseme_PP", "viseme_FF", "viseme_CH", "viseme_DD", "viseme_sil",
]

function AvatarModel({ isSpeaking }: { isSpeaking: boolean }) {
  const { scene } = useGLTF(AVATAR_URL)
  const morphMeshes = useRef<THREE.SkinnedMesh[]>([])
  const visemeIdx   = useRef(0)
  const visemeTimer = useRef(0)
  const blinkTimer  = useRef(Math.random() * 2)
  const nextBlink   = useRef(2 + Math.random() * 3)

  useEffect(() => {
    const found: THREE.SkinnedMesh[] = []
    scene.traverse((obj) => {
      if (
        obj instanceof THREE.SkinnedMesh &&
        obj.morphTargetDictionary &&
        Object.keys(obj.morphTargetDictionary).some((k) => k.startsWith("viseme_"))
      ) {
        found.push(obj)
      }
    })
    morphMeshes.current = found
  }, [scene])
  useFrame((_, delta) => {
    const meshes = morphMeshes.current
    if (!meshes.length) return
    const primary = meshes[0]
    if (!primary.morphTargetInfluences || !primary.morphTargetDictionary) return
    const dict = primary.morphTargetDictionary
    const inf  = primary.morphTargetInfluences

    if (isSpeaking) {
      visemeTimer.current += delta
      if (visemeTimer.current > 0.1 + Math.random() * 0.05) {
        visemeTimer.current = 0
        for (const k of Object.keys(dict)) {
          if (k.startsWith("viseme_") && dict[k] !== undefined) inf[dict[k]] *= 0.3
        }
        visemeIdx.current = (visemeIdx.current + 1) % VISEME_CYCLE.length
        const k = VISEME_CYCLE[visemeIdx.current]
        if (dict[k] !== undefined) inf[dict[k]] = 0.5 + Math.random() * 0.45
      }
    } else {
      for (const k of Object.keys(dict)) {
        if (k.startsWith("viseme_") && dict[k] !== undefined)
          inf[dict[k]] = THREE.MathUtils.lerp(inf[dict[k]], 0, delta * 12)
      }
    }

    blinkTimer.current += delta
    if (blinkTimer.current >= nextBlink.current) {
      blinkTimer.current = 0
      nextBlink.current  = 2 + Math.random() * 4
      for (const mesh of meshes) {
        const d = mesh.morphTargetDictionary; const i = mesh.morphTargetInfluences
        if (!d || !i) continue
        if (d["eyeBlinkLeft"]  !== undefined) i[d["eyeBlinkLeft"]]  = 1
        if (d["eyeBlinkRight"] !== undefined) i[d["eyeBlinkRight"]] = 1
        setTimeout(() => {
          if (d["eyeBlinkLeft"]  !== undefined) i[d["eyeBlinkLeft"]]  = 0
          if (d["eyeBlinkRight"] !== undefined) i[d["eyeBlinkRight"]] = 0
        }, 120)
      }
    }

    for (let m = 1; m < meshes.length; m++) {
      const mesh = meshes[m]
      if (!mesh.morphTargetInfluences || !mesh.morphTargetDictionary) continue
      const d = mesh.morphTargetDictionary; const i = mesh.morphTargetInfluences
      for (const k of Object.keys(d)) {
        if (dict[k] !== undefined) i[d[k]] = inf[dict[k]]
      }
    }
  })

  // Avatar feet at y=0 in local space; position shifts them to y=-1.65 in world
  // so head (≈1.65 above feet) ends up at world y ≈ 0
  return <primitive object={scene} position={[0, -1.65, 0]} scale={1} />
}

function Loader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
    </div>
  )
}

export function AIAvatar3D({ isSpeaking }: { isSpeaking: boolean }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center gap-2">
        <span className="text-5xl">🤖</span>
        <p className="text-xs text-muted-foreground">Avatar unavailable</p>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ height: 420 }}>
      <Suspense fallback={<Loader />}>
        <Canvas
          // Tight portrait: face + upper chest only — arms hidden below frame
          camera={{ position: [0, -0.1, 1.3], fov: 30 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent", width: "100%", height: "100%" }}
          onError={() => setError(true)}
        >
          {/* Look at the head, no user controls */}
          <OrbitControls
            target={[0, -0.08, 0]}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />

          <ambientLight intensity={0.8} />
          <directionalLight position={[-1.5, 2, 2]}  intensity={1.8} color="#fff8f0" />
          <directionalLight position={[2, 1, 1]}      intensity={0.6} color="#c7d2fe" />
          <directionalLight position={[0, 0.5, -2]}   intensity={0.3} color="#818cf8" />

          <AvatarModel isSpeaking={isSpeaking} />
          <Environment preset="studio" />
        </Canvas>
      </Suspense>
    </div>
  )
}
