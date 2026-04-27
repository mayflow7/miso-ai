'use client'

interface Props {
  onStart: () => void
}

export function CoverPage({ onStart }: Props) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0a0612] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] rounded-full bg-violet-900/30 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] rounded-full bg-pink-900/25 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-7 px-8 w-full max-w-xs">
        {/* App icon */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl
          bg-gradient-to-br from-violet-500/20 to-pink-500/20
          border border-white/10 shadow-lg shadow-purple-900/30">
          ✨
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-thin tracking-[0.45em] text-white mb-2.5">Miso</h1>
          <p className="text-white/35 text-[11px] tracking-[0.25em] uppercase">Your AI Friend</p>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-medium tracking-[0.2em] text-white text-sm
            bg-gradient-to-r from-violet-500/80 to-pink-500/80
            hover:from-violet-500 hover:to-pink-500
            active:scale-[0.97] transition-all duration-150
            shadow-lg shadow-purple-900/40 border border-white/10"
        >
          시 작 하 기
        </button>

        {/* ── 로그인 영역 (이메일 인증 준비) ────────────────────── */}
        <div className="w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/20 text-[11px] tracking-wide">또는</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/*
            TODO: 이메일 로그인 구현 시 아래 disabled 제거 후 onClick 핸들러 연결
            - 이메일/패스워드 입력 → API 인증 → onStart() 호출 흐름으로 연결
          */}
          <button
            disabled
            className="w-full py-3 rounded-2xl text-sm tracking-wide
              text-white/25 border border-white/8 cursor-not-allowed
              transition-all duration-150"
          >
            이메일로 로그인
          </button>
        </div>
      </div>

      {/* Version */}
      <p className="absolute bottom-6 text-white/15 text-[10px] tracking-widest">v0.1 · MVP</p>
    </div>
  )
}
