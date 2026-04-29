'use client'

import { useRef, useEffect } from 'react'
import { useVRMViewer } from '@/hooks/useVRMViewer'
import type { Emotion } from '@/types'

interface Props {
  emotion: Emotion
  changeShoeColorRef?: React.MutableRefObject<((hex: number | null) => void) | null>
  changeDressColorRef?: React.MutableRefObject<((hex: number | null) => void) | null>
  toggleShoeVisibilityRef?: React.MutableRefObject<(() => void) | null>
switchModelRef?: React.MutableRefObject<((path: string) => void) | null>
}

export function VRMViewer({ emotion, changeShoeColorRef, changeDressColorRef, toggleShoeVisibilityRef, switchModelRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setEmotion, changeShoeColor, changeDressColor, toggleShoeVisibility, switchModel } = useVRMViewer(containerRef)

  useEffect(() => {
    setEmotion(emotion)
  }, [emotion, setEmotion])

  useEffect(() => {
    if (changeShoeColorRef) changeShoeColorRef.current = changeShoeColor
  }, [changeShoeColorRef, changeShoeColor])

  useEffect(() => {
    if (changeDressColorRef) changeDressColorRef.current = changeDressColor
  }, [changeDressColorRef, changeDressColor])

  useEffect(() => {
    if (toggleShoeVisibilityRef) toggleShoeVisibilityRef.current = toggleShoeVisibility
  }, [toggleShoeVisibilityRef, toggleShoeVisibility])

  useEffect(() => {
    if (switchModelRef) switchModelRef.current = switchModel
  }, [switchModelRef, switchModel])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    />
  )
}
