# 7일 마음 트랙 → 자동 워크북 + 관찰일지 + AI 에이전트화

현재 `SevenDayWorkbookView` 안의 `MissionStepsForm` 입력은 `mind_track_checkins.reflection_payload` 에만 저장됩니다. 이를 (1) 워크북 자동 누적, (2) 관찰일지 변환·분석, (3) 챌린지 흐름에 게임상담 등 모든 기능을 자연스럽게 끼워넣기, (4) 사용자 대신 다음 행동을 결정해주는 에이전트로 확장합니다.

## 1. 데이터 흐름

```
MissionStepsForm  ─submit─▶  mind_track_checkins (기존)
                       │
                       ├─▶ observation_logs (자동 변환, source='mind_track_day{N}')
                       │       └─ 기존 ObservationResults 분석 화면 그대로 재사용
                       │
                       └─▶ mind_track_workbooks.entries[] (auto-append, day별 정렬)
```

- `checkin` 저장 직후 클라이언트에서 `upsertWorkbookEntry()` + `createObservationFromCheckin()` 호출 (별도 RPC 없이 supabase-js).
- 관찰일지 분석은 기존 `useAIObservationResults` 훅을 그대로 재사용 → 분석 결과는 `observation_logs.analysis_data` 에 저장되어 자동으로 워크북·여정 대시보드에 노출.

## 2. 새/수정 파일

- `src/lib/mindTrackObservationBridge.ts` (신규)
  - `payloadToObservationText(payload)`: StepAnswer[] → 자연어 노트 변환.
  - `syncCheckinToObservation(userId, enrollmentId, day, payload, theme)`: observation_logs upsert.
  - `appendWorkbookEntry(enrollmentId, day, payload, theme)`: workbook.entries JSONB 누적.
- `src/components/mind-track/seven-day/SevenDayWorkbookView.tsx`
  - 완료 핸들러에서 위 두 함수 호출, 토스트 한 번에 "관찰일지로 저장됨" + "AI 분석 보기" 액션.
- `src/components/mind-track/seven-day/DailyResourcePanel.tsx` (또는 신규 `DailyAgentPanel.tsx`)
  - **AI 에이전트 결정 카드**: 오늘의 체크인·관찰 분석을 종합해 다음 한 가지 행동을 사용자 대신 골라 자동 실행 버튼 제공 (게임상담 / 전문가 매칭 / 음성상담 / 자가검사). 두 번째 업로드 이미지의 톤 — "당신을 위해 결정했습니다" 카드.
  - 호출: 신규 edge function `mind-track-agent-decide` (LOVABLE_API_KEY, gemini-3-flash, response_format json).
- `supabase/functions/mind-track-agent-decide/index.ts` (신규)
  - 입력: enrollmentId, lastCheckin, latestObservationAnalysis.
  - 출력: `{ action: 'game'|'expert'|'voice'|'self_check'|'rest', route, label, reason, confidence }`.
  - 안전 가드: 위기 키워드 감지 시 `expert` + `/expert-hiring?urgent=true` 강제.

## 3. 챌린지 도중 자연스럽게 모든 기능 노출

`SevenDayWorkbookView` 의 Day별 사이드 영역에 7일 코스 안에서 한 번씩 자동 등장:
- Day 1·4·7 (무거움): 전문가 매칭 카드.
- Day 2: 게임 상담 권유 카드 (`/metaverse-voice`).
- Day 3: 음성 상담 (`/voice-counseling`).
- Day 5: 관찰일지 분석 결과 카드 (방금 만든 observation_logs 자동 분석).
- Day 6: AI 자기고민 작성 (`/ai-concern`).
- 모든 Day: 상단 **AI 에이전트 결정 카드**가 위 추천 중 하나를 자동 채택.

매핑은 `src/lib/mindTrackDayKeywords.ts` 옆에 `mindTrackDayAgentHints.ts` 신규로 분리 (Core 메모리 — 가격/하드코딩 금지 규칙 준수, 라우트만 상수로).

## 4. 기존 기능 재사용

- 관찰일지 분석 UI: `src/components/observation/ObservationResults.tsx` 그대로, 워크북 화면 안에 모달/Sheet 로 임베드.
- 게임상담 진입: `navigate('/metaverse-voice')` (이미 흰 배경 정리됨).
- 음성상담: `/voice-counseling`.

## 5. 검증

- Day 1 미션 입력 → 완료 → DB에서 `observation_logs` 1행, `mind_track_workbooks.entries` 누적 확인.
- 에이전트 카드 노출 + 위기 키워드("죽고싶") 입력 시 강제 라우팅 동작 확인.
- 빌드 통과(자동) + 기존 7일 흐름 회귀 없음.

## 비기술 요약 (사용자용)

미션을 적으면 자동으로 관찰일지에 저장되고, 그 관찰일지는 평소 쓰던 AI 분석을 그대로 받습니다. 매일 한 번 AI 에이전트가 "오늘 당신에게 필요한 한 가지"를 골라 게임상담·전문가·음성상담·자기고민 중 하나를 바로 실행해 줍니다. 7일 동안 모든 핵심 기능을 자연스럽게 한 번씩 경험하도록 Day별 추천 카드도 함께 뜹니다.
