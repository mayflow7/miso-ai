# Miso AI — Dev Memo 01

**최초 작성**: 2026-04-26  
**최종 업데이트**: 2026-04-27 (2차)  
**작성자**: Claude Code (Sonnet 4.6)  
**단계**: MVP 1 완성 + 03_instruction 반영 완료 + 메시지 1500개 확장

---

## 1. 프로젝트 개요

`ai-gf` (D:\_MyService\001_mira.ai\ai-gf)의 후속 프로젝트.  
VRoid로 제작한 3D 캐릭터를 활용한 심플한 인터랙션 웹앱.  
복잡한 AI 채팅 없이 버튼 3개만으로 캐릭터와 교감하는 MVP.

---

## 2. 기술 스택

| 항목 | 버전 |
|---|---|
| Next.js | 16.2.4 (App Router, Turbopack) |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| Three.js | 0.183.x |
| @pixiv/three-vrm | 3.5.x |
| Zustand | 5.x |

---

## 3. 프로젝트 구조

```
D:\_MyService\002_miso.ai\
├── _claud.code\
│   ├── 01_instruction.txt      — MVP 1 기획 지시문
│   ├── 02_instruction.txt      — Idle 애니메이션 개선 지시문
│   └── 03_instruction.txt      — 이펙트/음악/커버페이지 지시문
├── _claude.doc\
│   └── dev_memo_01.md          — 이 파일
├── app\
│   ├── layout.tsx              — 루트 레이아웃
│   ├── page.tsx                — 메인 페이지 (전체 조합)
│   └── globals.css             — 전역 스타일 + 애니메이션 정의
├── components\
│   ├── VRMViewer.tsx           — Three.js 캔버스 (전체화면)
│   ├── LevelGauge.tsx          — 상단 XP/레벨 게이지
│   ├── ActionButtons.tsx       — 하단 3개 버튼
│   ├── FloatingBubble.tsx      — 말풍선 팝업 (버튼별 X좌표 + 중앙 float)
│   ├── ParticleEffect.tsx      — 이모지 파티클 (버튼 클릭 시 fireworks)
│   ├── SpeakerControl.tsx      — 볼륨 슬라이더 + mute 토글
│   └── CoverPage.tsx           — 시작 커버 페이지 (로그인 확장 가능 구조)
├── data\
│   └── responses.ts            — 버튼별 응답 메시지 풀 (총 1500개, 버튼별 500개)
├── hooks\
│   ├── useVRMViewer.ts         — Three.js/VRM 초기화 및 감정/애니메이션 제어
│   └── useBackgroundMusic.ts   — 배경음악 재생/볼륨/mute 제어
├── store\
│   └── index.ts                — Zustand 스토어 (XP, 레벨, 클릭 수)
├── types\
│   └── index.ts                — Emotion, ButtonAction 타입
└── public\
    ├── audio\
    │   └── Dream.wav           — 배경음악 (_ref_resource/music에서 복사)
    └── vrm\
        └── character.vrm       — VRoid 캐릭터 (ai-gf에서 복사)
```

---

## 4. 핵심 기능 명세

### 4-1. 전체화면 VRM 뷰어

- `useVRMViewer.ts` 훅에서 Three.js Scene, Camera, Renderer, OrbitControls 초기화
- 카메라: `PerspectiveCamera(28)`, position `(0, 1.0, -4.5)`, lookAt `(0, 0.85, 0)`
- 조명: AmbientLight(1.2) + DirectionalLight 핑크계열(1.4) + 보조(0.6)
- OrbitControls: **360도 자유 회전**, 상하각 제한, 줌/패닝 비활성화

### 4-2. Idle 애니메이션 (다층 구조)

버튼 클릭 후 3초 뒤 idle 복귀 시 모두 재개.

| 레이어 | 대상 bone | 내용 |
|---|---|---|
| 눈 깜빡임 | blink expression | 3~5초 랜덤 간격, 0.15초 애니메이션 |
| 호흡 | spine, chest | ~4초 주기 sin, chest는 spine 대비 2배 강조 |
| 몸통 흔들림 | spine, hips | 두 주기(~9s, ~7s) 합산으로 불규칙하게 |
| 고개 움직임 | head, neck | 3개 주파수 합산, x/y/z 축 복합 |
| Look-around | head, neck | 7~13초마다 랜덤 방향 시선 이동 (상태 머신) |
| 팔 호흡 연동 | leftUpperArm, rightUpperArm | 호흡에 약하게 따라 미세하게 움직임 |

**Look-around 상태 머신:**
```
idle (7~13s 대기) → moving (시선 이동, lerp 2.5x)
  → holding (1.2~2s 고정) → returning (중앙 복귀, lerp 2.0x) → idle
```

### 4-3. 팔 포즈 (POSE_MAP)

VRM normalized bone 기준: `z=0` = 수평(T포즈), `z=±1.57` = 완전히 아래

| Emotion | leftUpperArm [x,y,z] | rightUpperArm [x,y,z] | 비고 |
|---|---|---|---|
| idle | [0.1, 0, 1.3] | [0.1, 0, -1.3] | 자연스럽게 내린 팔, lowerArm도 포함 |
| happy | [0.0, 0, 1.1] | [-0.2, 0, -1.0] | 오른팔 살짝 들림 |
| love | [-0.3, 0, 0.9] | [-0.3, 0, -0.9] | 양팔 앞으로 모음 |
| excited | [-0.8, 0, 0.6] | [-0.8, 0, -0.6] | 양팔 위로 |

### 4-4. 감정 시스템

- 버튼 클릭 시 `setEmotion()` → expressionManager + humanoid bone rotation 동시 변경
- 3초 후 idle 자동 복귀 (`emotionTimerRef`로 연속 클릭 시 타이머 재설정)

| Emotion | VRM 표정 |
|---|---|
| idle | — |
| happy | happy (0.8) |
| love | relaxed (0.8) |
| excited | happy (0.8) |

### 4-5. 버튼 및 응답 메시지

| 버튼 | Emotion | 응답 수 |
|---|---|---|
| 👋 Hi there | happy | **500개** 랜덤 |
| 💕 Loving you | love | **500개** 랜덤 |
| ✨ Happy day | excited | **500개** 랜덤 |

- **총 1500개** 메시지 풀 (`data/responses.ts`)
- 메시지 주제: 인사/보고싶음/에너지/시간대(hi), 애정/설렘/감사/약속(loving), 기쁨/에너지/신남/함께(happy)
- 테마별 코멘트 블록으로 그룹화하여 관리

### 4-6. 레벨 게이지

- XP: 버튼 클릭당 +3, 최대 100
- 레벨: `floor(xp / 10) + 1`, 최대 Lv.10
- 게이지 바: gradient (violet → pink), glow shadow, 700ms ease-out 트랜지션
- 상태: Zustand persist → localStorage (`miso-store` 키)

### 4-7. 말풍선 팝업 (업데이트)

- 버튼별 X 좌표: 왼쪽 16.7% / 가운데 50% / 오른쪽 83.3%
- CSS 애니메이션 `bubbleFloat`: **4.2초**, 화면 중앙까지 상승 후 dim out
  - `translateY(calc(-50vh + 60px))` — 화면 수직 중앙 도달 후 fade
- 연속 클릭 시 최대 5개까지 중첩 표시 (id 기반 개별 관리)

### 4-8. 파티클 이펙트 (신규)

- 버튼 클릭 시 해당 버튼 위치에서 14개 이모지 파티클 폭발
- CSS custom property (`--vx`, `--vy`, `--rotate`) 기반 per-particle 애니메이션

| 버튼 | 파티클 이모지 |
|---|---|
| 👋 Hi there | ✨ ⭐ 💛 🌟 💫 |
| 💕 Loving you | ❤️ 💕 💖 💗 🌸 |
| ✨ Happy day | 🎉 🌟 ✨ 🎊 💫 ⭐ |

### 4-9. 배경음악 + 볼륨 컨트롤 (신규)

- `Dream.wav` → `public/audio/Dream.wav`, loop 재생, 초기 볼륨 0.25
- **브라우저 autoplay 정책**: 사용자 인터랙션 필요 → 커버페이지 "시작하기" 탭으로 해결
- `useBackgroundMusic(src, enabled)`: `enabled=true`가 되는 순간 재생 시작
- `SpeakerControl` 컴포넌트: 게이지 바 **하단** 우측 배치
  - 클릭 → 볼륨 패널 펼침 (슬라이더 + mute 토글 + % 숫자 표시)
  - 아이콘: 볼륨 0 (muted) / 0~0.5 (low) / 0.5+ (high) 3단계

### 4-10. 커버 페이지 (신규)

- 앱 첫 진입 시 전체화면 커버 표시 (`z-50`)
- 구성: ✨ 아이콘 + "Miso" 타이틀 + "Your AI Friend" + **시작하기** 버튼
- "시작하기" 탭 → `started=true` → 음악 즉시 재생 + 메인 화면 전환
- 이메일 로그인 영역 구조 포함 (현재 `disabled`, 향후 인증 연결 가능)

---

## 5. 주요 설계 결정

- **`--no-src-dir` 구조**: tsconfig `@/*` alias가 루트를 가리키므로 `src/` 없이 루트에 배치
- **dynamic import (SSR: false)**: Three.js는 브라우저 전용이므로 `VRMViewer`를 dynamic import로 처리
- **감정 타이머**: `emotionTimerRef`로 연속 클릭 시 이전 타이머 취소 후 재설정
- **버블 id 관리**: `bubbleIdRef`(숫자 카운터)로 각 버블을 고유하게 식별
- **OrbitControls 360도**: azimuth 제한 제거로 자유 회전
- **파티클 CSS custom property**: `--vx`, `--vy`, `--rotate`를 inline style로 주입, keyframe에서 `var()` 참조 → per-particle 개별 궤적
- **배경음악 autoplay 해결**: `enabled` prop 패턴으로 커버페이지 탭 이후 재생 시작. 브라우저 정책상 사용자 인터랙션 없이 오디오 autoplay 불가 — 커버페이지가 그 게이트 역할
- **응답 메시지 분리**: `data/responses.ts`로 분리하여 ActionButtons와 데이터 분리
- **하품 애니메이션 시도 → 포기**: VRM normalized bone 좌표계 파악의 어려움. 추후 재도전 시 Three.js 씬에서 본 위치를 직접 측정하는 방식 권장

---

## 6. 실행 방법

```bash
cd D:\_MyService\002_miso.ai
npm run dev
# → http://localhost:3000
```

---

## 7. 배포 정보

| 항목 | 내용 |
|---|---|
| GitHub | https://github.com/mayflow7/miso-ai |
| Vercel | https://miso-ai-alpha.vercel.app |
| 배포 방식 | GitHub push → Vercel 자동 빌드 |
| 인증 | Windows Credential Manager (git credential manager) |

---

## 8. 모바일 대응

- 반응형 레이아웃: 웹/모바일 동일 인터페이스
- 모바일 세로 화면에서 캐릭터 발이 버튼 영역과 겹치는 문제 → **버튼 크기 축소**로 해결
  - 1차: `py-3.5 → py-2`, `text-2xl → text-lg` (약 1/3 감소)
  - 2차: `py-2 → py-1.5`, `text-lg → text-base` (추가 2/5 감소)

---

## 9. 다음 단계 후보

### 레벨 시스템 개편 (03_instruction #10~11)
- 레벨 0 시작, 클릭 수 기반 누적 XP로 레벨업 (현재는 단순 XP %)
- 점점 어려워지는 레벨업 곡선 (lv1→2: 30클릭, lv2→3: 60클릭, 2배씩 증가)
- 최대 lv.70, 초반 3일/중반 6일/후반 15일 페이스 설계 예정

### 로그인 기능
- 커버페이지 "이메일로 로그인" 버튼 활성화 (현재 disabled)
- 이메일/패스워드 → API 인증 → onStart() 호출 흐름

### 기타 MVP 2 후보
- 캐릭터 이름 표시
- 레벨업 연출 (게이지 가득 찰 때 이펙트)
- 배경 테마 변경
- VRM 표정 및 포즈 추가 (shy, surprised 등)
- 하품 모션 재도전 (본 좌표 직접 측정 방식)
- PWA 지원 (모바일 홈 화면 추가)
