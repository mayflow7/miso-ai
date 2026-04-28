'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useVRMViewer } from '@/hooks/useVRMViewer'
import type { Emotion } from '@/types'

interface Props {
  emotion: Emotion
}

const DOUBLE_TAP_MS = 300

export function VRMViewer({ emotion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setEmotion, handleCanvasClick } = useVRMViewer(containerRef)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const lastTapTimeRef = useRef(0)

  useEffect(() => {
    setEmotion(emotion)
  }, [emotion, setEmotion])

  // PC: 더블클릭
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleCanvasClick(e.clientX, e.clientY)
  }, [handleCanvasClick])

  // 모바일: 더블탭 감지
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0]
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.changedTouches[0]
    if (!t || !touchStartRef.current) return

    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null

    if (Math.sqrt(dx * dx + dy * dy) >= 8) return  // 드래그는 무시

    const now = Date.now()
    if (now - lastTapTimeRef.current < DOUBLE_TAP_MS) {
      handleCanvasClick(t.clientX, t.clientY)
      lastTapTimeRef.current = 0
    } else {
      lastTapTimeRef.current = now
    }
  }, [handleCanvasClick])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  )
}
