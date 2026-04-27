'use client'

import { useEffect, useState, useRef } from 'react'

interface Bubble {
  id: number
  text: string
  buttonIndex: number
}

interface Props {
  trigger: { text: string; id: number; buttonIndex: number } | null
}

export function FloatingBubble({ trigger }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const seenRef = useRef<number>(-1)

  useEffect(() => {
    if (!trigger || trigger.id === seenRef.current) return
    seenRef.current = trigger.id
    const newBubble: Bubble = { id: trigger.id, text: trigger.text, buttonIndex: trigger.buttonIndex }
    setBubbles((prev) => [...prev.slice(-4), newBubble])
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id))
    }, 4200)
  }, [trigger])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute bubble-float"
          style={{
            bottom: '120px',
            left: `${(bubble.buttonIndex + 0.5) / 3 * 100}%`,
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm text-[#3a1a5e] text-sm font-medium px-4 py-2.5 rounded-2xl shadow-lg max-w-[240px] text-center leading-snug whitespace-nowrap">
            {bubble.text}
          </div>
        </div>
      ))}
    </div>
  )
}
