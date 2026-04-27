'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export function useBackgroundMusic(src: string, enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [volume, setVolumeState] = useState(0.25)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.25
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !enabled) return
    audio.play().catch(() => {})
  }, [enabled])

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.max(0, Math.min(1, v))
    audio.volume = clamped
    audio.muted = clamped === 0
    setVolumeState(clamped)
    if (clamped > 0 && !audio.muted) {
      audio.play().catch(() => {})
    }
  }, [])

  return { volume, setVolume }
}
