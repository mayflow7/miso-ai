'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { LevelGauge } from '@/components/LevelGauge'
import { ActionButtons } from '@/components/ActionButtons'
import { FloatingBubble } from '@/components/FloatingBubble'
import { ParticleEffect } from '@/components/ParticleEffect'
import { SpeakerControl } from '@/components/SpeakerControl'
import { CoverPage } from '@/components/CoverPage'
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic'
import type { Emotion } from '@/types'

const SHOE_COLORS  = [0xff2244, 0x9933ff, 0x00aaff, 0xff6600, 0x00cc66, 0xff66cc, 0xffcc00]
const DRESS_COLORS = [0xff88aa, 0xaa66ff, 0x66ccff, 0xffaa44, 0x44ddaa, 0xff99dd, 0xffee66]
const VRM_PATHS    = ['/vrm/character.vrm', '/vrm/Mio.vrm', '/vrm/Mio-dress.vrm', '/vrm/Miso2.vrm']
const HAS_DRESS    = [true, false, true, true]  // 모델별 드레스 버튼 표시 여부
const MODEL_NAMES  = ['Miso', 'Mio', 'Mio', 'Miso2']
const MISO2_INDEX  = 3
const MISO2_DRESS_PATH  = '/vrm/Miso2.vrm'
const MISO2_BIKINI_PATH = '/vrm/Miso2-Bikini.vrm'

const VRMViewer = dynamic(
  () => import('@/components/VRMViewer').then((m) => m.VRMViewer),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

export default function Home() {
  const addClick = useStore((s) => s.addClick)
  const [started, setStarted] = useState(false)
  const [emotion, setEmotion] = useState<Emotion>('idle')
  const [bubble, setBubble] = useState<{ text: string; id: number; buttonIndex: number } | null>(null)
  const [particle, setParticle] = useState<{ id: number; buttonIndex: number; emotion: Emotion } | null>(null)
  const bubbleIdRef = useRef(0)
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { volume, setVolume } = useBackgroundMusic('/audio/Dream.wav', started)
  const changeShoeColorRef = useRef<((hex: number | null) => void) | null>(null)
  const shoeColoredRef = useRef(false)
  const changeDressColorRef = useRef<((hex: number | null) => void) | null>(null)
  const dressColoredRef = useRef(false)
  const toggleShoeVisibilityRef = useRef<(() => void) | null>(null)
  const switchModelRef = useRef<((path: string) => void) | null>(null)
  const [currentModelIndex, setCurrentModelIndex] = useState(0)

  const miso2DressOnRef = useRef(true)
  const [miso2DressOn, setMiso2DressOn] = useState(true)

  const handleSwitchModel = useCallback(() => {
    const next = (currentModelIndex + 1) % VRM_PATHS.length
    setCurrentModelIndex(next)
    miso2DressOnRef.current = true
    setMiso2DressOn(true)
    switchModelRef.current?.(VRM_PATHS[next])
  }, [currentModelIndex])

  const handleMiso2DressToggle = useCallback(() => {
    const next = !miso2DressOnRef.current
    miso2DressOnRef.current = next
    setMiso2DressOn(next)
    switchModelRef.current?.(next ? MISO2_DRESS_PATH : MISO2_BIKINI_PATH)
  }, [])

  const handleShoeButton = useCallback(() => {
    if (shoeColoredRef.current) {
      changeShoeColorRef.current?.(null)
      shoeColoredRef.current = false
    } else {
      const hex = SHOE_COLORS[Math.floor(Math.random() * SHOE_COLORS.length)]
      changeShoeColorRef.current?.(hex)
      shoeColoredRef.current = true
    }
  }, [])

  const handleDressButton = useCallback(() => {
    if (dressColoredRef.current) {
      changeDressColorRef.current?.(null)
      dressColoredRef.current = false
    } else {
      const hex = DRESS_COLORS[Math.floor(Math.random() * DRESS_COLORS.length)]
      changeDressColorRef.current?.(hex)
      dressColoredRef.current = true
    }
  }, [])

  const handleAction = useCallback((newEmotion: Emotion, text: string, buttonIndex: number) => {
    addClick()
    setEmotion(newEmotion)
    setBubble({ text, id: ++bubbleIdRef.current, buttonIndex })
    setParticle({ id: bubbleIdRef.current, buttonIndex, emotion: newEmotion })

    if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
    emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 3000)
  }, [addClick])

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#0a0612]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-900/25 blur-[120px]" />
      </div>

      {/* Full-screen VRM */}
      <div className="absolute inset-0">
        <VRMViewer emotion={emotion} changeShoeColorRef={changeShoeColorRef} changeDressColorRef={changeDressColorRef} toggleShoeVisibilityRef={toggleShoeVisibilityRef} switchModelRef={switchModelRef} />
      </div>

      {/* Left side: model switch + dress toggle (Miso2 only) + boot hide */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        <button
          onClick={handleSwitchModel}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          👤
        </button>
        {currentModelIndex === MISO2_INDEX && (
          <button
            onClick={handleMiso2DressToggle}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <span className="text-2xl leading-none">👗</span>
              {!miso2DressOn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
                  <div style={{ width: '110%', height: '3px', background: '#ff3333', borderRadius: '2px', transform: 'rotate(-45deg)', boxShadow: '0 0 3px rgba(0,0,0,0.9)' }} />
                </div>
              )}
            </div>
          </button>
        )}
        <button
          onClick={() => toggleShoeVisibilityRef.current?.()}
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="text-2xl leading-none" style={{ filter: 'brightness(0) invert(1)' }}>👢</span>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
              <div style={{ width: '110%', height: '3px', background: '#ff3333', borderRadius: '2px', transform: 'rotate(-45deg)', boxShadow: '0 0 3px rgba(0,0,0,0.9)' }} />
            </div>
          </div>
        </button>
      </div>

      {/* Right side: dress + boot color */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {HAS_DRESS[currentModelIndex] && (
          <button
            onClick={handleDressButton}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            👗
          </button>
        )}
        <button
          onClick={handleShoeButton}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          👢
        </button>
      </div>

      {/* Particle fireworks */}
      <ParticleEffect trigger={particle} />

      {/* Floating speech bubbles */}
      <FloatingBubble trigger={bubble} />

      {/* Top overlay: gauge + speaker below */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <LevelGauge />
        <div className="px-5 pb-1">
          <span className="text-xs text-white/40 tracking-widest">{MODEL_NAMES[currentModelIndex]}</span>
        </div>
        <div className="flex justify-end pr-3 pb-1">
          <SpeakerControl volume={volume} onVolumeChange={setVolume} />
        </div>
      </div>

      {/* Action buttons — bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ActionButtons onAction={handleAction} />
      </div>

      {/* Cover page */}
      {!started && (
        <div className="absolute inset-0 z-50">
          <CoverPage onStart={() => setStarted(true)} />
        </div>
      )}
    </main>
  )
}
