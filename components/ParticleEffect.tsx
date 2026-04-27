'use client'

import { useEffect, useState, useRef } from 'react'
import type { Emotion } from '@/types'

const EMOJIS: Record<Emotion, string[]> = {
  happy:   ['✨', '⭐', '💛', '🌟', '💫'],
  love:    ['❤️', '💕', '💖', '💗', '🌸'],
  excited: ['🎉', '🌟', '✨', '🎊', '💫', '⭐'],
  idle:    [],
}

interface Particle {
  id: string
  emoji: string
  leftPct: number
  vx: number
  vy: number
  rotate: number
  size: number
  delay: number
  duration: number
}

interface Burst {
  burstId: number
  particles: Particle[]
}

interface Props {
  trigger: { id: number; buttonIndex: number; emotion: Emotion } | null
}

function makeBurst(buttonIndex: number, emotion: Emotion): Particle[] {
  const emojis = EMOJIS[emotion]
  if (!emojis.length) return []
  const count = 14
  const leftPct = (buttonIndex + 0.5) / 3 * 100
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4
    const speed = 60 + Math.random() * 80
    return {
      id: `p-${Date.now()}-${i}`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      leftPct,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      rotate: (Math.random() - 0.5) * 540,
      size: 14 + Math.floor(Math.random() * 14),
      delay: Math.random() * 0.12,
      duration: 0.9 + Math.random() * 0.5,
    }
  })
}

export function ParticleEffect({ trigger }: Props) {
  const [bursts, setBursts] = useState<Burst[]>([])
  const seenRef = useRef<number>(-1)

  useEffect(() => {
    if (!trigger || trigger.id === seenRef.current) return
    seenRef.current = trigger.id
    const particles = makeBurst(trigger.buttonIndex, trigger.emotion)
    const burst: Burst = { burstId: trigger.id, particles }
    setBursts((prev) => [...prev, burst])
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.burstId !== burst.burstId))
    }, 2200)
  }, [trigger])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {bursts.flatMap((burst) =>
        burst.particles.map((p) => (
          <div
            key={p.id}
            className="absolute particle-burst"
            style={{
              left: `${p.leftPct}%`,
              bottom: '64px',
              fontSize: `${p.size}px`,
              '--vx': `${p.vx}px`,
              '--vy': `${p.vy}px`,
              '--rotate': `${p.rotate}deg`,
              animation: `particleBurst ${p.duration}s ease-out ${p.delay}s forwards`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        ))
      )}
    </div>
  )
}
