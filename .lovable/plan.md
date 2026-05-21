# 3일 무료체험 인테이크 퍼널 (이탈 방지)

## 지금 무엇이 문제였나
- 3일 무료체험 시작 직후 곧바로 `/mind-track/dashboard`로 보냄 → 빈 미션 카드 → "지금 시작하기" 클릭 → 워크북 없음 → `/mind-track/start`로 튕김 → trial 상태가 필터에서 빠져 "진행중인 트랙이 없습니다" 토스트 → `/mind-track`로 리다이렉트 → **완전 이탈**.
- (방금 즉시 수정함) `/mind-track/start`가 trial 상태도 받도록 픽스. 이걸로 죽는 화면은 사라졌지만, 여전히 "왜 내가 여기 있는지" 모르는 12문항 진단 화면이 첫인상이 됨.

## 새 플로우 (5단계, 한 페이지·세로 스와이프)

```
[/mind-track/start?intake=1]
  Step 1  Why  → 환영 + "당신을 위해 첫 3일을 짜드릴게요"
  Step 2  Concern → 고민 한 줄 입력 (체크 결과/audience 자동 프리필)
  Step 3  AI Expand → mind-track-concern-polish 호출, 다듬어진 문장 + 핵심 키워드 3개
  Step 4  Day1-3 Preview → 오늘·내일·모레 미션 카드 3장 + 5분 행동 액션
  Step 5  Email Subscribe → "매일 아침 7시, 미션 + 관련 영상" 토글 + 메일 입력 → /dashboard
```

각 단계 진입/이탈을 `mind_track_onboarding_events`에 기록 → 기존 `/mind-track/onboarding`(funnel 분석 페이지)에서 바로 확인 가능.

## 단계별 구현

### Step 2 — 고민 입력 (프리필 + 가이드)
- 체크에서 넘어왔다면(`?from=check&area=...`) 영역별 시드 문장 자동 채움.
  - 예: `area=emotion` → "아이가 감정이 폭발하는 순간을 어떻게 다뤄야 할지 모르겠어요."
- 글자수 카운터 + "어떤 상황인지 한 문장으로" 헬퍼.

### Step 3 — AI Expand (기존 엣지펑션 재사용)
- `mind-track-concern-polish` 호출 → 다듬어진 한 문장 + 핵심 키워드(감정/맥락/원하는 변화) 3개.
- 결과를 카드로 보여주며 "이대로 진행" / "다시 다듬기" 두 버튼.
- 실패 시 원문 그대로 진행(절대 막지 않음).

### Step 4 — Day 1-3 미션 프리뷰
- `mind-track-init` 호출 (이미 존재) — 다듬어진 concern + audience + (있다면) check 점수 전달.
- 응답에서 Day 1·2·3 미션 + `action_steps`를 카드 3장으로 표시.
- 각 카드: `Day N` 배지 / 미션 제목 / 5분 행동 액션 1-2-3 / 예상 시간.
- "다음" 누르면 워크북이 이미 생성된 상태로 Step 5 진입.

### Step 5 — 이메일 구독 (실제 발송)
- 토글 ON 기본값, 메일 입력란(로그인 이메일 프리필).
- "매일 아침 7시, 오늘 미션 카드 + 관련 영상 1편" 카피 + 작은 미리보기 썸네일.
- 저장: `user_coaching_goals` upsert (`email_opt_in=true`, `email`, `track_focus`, `goal_text=다듬어진 concern`).
- 즉시 1통 발송: `send-daily-coaching-email` invoke (Day 1 미션 + 영상 1편 + "내일 또 보내드릴게요" 문구).
- 발송 성공 토스트 → `/mind-track/dashboard?welcome=1`.

### 진입점 변경
- `MindTrackFromCheckView.handleStart`: 등록 성공 후 `/mind-track/dashboard` → **`/mind-track/start?intake=1`** 로 변경.
- `PaymentComplete`의 mind_track 분기도 동일하게 intake 우선.

## 변경 파일

```text
src/pages/MindTrackStart.tsx                     // intake=1 모드 분기, 5단계 UI
src/components/mind-track/intake/                // (신규)
  ├ IntakeConcernStep.tsx
  ├ IntakeAIExpandStep.tsx
  ├ IntakeMissionPreviewStep.tsx
  └ IntakeEmailSubscribeStep.tsx
src/components/mind-track/MindTrackFromCheckView.tsx   // 성공 시 /start?intake=1 로
src/pages/PaymentComplete.tsx                    // 동일 라우팅 보정
```

엣지펑션 신규 없음 — 기존 `mind-track-concern-polish`, `mind-track-init`, `send-daily-coaching-email` 재사용. 단, `send-daily-coaching-email`에 `force_send_now=true` 옵션 한 줄 추가.

## DB 변경
- `user_coaching_goals` 테이블에 `email_opt_in boolean DEFAULT true`, `email text` 컬럼 두 개가 없으면 추가 (마이그레이션 1건).
- 그 외 변경 없음.

## 측정
- 단계 진입마다 `mind_track_onboarding_events` 적재 → 어디서 이탈하는지 본인 계정 `/mind-track/onboarding` 페이지에서 확인.

## 안 하는 것 (스코프 밖)
- 30일 트랙 인테이크는 7일 트랙 안정화 후 별도 작업.
- 이메일 템플릿 비주얼 리브랜딩(나중에 한 번에).
- 카카오 알림톡 — 이메일 먼저 검증.

## 한 줄 요약
체험 시작 → 빈 대시보드 대신 **5단계 인테이크 한 페이지**로 보내, 고민 받고 AI로 다듬어 Day 1-3 미션을 그 자리에서 보여주고 이메일까지 1통 발송 → 그 다음에야 대시보드. 이탈할 틈을 안 줌.
