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

  useEffect(() => {
    setEmotion(emotion)
  }, [emotion, setEmotion])

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleCanvasClick(e.clientX, e.clientY)
  }, [handleCanvasClick])

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0]
    if (touch) handleCanvasClick(touch.clientX, touch.clientY)
  }, [handleCanvasClick])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    />
  )
}
