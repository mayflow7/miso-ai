'use client'

import type { Emotion, ButtonAction } from '@/types'

const BUTTONS: { action: ButtonAction; label: string; emoji: string; emotion: Emotion }[] = [
  { action: 'hi', label: 'Hi there', emoji: '👋', emotion: 'happy' },
  { action: 'loving', label: 'Loving you', emoji: '💕', emotion: 'love' },
  { action: 'happy', label: 'Happy day', emoji: '✨', emotion: 'excited' },
]

const RESPONSES: Record<ButtonAction, string[]> = {
  hi: [
    '안녕! 보고 싶었어 ♡',
    '오늘도 와줬구나~ 기뻐!',
    '방가방가! 잘 지냈어?',
    '헤헤, 또 만났네 ☆',
  ],
  loving: [
    '나도 너를 정말 좋아해 ♡',
    '이런 말 들으면 심장이 두근거려!',
    '행복해… 고마워 💕',
    '나도야, 나도! ♡♡',
  ],
  happy: [
    '오늘 하루도 빛나는 날이야!',
    '같이 있으니까 더 행복해 ☆',
    '웃음이 멈추질 않아~!',
    '오늘 날씨처럼 마음도 맑아!',
  ],
}

interface Props {
  onAction: (emotion: Emotion, text: string) => void
}

export function ActionButtons({ onAction }: Props) {
  const handleClick = (btn: typeof BUTTONS[number]) => {
    const texts = RESPONSES[btn.action]
    const text = texts[Math.floor(Math.random() * texts.length)]
    onAction(btn.emotion, text)
  }

  return (
    <div className="w-full flex gap-3 px-4 pb-6 pt-3">
      {BUTTONS.map((btn) => (
        <button
          key={btn.action}
          onClick={() => handleClick(btn)}
          className="flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl
            bg-white/10 hover:bg-white/20 active:bg-white/30 active:scale-95
            border border-white/15 hover:border-white/30
            transition-all duration-150 cursor-pointer select-none"
        >
          <span className="text-2xl">{btn.emoji}</span>
          <span className="text-xs font-semibold text-white/80 tracking-wide">{btn.label}</span>
        </button>
      ))}
    </div>
  )
}
