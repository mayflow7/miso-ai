'use client'

import { useStore, getLevelInfo, MAX_LEVEL } from '@/store'

export function LevelGauge() {
  const totalClicks = useStore((s) => s.totalClicks)
  const { level, clicksInLevel, clicksToNext, progressPct } = getLevelInfo(totalClicks)

  return (
    <div className="w-full px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold tracking-widest text-white/50 uppercase">Lv.{level}</span>
        <span className="text-xs text-white/30">
          {level < MAX_LEVEL ? `${Math.floor(progressPct)}% / 100` : 'MAX'}
        </span>
      </div>
      <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #c084fc, #f472b6)',
            boxShadow: '0 0 8px rgba(244,114,182,0.6)',
          }}
        />
      </div>
    </div>
  )
}
