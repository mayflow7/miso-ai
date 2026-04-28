'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useVRMViewer } from '@/hooks/useVRMViewer'
import type { Emotion } from '@/types'

interface Props {
  emotion: Emotion
}

export function VRMViewer({ emotion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setEmotion, handleCanvasClick } = useVRMViewer(containerRef)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setEmotion(emotion)
  }, [emotion, setEmotion])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleCanvasClick(e.clientX, e.clientY)
  }, [handleCanvasClick])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0]
    if (t) touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.changedTouches[0]
    if (!t || !touchStartRef.current) return
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    // 8px 이하 이동 = 탭으로 판정 (드래그/회전은 무시)
    if (Math.sqrt(dx * dx + dy * dy) < 8) {
      handleCanvasClick(t.clientX, t.clientY)
    }
    touchStartRef.current = null
  }, [handleCanvasClick])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    />
  )
}
