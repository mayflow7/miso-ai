import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_LEVEL = 70

// lv1→2: 30, lv2→3: 60, lv3→4: 120 (2배씩), lv9→10 이후 1.5배
export function clicksRequired(level: number): number {
  if (level >= MAX_LEVEL) return Infinity
  if (level <= 9) return Math.round(30 * Math.pow(2, level - 1))
  return Math.round(7680 * Math.pow(1.5, level - 9))
}

export function getLevelInfo(totalClicks: number) {
  let level = 1
  let cumulative = 0
  while (level < MAX_LEVEL) {
    const needed = clicksRequired(level)
    if (cumulative + needed > totalClicks) {
      return {
        level,
        clicksInLevel: totalClicks - cumulative,
        clicksToNext: needed,
        progressPct: Math.min(100, ((totalClicks - cumulative) / needed) * 100),
      }
    }
    cumulative += needed
    level++
  }
  return { level: MAX_LEVEL, clicksInLevel: 0, clicksToNext: 0, progressPct: 100 }
}

interface Store {
  totalClicks: number
  addClick: () => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      totalClicks: 0,
      addClick: () => set((s) => ({ totalClicks: s.totalClicks + 1 })),
    }),
    { name: 'miso-store', version: 2 }
  )
)
