'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  volume: number
  onVolumeChange: (v: number) => void
}

function SpeakerIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
      </svg>
    )
  }
  if (volume < 0.5) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

export function SpeakerControl({ volume, onVolumeChange }: Props) {
  const [open, setOpen] = useState(false)
  const savedVolRef = useRef(0.25)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [open])

  const toggleMute = () => {
    if (volume > 0) {
      savedVolRef.current = volume
      onVolumeChange(0)
    } else {
      onVolumeChange(savedVolRef.current || 0.25)
    }
  }

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      {open && (
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5">
          <button
            onClick={toggleMute}
            className="text-white/60 hover:text-white transition-colors text-xs w-4 h-4 flex items-center justify-center"
          >
            <SpeakerIcon volume={volume} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="volume-slider w-20 cursor-pointer"
          />
          <span className="text-white/40 text-[10px] w-6 text-right">{Math.round(volume * 100)}</span>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30
          border border-white/15 hover:border-white/30
          text-white/60 hover:text-white/90
          transition-all duration-150 cursor-pointer"
        aria-label="Volume control"
      >
        <SpeakerIcon volume={volume} />
      </button>
    </div>
  )
}
