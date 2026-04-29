
# 30일 마음 트랙 사용성 개선 계획

## 1. 피드백 핵심 진단

기획팀장 피드백을 정리하면 결제 이용자가 `/mind-track`에 들어왔을 때 겪는 문제는 4가지입니다.

1. **결제했는데 또 "30일 트랙 시작하기" 버튼이 보임** — 현재 페이지는 비결제자/결제자 한 페이지에 같이 있어서, 결제자에게도 "₩19,900 시작하기", "30일 트랙 시작하기" CTA, 무료 고민 리포트, 목표 선택, 마케팅 섹션이 모두 노출됩니다. 결제 이용자에겐 모두 노이즈.
2. **첫 화면에 "30일 트랙 이렇게 진행돼요" 안내가 없음** — 결제 직후 들어오면 바로 아동발달 자가체크가 보이고, 뭘 해야 하는지 모릅니다.
3. **비로그인 무료 고민 리포트가 결제자에게도 노출** — "구독해서 들어왔는데 비로그인 유저용 위젯이 보이는 게 이상하다"는 지적.
4. **Day별 미션이 한 줄로 끝남** — "Day 1 눈 마주치고 표정 따라하고 웃으세요"만 나오고, 그 안에 어떻게/얼마나/뭐 적어야 하는지 단계별 가이드가 없음.

## 2. 개선 방향 (3가지 축)

### 축 A — 결제 이용자 전용 뷰 분리 (가장 큰 효과)

현재 `/mind-track`은 "랜딩페이지 + 대시보드"가 한 파일에 섞여 있습니다.
이걸 사용자 상태에 따라 **완전히 다른 두 화면**으로 나눕니다.

```text
/mind-track 진입
   │
   ├─ 결제 완료 enrollment 있음
   │     → ActiveTrackView (단순 대시보드만)
   │        · Day N/30 헤더
   │        · 오늘의 미션 큰 카드 1개
   │        · "오늘 미션 시작" 버튼 1개
   │        · 진행률 + 지난 체크인 요약
   │        (마케팅/목표선택/무료리포트/아동발달 전부 숨김)
   │
   └─ 비로그인 / 미결제
         → LandingView (현재 페이지 그대로 유지)
```

결제자 화면에서 제거할 것:
- 무료 고민 리포트 카드
- 아동발달 자가체크 섹션 (`ChildDevConcernSection`)
- 목표 선택 그리드
- "30일, 이렇게 진행돼요" 마케팅 섹션
- "왜 이 트랙이 다를까요" 섹션
- 하단 ₩19,900 결제 CTA

결제자 화면에 추가할 것:
- **첫 진입 1회용 온보딩 모달**: "30일 트랙 이렇게 진행돼요" (3장짜리 슬라이드)
  - localStorage 키 `mind_track_onboarded_{enrollmentId}` 로 1회만 노출
  - "이용 방법 다시 보기" 버튼은 헤더에 작게 유지

### 축 B — 첫 진입 온보딩 (피드백 "시작하자마자 진행 방식이 떴으면")

결제 후 첫 방문 시 모달로 띄울 3장:

1. **"30일, 이렇게 흘러가요"** — 1주차 적응 / 2~3주차 실천 / 4주차 변화 리포트, 한 화면에 다이어그램으로
2. **"하루 흐름은 이렇게"** — ① 오늘 미션 카드 열기 → ② 3분 실천 → ③ 체크인 한 줄 기록
3. **"막힐 때는 여기"** — AI 코파일럿 / Day 7·14·21 전문가 매칭 안내

CTA: "시작하기" → 자동으로 Day 1 워크북으로 이동.

### 축 C — Day별 미션 단계화 (피드백 "한 줄로 끝나는 게 너무 빈약")

현재 `MindTrackWorkbook` 의 미션은 `mission_title` + `mission_description` 두 필드만 노출됩니다.
이걸 **체크리스트 단계 구조**로 보강합니다.

데이터 구조 (DB는 그대로, JSON 필드 추가 활용):
- `mind_track_daily_missions.steps` (기존 jsonb 컬럼 또는 신규) 에 단계 배열 저장
  - `[{step: "1단계 — 자세 잡기", detail: "허리 펴고 1분 호흡", duration_sec: 60, checkable: true}, ...]`
- AI 생성 함수 (`mind-track-init`, `weekly-refresh`) 프롬프트 수정 — 미션마다 3~5개 단계 + 체크포인트 + "잘 안 될 때 대안" 함께 생성

UI:
- Day별 워크북 카드 안에 **체크박스 단계 리스트**
- 각 단계마다 "왜 이걸 해요?" 토글 (1줄 설명)
- 마지막에 "오늘 한 줄 기록" 텍스트 입력 → 체크인으로 저장
- "막혔어요" 버튼 → 해당 day로 `/expert-hiring?from=mission_difficult&day=N` 이동 (이미 구현됨)

## 3. 구현 단계

### Step 1 — 결제자/비결제자 뷰 분리 (가장 먼저)
- `src/pages/MindTrack.tsx` 를 `MindTrackLanding.tsx` (현재 내용) 와 `MindTrackActive.tsx` (신규) 로 분기
- `MindTrack.tsx` 는 라우터 역할만: enrollment 상태 fetch → 분기
- `MindTrackActive.tsx` 구성:
  - 상단 헤더: Day N/30 + Progress + "이용 방법 보기" 작은 버튼
  - 메인: 오늘의 미션 카드 (큰 1개) + "Day N 시작" 버튼
  - 하위: 지난 체크인 3개 미니 리스트, 주간 마일스톤 진행도

### Step 2 — 첫 진입 온보딩 모달
- 신규 컴포넌트 `MindTrackFirstTimeOnboarding.tsx` (3장 슬라이드 + Skip)
- `localStorage.getItem('mind_track_onboarded_' + enrollmentId)` 체크
- "시작하기" 클릭 시 Day 1 워크북으로 이동
- 헤더의 "이용 방법 다시 보기" 버튼이 같은 모달을 다시 띄움

### Step 3 — Day 미션 단계화 (UI 먼저, 데이터는 fallback)
- `MindTrackWorkbook.tsx` 의 미션 카드를 단계 체크리스트로 개편
- DB에 `steps` 가 없으면 `mission_description` 을 줄바꿈/문장 단위로 자동 분리해 임시 단계 표시 (기존 데이터 호환)
- 신규 생성되는 미션은 AI가 단계 구조로 생성 (Step 4)

### Step 4 — AI 미션 생성 프롬프트 보강
- `supabase/functions/mind-track-init/index.ts`, `mind-track-weekly-refresh/index.ts` 의 프롬프트 수정
- 출력 스키마에 `steps: [{title, detail, duration_sec, why}]` 추가
- 기존 `mission_title`, `mission_description` 는 유지 (역호환)

### Step 5 — 미션 카드 안 "막혔어요 / 도움받기" 단축 버튼
- 이미 있는 `?from=mission_difficult` 라우트 활용해 1탭으로 전문가 매칭 페이지 이동

## 4. 영향 범위 (기술 세부)

수정/생성 파일:
- `src/pages/MindTrack.tsx` — 라우터 분기로 슬림화
- `src/pages/MindTrackLanding.tsx` (신규) — 현재 랜딩 콘텐츠 이동
- `src/pages/MindTrackActive.tsx` (신규) — 결제자 단순 대시보드
- `src/components/mind-track/MindTrackFirstTimeOnboarding.tsx` (신규) — 3장 슬라이드 모달
- `src/components/mind-track/MissionStepChecklist.tsx` (신규) — 단계 체크리스트
- `src/pages/MindTrackWorkbook.tsx` — 미션 카드를 step 리스트로 교체
- `supabase/functions/mind-track-init/index.ts` — 프롬프트에 steps 추가
- `supabase/functions/mind-track-weekly-refresh/index.ts` — 동일

DB:
- `mind_track_daily_missions` 에 `steps jsonb` 컬럼이 없으면 마이그레이션 추가 (있으면 그대로 사용)

## 5. 우선순위 제안

피드백의 가장 큰 통증 → 빠른 효과 순으로:

| 우선 | 작업 | 기대 효과 |
|---|---|---|
| 1 | 결제자/비결제자 뷰 분리 + CTA 제거 | "또 시작하기 보임", "비로그인 위젯 보임" 즉시 해결 |
| 2 | 첫 진입 온보딩 모달 | "들어오자마자 뭘 해야 할지 모르겠다" 해결 |
| 3 | 미션 단계 체크리스트 (UI + fallback) | "한 줄로 끝나는 게 빈약" 즉시 개선 |
| 4 | AI 미션 생성 프롬프트 보강 | 신규 등록자부터 풍부한 단계 자동 생성 |

승인해주시면 위 1→4 순서로 구현하겠습니다. 일부만 먼저 진행하시려면 어느 단계까지 할지 알려주세요.
