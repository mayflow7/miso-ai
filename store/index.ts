import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_LEVEL = 10
const XP_PER_CLICK = 3

interface Store {
  xp: number
  level: number
  totalClicks: number
  addXp: () => void
}

function calcLevel(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(xp / (100 / MAX_LEVEL)) + 1)
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      xp: 0,
      level: 1,
      totalClicks: 0,
      addXp: () =>
        set((s) => {
          const nextXp = Math.min(100, s.xp + XP_PER_CLICK)
          return { xp: nextXp, level: calcLevel(nextXp), totalClicks: s.totalClicks + 1 }
        }),
    }),
    { name: 'miso-store' }
  )
)
