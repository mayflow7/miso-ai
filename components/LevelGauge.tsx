'use client'

import { useStore } from '@/store'

export function LevelGauge() {
  const { xp, level } = useStore()

  return (
    <div className="w-full px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold tracking-widest text-white/50 uppercase">Lv.{level}</span>
        <span className="text-xs text-white/30">{xp} / 100</span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${xp}%`,
            background: 'linear-gradient(90deg, #c084fc, #f472b6)',
            boxShadow: '0 0 8px rgba(244,114,182,0.6)',
          }}
        />
      </div>
    </div>
  )
}
