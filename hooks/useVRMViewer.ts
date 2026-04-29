'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { Emotion } from '@/types'

const EXPRESSION_MAP: Record<Emotion, string | null> = {
  happy: 'happy',
  love: 'relaxed',
  excited: 'happy',
  idle: null,
}

// z축: 0 = 수평(T포즈), π/2 ≈ 1.57 = 완전히 아래
const POSE_MAP: Record<Emotion, Record<string, [number, number, number]>> = {
  idle: {
    head:          [0,    0,  0],
    leftUpperArm:  [0.1,  0,  1.3],
    rightUpperArm: [0.1,  0, -1.3],
    leftLowerArm:  [0.1,  0,  0.05],
    rightLowerArm: [0.1,  0, -0.05],
  },
  happy: {
    head:          [0,    0,  0.08],
    leftUpperArm:  [0.0,  0,  1.1],
    rightUpperArm: [-0.2, 0, -1.0],
  },
  love: {
    head:          [0.05, 0,  0.05],
    leftUpperArm:  [-0.3, 0,  0.9],
    rightUpperArm: [-0.3, 0, -0.9],
  },
  excited: {
    head:          [0,    0,  0.12],
    leftUpperArm:  [-0.8, 0,  0.6],
    rightUpperArm: [-0.8, 0, -0.6],
  },
}

function applyPose(vrm: any, emotion: Emotion) {
  const pose = POSE_MAP[emotion] ?? POSE_MAP.idle
  Object.entries(POSE_MAP.idle).forEach(([bone, rot]) => {
    const b = vrm.humanoid?.getNormalizedBoneNode(bone)
    if (b) { b.rotation.x = rot[0]; b.rotation.y = rot[1]; b.rotation.z = rot[2] }
  })
  Object.entries(pose).forEach(([bone, rot]) => {
    const b = vrm.humanoid?.getNormalizedBoneNode(bone)
    if (b) { b.rotation.x = rot[0]; b.rotation.y = rot[1]; b.rotation.z = rot[2] }
  })
}

export function useVRMViewer(containerRef: React.RefObject<HTMLDivElement | null>) {
  const sceneRef = useRef<{
    renderer: any; scene: any; camera: any; vrm: any; clock: any; animFrame: number;
    raycaster: any
  } | null>(null)
  const emotionRef = useRef<Emotion>('idle')
  const vrmRef = useRef<any>(null)
  const shoeOrigColorsRef = useRef<Map<any, number>>(new Map())
  const shoeColoredRef = useRef(false)
  const shoeVisibleRef = useRef(true)
  const dressOrigColorsRef = useRef<Map<any, number>>(new Map())
  const dressColoredRef = useRef(false)

  const init = useCallback(async () => {
    if (!containerRef.current) return
    const THREE = await import('three')
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
    const { VRMLoaderPlugin, VRMUtils } = await import('@pixiv/three-vrm')

    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 20)
    camera.position.set(0, 1.0, -4.5)
    camera.lookAt(0, 0.85, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 1.2))
    const dir = new THREE.DirectionalLight(0xffd6f0, 1.4)
    dir.position.set(1, 3, -2)
    scene.add(dir)
    const fill = new THREE.DirectionalLight(0xc8d8ff, 0.6)
    fill.position.set(-2, 1, 1)
    scene.add(fill)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.85, 0)
    controls.enablePan = false
    controls.enableZoom = false
    controls.minPolarAngle = Math.PI / 2.8
    controls.maxPolarAngle = Math.PI / 1.7
    controls.update()

    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))
    const clock = new THREE.Clock()
    let vrm: any = null

    const raycaster = new THREE.Raycaster()

    try {
      const gltf = await loader.loadAsync('/vrm/character.vrm')
      vrm = (gltf as any).userData.vrm
      if (vrm) {
        VRMUtils.removeUnnecessaryVertices(vrm.scene)
        VRMUtils.combineSkeletons(vrm.scene)
        scene.add(vrm.scene)
        applyPose(vrm, 'idle')
        vrmRef.current = vrm
      }
    } catch {
      console.warn('VRM load failed')
    }

    const onResize = () => {
      const w2 = container.clientWidth
      const h2 = container.clientHeight
      renderer.setSize(w2, h2)
      camera.aspect = w2 / h2
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── 눈 깜빡임 ────────────────────────────────────────────────
    let blinkTimer = 0
    let isBlinking = false

    // ── Look-around 상태 머신 ─────────────────────────────────────
    type LookPhase = 'idle' | 'moving' | 'holding' | 'returning'
    let lookPhase: LookPhase = 'idle'
    let lookTimer = 0
    let lookInterval = 7 + Math.random() * 6
    let lookTargetY = 0
    let lookCurrentY = 0
    let lookHoldTimer = 0

    let animFrame = 0

    const tick = () => {
      animFrame = requestAnimationFrame(tick)
      const delta = clock.getDelta()
      vrm = vrmRef.current

      if (vrm) {
        // ── 눈 깜빡임 ─────────────────────────────────────────────
        blinkTimer += delta
        if (!isBlinking && blinkTimer > 3 + Math.random() * 2) {
          isBlinking = true
          blinkTimer = 0
        }
        if (isBlinking) {
          const bt = blinkTimer / 0.15
          const bw = bt < 0.5 ? bt * 2 : 2 - bt * 2
          vrm.expressionManager?.setValue('blink', Math.min(1, Math.max(0, bw)))
          if (blinkTimer > 0.15) {
            isBlinking = false
            vrm.expressionManager?.setValue('blink', 0)
          }
        }

        if (emotionRef.current === 'idle') {
          const t = clock.elapsedTime

          // ── 전체 캐릭터 좌우 방향 전환 ───────────────────────
          vrm.scene.rotation.y = Math.sin(t * 1.26) * 0.25 + Math.sin(t * 0.45) * 0.08

          // ── 호흡 & 몸통 ────────────────────────────────────────
          const breath = Math.sin(t * 0.5) * 0.018
          const sway   = Math.sin(t * 0.22) * 0.013 + Math.sin(t * 0.13) * 0.006

          const spineBone = vrm.humanoid?.getNormalizedBoneNode('spine')
          if (spineBone) {
            spineBone.rotation.x = breath
            spineBone.rotation.z = sway
          }
          const chestBone = vrm.humanoid?.getNormalizedBoneNode('chest')
          if (chestBone) {
            chestBone.rotation.x = breath * 2.0
          }
          const hipsBone = vrm.humanoid?.getNormalizedBoneNode('hips')
          if (hipsBone) {
            hipsBone.rotation.z = sway * 0.5
            hipsBone.rotation.x = Math.sin(t * 0.18) * 0.008
          }

          // ── Look-around ────────────────────────────────────────
          lookTimer += delta
          if (lookPhase === 'idle' && lookTimer > lookInterval) {
            lookTargetY = (Math.random() > 0.5 ? 1 : -1) * (0.12 + Math.random() * 0.18)
            lookPhase = 'moving'
            lookTimer = 0
          }
          if (lookPhase === 'moving') {
            lookCurrentY += (lookTargetY - lookCurrentY) * Math.min(1, delta * 2.5)
            if (Math.abs(lookCurrentY - lookTargetY) < 0.005) {
              lookPhase = 'holding'
              lookHoldTimer = 0
            }
          }
          if (lookPhase === 'holding') {
            lookHoldTimer += delta
            if (lookHoldTimer > 1.2 + Math.random() * 0.8) {
              lookTargetY = 0
              lookPhase = 'returning'
            }
          }
          if (lookPhase === 'returning') {
            lookCurrentY += (0 - lookCurrentY) * Math.min(1, delta * 2.0)
            if (Math.abs(lookCurrentY) < 0.003) {
              lookCurrentY = 0
              lookPhase = 'idle'
              lookInterval = 7 + Math.random() * 6
              lookTimer = 0
            }
          }

          // ── Head ───────────────────────────────────────────────
          const headBone = vrm.humanoid?.getNormalizedBoneNode('head')
          if (headBone) {
            headBone.rotation.y = Math.sin(t * 0.4) * 0.05 + Math.sin(t * 0.17) * 0.02 + lookCurrentY
            headBone.rotation.z = Math.sin(t * 0.3 + 1) * 0.025 + Math.sin(t * 0.19) * 0.01
            headBone.rotation.x = Math.sin(t * 0.23 + 0.5) * 0.018 + breath * 0.4
          }
          const neckBone = vrm.humanoid?.getNormalizedBoneNode('neck')
          if (neckBone) {
            neckBone.rotation.y = lookCurrentY * 0.4
            neckBone.rotation.x = breath * 0.3
          }

          // ── 팔 ─────────────────────────────────────────────────
          const lArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm')
          if (lArm) {
            lArm.rotation.z = 1.3 + Math.sin(t * 0.22 + 0.5) * 0.02 + breath * 0.5
            lArm.rotation.x = 0.1 + Math.sin(t * 0.31) * 0.012
          }
          const rArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm')
          if (rArm) {
            rArm.rotation.z = -1.3 - Math.sin(t * 0.22) * 0.02 - breath * 0.5
            rArm.rotation.x = 0.1 + Math.sin(t * 0.31 + 1) * 0.012
          }
        } else {
          // idle이 아닐 때 회전을 부드럽게 정면으로 복귀
          vrm.scene.rotation.y += (0 - vrm.scene.rotation.y) * Math.min(1, delta * 4)
        }

        vrm.update(delta)
      }

      controls.update()
      renderer.render(scene, camera)
    }
    tick()

    sceneRef.current = { renderer, scene, camera, vrm, clock, animFrame, raycaster }

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(animFrame)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [containerRef])

  useEffect(() => {
    const cleanup = init()
    return () => { cleanup.then((fn) => fn?.()) }
  }, [init])

  const changeShoeColor = useCallback((hex: number | null) => {
    const ref = sceneRef.current
    if (!ref?.vrm) return
    ref.vrm.scene.traverse((obj: any) => {
      if (!obj.isMesh) return
      const mats: any[] = Array.isArray(obj.material) ? obj.material : [obj.material]
      const isShoe = mats.some((m: any) => /shoes/i.test(m?.name ?? ''))
      if (!isShoe) return
      mats.forEach((mat: any) => {
        if (!mat?.color) return
        if (!shoeOrigColorsRef.current.has(mat))
          shoeOrigColorsRef.current.set(mat, mat.color.getHex())
        if (hex === null) {
          const orig = shoeOrigColorsRef.current.get(mat)
          if (orig !== undefined) mat.color.setHex(orig)
        } else {
          mat.color.setHex(hex)
        }
      })
    })
    shoeColoredRef.current = hex !== null
  }, [])

  const setEmotion = useCallback((emotion: Emotion) => {
    emotionRef.current = emotion
    const ref = sceneRef.current
    if (!ref?.vrm) return
    const vrm = ref.vrm
    ;['happy', 'sad', 'angry', 'surprised', 'relaxed'].forEach((k) =>
      vrm.expressionManager?.setValue(k, 0)
    )
    const exprKey = EXPRESSION_MAP[emotion]
    if (exprKey) vrm.expressionManager?.setValue(exprKey, 0.8)
    applyPose(vrm, emotion)
  }, [])

  const changeDressColor = useCallback((hex: number | null) => {
    const ref = sceneRef.current
    if (!ref?.vrm) return
    ref.vrm.scene.traverse((obj: any) => {
      if (!obj.isMesh) return
      const mats: any[] = Array.isArray(obj.material) ? obj.material : [obj.material]
      const isDress = mats.some((m: any) => /CLOTH/i.test(m?.name ?? '') && !/shoes/i.test(m?.name ?? ''))
      if (!isDress) return
      mats.forEach((mat: any) => {
        if (!mat?.color) return
        if (!dressOrigColorsRef.current.has(mat))
          dressOrigColorsRef.current.set(mat, mat.color.getHex())
        if (hex === null) {
          const orig = dressOrigColorsRef.current.get(mat)
          if (orig !== undefined) mat.color.setHex(orig)
        } else {
          mat.color.setHex(hex)
        }
      })
    })
    dressColoredRef.current = hex !== null
  }, [])

  const toggleShoeVisibility = useCallback(() => {
    const ref = sceneRef.current
    if (!ref?.vrm) return
    shoeVisibleRef.current = !shoeVisibleRef.current
    ref.vrm.scene.traverse((obj: any) => {
      if (!obj.isMesh) return
      const mats: any[] = Array.isArray(obj.material) ? obj.material : [obj.material]
      if (mats.some((m: any) => /shoes/i.test(m?.name ?? '')))
        obj.visible = shoeVisibleRef.current
    })
  }, [])

  const switchModel = useCallback(async (path: string) => {
    const ref = sceneRef.current
    if (!ref) return
    if (vrmRef.current) {
      ref.scene.remove(vrmRef.current.scene)
      vrmRef.current = null
      ref.vrm = null
    }
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
    const { VRMLoaderPlugin, VRMUtils } = await import('@pixiv/three-vrm')
    const loader = new GLTFLoader()
    loader.register((parser: any) => new VRMLoaderPlugin(parser))
    try {
      const gltf = await loader.loadAsync(path)
      const newVrm = (gltf as any).userData.vrm
      if (newVrm) {
        VRMUtils.removeUnnecessaryVertices(newVrm.scene)
        VRMUtils.combineSkeletons(newVrm.scene)
        ref.scene.add(newVrm.scene)
        applyPose(newVrm, emotionRef.current)
        vrmRef.current = newVrm
        ref.vrm = newVrm
        shoeOrigColorsRef.current.clear()
        shoeColoredRef.current = false
        dressOrigColorsRef.current.clear()
        dressColoredRef.current = false
        shoeVisibleRef.current = true
      }
    } catch {
      console.warn('VRM switch failed:', path)
    }
  }, [])

  return { setEmotion, changeShoeColor, changeDressColor, toggleShoeVisibility, switchModel }
}
