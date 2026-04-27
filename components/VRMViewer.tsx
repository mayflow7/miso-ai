'use client'

import { useRef, useEffect } from 'react'
import { useVRMViewer } from '@/hooks/useVRMViewer'
import type { Emotion } from '@/types'

interface Props {
  emotion: Emotion
}

export function VRMViewer({ emotion }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setEmotion } = useVRMViewer(containerRef)

  useEffect(() => {
    setEmotion(emotion)
  }, [emotion, setEmotion])

  return <div ref={containerRef} className="w-full h-full" style={{ background: 'transparent' }} />
}
