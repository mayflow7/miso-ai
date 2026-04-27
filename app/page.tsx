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

const VRMViewer = dynamic(
  () => import('@/components/VRMViewer').then((m) => m.VRMViewer),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

export default function Home() {
  const addXp = useStore((s) => s.addXp)
  const [started, setStarted] = useState(false)
  const [emotion, setEmotion] = useState<Emotion>('idle')
  const [bubble, setBubble] = useState<{ text: string; id: number; buttonIndex: number } | null>(null)
  const [particle, setParticle] = useState<{ id: number; buttonIndex: number; emotion: Emotion } | null>(null)
  const bubbleIdRef = useRef(0)
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { volume, setVolume } = useBackgroundMusic('/audio/Dream.wav', started)

  const handleAction = useCallback((newEmotion: Emotion, text: string, buttonIndex: number) => {
    addXp()
    setEmotion(newEmotion)
    setBubble({ text, id: ++bubbleIdRef.current, buttonIndex })
    setParticle({ id: bubbleIdRef.current, buttonIndex, emotion: newEmotion })

    if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
    emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 3000)
  }, [addXp])

  return (
    <main className="relative w-full h-full overflow-hidden bg-[#0a0612]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/30 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-900/25 blur-[120px]" />
      </div>

      {/* Full-screen VRM */}
      <div className="absolute inset-0">
        <VRMViewer emotion={emotion} />
      </div>

      {/* Particle fireworks */}
      <ParticleEffect trigger={particle} />

      {/* Floating speech bubbles */}
      <FloatingBubble trigger={bubble} />

      {/* Top overlay: gauge + speaker below */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <LevelGauge />
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
