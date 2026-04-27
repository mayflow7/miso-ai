'use client'

import type { Emotion, ButtonAction } from '@/types'
import { RESPONSES } from '@/data/responses'

const BUTTONS: { action: ButtonAction; label: string; emoji: string; emotion: Emotion }[] = [
  { action: 'hi', label: 'Hi there', emoji: '👋', emotion: 'happy' },
  { action: 'loving', label: 'Loving you', emoji: '💕', emotion: 'love' },
  { action: 'happy', label: 'Happy day', emoji: '✨', emotion: 'excited' },
]

interface Props {
  onAction: (emotion: Emotion, text: string, buttonIndex: number) => void
}

export function ActionButtons({ onAction }: Props) {
  const handleClick = (btn: typeof BUTTONS[number], index: number) => {
    const texts = RESPONSES[btn.action]
    const text = texts[Math.floor(Math.random() * texts.length)]
    onAction(btn.emotion, text, index)
  }

  return (
    <div className="w-full flex gap-2 px-4 pb-3 pt-1">
      {BUTTONS.map((btn, index) => (
        <button
          key={btn.action}
          onClick={() => handleClick(btn, index)}
          className="flex-1 flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl
            bg-white/10 hover:bg-white/20 active:bg-white/30 active:scale-95
            border border-white/15 hover:border-white/30
            transition-all duration-150 cursor-pointer select-none"
        >
          <span className="text-base">{btn.emoji}</span>
          <span className="text-xs font-semibold text-white/80 tracking-wide">{btn.label}</span>
        </button>
      ))}
    </div>
  )
}
