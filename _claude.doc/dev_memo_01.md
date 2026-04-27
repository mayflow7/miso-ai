# Miso AI — Dev Memo 01

**작성일**: 2026-04-26  
**작성자**: Claude Code (Sonnet 4.6)  
**단계**: MVP 1 초기 구현 완료

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
│   └── 01_instruction.txt      — 기획 지시문
├── _claude.doc\
│   └── dev_memo_01.md          — 이 파일
├── app\
│   ├── layout.tsx              — 루트 레이아웃 (심플, 폰트 기본값)
│   ├── page.tsx                — 메인 페이지 (전체 조합)
│   └── globals.css             — 전역 스타일 + bubble-float 애니메이션
├── components\
│   ├── VRMViewer.tsx           — Three.js 캔버스 (전체화면)
│   ├── LevelGauge.tsx          — 상단 XP/레벨 게이지
│   ├── ActionButtons.tsx       — 하단 3개 버튼
│   └── FloatingBubble.tsx      — 말풍선 팝업 (CSS 애니메이션)
├── hooks\
│   └── useVRMViewer.ts         — Three.js/VRM 초기화 및 감정 제어
├── store\
│   └── index.ts                — Zustand 스토어 (XP, 레벨, 클릭 수)
├── types\
│   └── index.ts                — Emotion, ButtonAction 타입
└── public\
    └── vrm\
        └── character.vrm       — VRoid 캐릭터 (ai-gf에서 복사)
```

---

## 4. 핵심 기능 명세

### 4-1. 전체화면 VRM 뷰어

- `useVRMViewer.ts` 훅에서 Three.js Scene, Camera, Renderer, OrbitControls 초기화
- 카메라: `PerspectiveCamera(28)`, position `(0, 1.0, -4.5)`, lookAt `(0, 0.85, 0)`
  - VRM 모델의 앞면이 -Z 방향이므로 카메라도 -Z에 배치
- 조명: AmbientLight(1.2) + DirectionalLight 핑크계열(1.4) + 보조(0.6)
- OrbitControls: 좌우 ±30도, 줌/패닝 비활성화
- Idle 연출:
  - 자동 눈 깜빡임 (3~5초 랜덤 간격, 0.15초 애니메이션)
  - 고개 미세 흔들림 (sin 함수, idle 상태에서만)
- 감정 전환: 버튼 클릭 시 표정(expressionManager) + 포즈(humanoid bone rotation) 동시 변경, 3초 후 idle 복귀

### 4-2. 감정 시스템

| Emotion | VRM 표정 | 주요 포즈 |
|---|---|---|
| idle | — | 양팔 자연스럽게 |
| happy | happy (0.8) | 고개 살짝 기울임, 한 팔 내림 |
| love | relaxed (0.8) | 고개 앞으로, 양팔 앞으로 |
| excited | happy (0.8) | 고개 기울임, 양팔 들어올림 |

### 4-3. 버튼 및 응답

| 버튼 | Emotion | 응답 풀 |
|---|---|---|
| 👋 Hi there | happy | 4종 랜덤 |
| 💕 Loving you | love | 4종 랜덤 |
| ✨ Happy day | excited | 4종 랜덤 |

### 4-4. 레벨 게이지

- XP: 버튼 클릭당 +3, 최대 100
- 레벨: `floor(xp / 10) + 1`, 최대 Lv.10
- 게이지 바: gradient (violet → pink), glow shadow, 700ms ease-out 트랜지션
- 상태: Zustand persist → localStorage (`miso-store` 키)

### 4-5. 말풍선 팝업

- 버튼 클릭 시 하단 120px 위치에서 생성
- CSS 애니메이션 `bubbleFloat`: 0 → 90px 위로 이동하며 opacity 0→1→1→0, 총 2.8초
- 빠르게 연속 클릭 시 최대 5개까지 중첩 표시 (id 기반 개별 관리)

---

## 5. 주요 설계 결정

- **`--no-src-dir` 구조**: tsconfig `@/*` alias가 루트를 가리키므로 `src/` 없이 루트에 `components/`, `hooks/`, `store/`, `types/` 배치
- **dynamic import (SSR: false)**: Three.js는 브라우저 전용이므로 `VRMViewer`를 Next.js dynamic import로 처리
- **감정 타이머**: `emotionTimerRef`로 연속 클릭 시 이전 타이머 취소 후 재설정
- **버블 id 관리**: `bubbleIdRef`(숫자 카운터)로 각 버블을 고유하게 식별, 동일 텍스트 연속 클릭도 새 버블로 처리

---

## 6. 실행 방법

```bash
cd D:\_MyService\002_miso.ai
npm run dev
# → http://localhost:3000
```

---

## 7. 다음 단계 (MVP 2 후보)

- 캐릭터 이름 표시 및 커스터마이징
- 레벨업 연출 (게이지 가득 찰 때 이펙트)
- 배경 테마 변경
- 버튼 추가 또는 텍스트 입력 기능
- VRM 표정 및 포즈 추가 (shy, surprised 등)
- PWA 지원 (모바일 홈 화면 추가)
