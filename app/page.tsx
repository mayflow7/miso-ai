'use client'

import dynamic from 'next/dynamic'
import { useState, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { LevelGauge } from '@/components/LevelGauge'
import { ActionButtons } from '@/components/ActionButtons'
import { FloatingBubble } from '@/components/FloatingBubble'
import type { Emotion } from '@/types'

const VRMViewer = dynamic(
  () => import('@/components/VRMViewer').then((m) => m.VRMViewer),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
)

export default function Home() {
  const addXp = useStore((s) => s.addXp)
  const [emotion, setEmotion] = useState<Emotion>('idle')
  const [bubble, setBubble] = useState<{ text: string; id: number } | null>(null)
  const bubbleIdRef = useRef(0)
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAction = useCallback((newEmotion: Emotion, text: string) => {
    addXp()
    setEmotion(newEmotion)
    setBubble({ text, id: ++bubbleIdRef.current })

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

      {/* Floating speech bubbles */}
      <FloatingBubble trigger={bubble} />

      {/* Level gauge — top overlay */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <LevelGauge />
      </div>

      {/* 버튼 위 그라디언트 — 캐릭터 발이 버튼과 겹치지 않게 자연스럽게 페이드 */}
      <div
        className="absolute left-0 right-0 z-10 pointer-events-none"
        style={{
          bottom: '100px',
          height: '120px',
          background: 'linear-gradient(to top, #0a0612 20%, transparent)',
        }}
      />

      {/* Action buttons — bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <ActionButtons onAction={handleAction} />
      </div>
    </main>
  )
}
