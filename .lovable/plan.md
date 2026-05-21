## 문제

지금 Day 1 화면(/mind-track/workbook?day=1)은 미션 카드가 "세 가지 적기 / 감정 단어 적기 / 생각 적기"라고 안내하지만, **실제로 적을 칸이 없습니다.** 슬라이더 3개로만 끝나서 사용자가 "뭘 적으라는 거지?" 하고 이탈하기 쉽습니다. LightMission/Day4에는 자유 텍스트 1칸이 있지만, 카드가 시킨 4개의 구체적인 행동과 1:1로 매칭되지 않습니다.

## 해결 방향 — 하이브리드 입력

미션 카드의 `action_steps`(또는 정적 미션의 `steps`)를 그대로 입력 폼으로 변환하고, 맨 아래에 자유 저널 1칸을 추가합니다.

```text
┌─ Day 1 · 당신의 고민에서 만든 미션 ────────────┐
│ 현재 마음 상태 깊이 들여다보기                 │
│ [Why · 왜 지금 이 미션인가]                    │
│                                                │
│ 지금 할 일 (순서대로)                          │
│ ─────────────────────────────────────────────  │
│ 01  조용한 시간 확보하기            ☐ 했어요   │
│ 02  최근 힘들었던 순간 세 가지 적기            │
│     ① [_______________________________]        │
│     ② [_______________________________]        │
│     ③ [_______________________________]        │
│ 03  각 순간에 느낀 감정 단어 적기              │
│     [감정1] [감정2] [감정3]  (칩 입력)         │
│ 04  '자괴감','지침'에 대한 생각 적기           │
│     [textarea 3줄]                             │
│                                                │
│ 한 줄 마무리 (선택)                            │
│ [textarea]                                     │
│                                                │
│ [오늘 미션 완료]                               │
└────────────────────────────────────────────────┘
```

스텝 종류 자동 판별 규칙 (정규식):
- "N 가지", "세 가지", "두 가지" → N개의 한 줄 입력
- "감정 단어", "키워드", "단어" → 칩(chip) 입력(최대 5개)
- "생각 적기", "써보기", "기록", "묘사" → 멀티라인 textarea
- 그 외(준비/관찰/호흡 등) → 단순 체크박스("했어요")

## 데이터 저장

기존 `mind_track_checkins.reflection_note`(text)는 그대로 두고, 구조화된 답변은 같은 행의 **새 컬럼** `reflection_payload jsonb`에 저장합니다. 자유 저널은 계속 `reflection_note`에 들어갑니다.

```json
{
  "version": 1,
  "day": 1,
  "steps": [
    { "idx": 0, "label": "조용한 시간 확보하기", "kind": "check", "value": true },
    { "idx": 1, "label": "최근 힘들었던 순간 세 가지 적기", "kind": "list", "value": ["...", "...", "..."] },
    { "idx": 2, "label": "각 순간에 느낀 감정 단어 적기", "kind": "chips", "value": ["지침", "자괴감", "분노"] },
    { "idx": 3, "label": "...", "kind": "text", "value": "..." }
  ]
}
```

장점: Day 7 리포트와 my-journey 분석 시 정형 데이터로 인용 가능. 기존 화면(텍스트만 보는 곳)은 `reflection_note`만 봐도 깨지지 않음.

## 적용 범위 (7일 전체)

신규 컴포넌트 `MissionStepsForm`을 만들고, 다음 4개 화면 모두에 삽입:

| Day | 화면 | 적용 |
|---|---|---|
| 1 | `Day1DiagnosisScreen` | 슬라이더 아래에 폼 추가, 저장 시 payload 함께 upsert |
| 2·3·5·6 | `LightMissionScreen` | 기존 자유 textarea를 폼+저널 구조로 교체 |
| 4 | `Day4ExpertMatchScreen` | "직접 해결" 분기에 폼 추가 |
| 7 | `Day7ReportScreen` | "지난 7일 회고" 정형 입력으로 활용(선택 항목) |

데이터 소스: `PersonalizedMissionCard`가 받는 `mission.action_steps`(맞춤) 또는 `getSevenDayLightMission(...).steps`(정적). `MissionStepsForm`이 두 형태 모두 받도록 추상화.

## 동작 디테일

- 자동 저장: 사용자가 칸을 떠날 때 로컬 state만 갱신(서버는 완료 버튼에서 일괄 upsert) — 토큰/네트워크 절약.
- 완료 조건: kind=check인 스텝 100% + list/chips/text 중 1개 이상에 값. 그 외엔 토스트로 안내.
- 이미 완료된 날은 폼이 readonly로 접혀서 표시(아코디언) — 기존 'expanded' 패턴 재사용.
- 모바일 우선: 칸 사이 간격 16px, textarea 자동 높이, chips는 input + Enter로 추가.
- 디자인 토큰: 기존 카드와 동일하게 `bg-white`, `rounded-2xl`, `border-slate-100`, gold 액센트 유지. 그라데이션/이모지 없음.

## 작업 항목

1. **DB 마이그레이션** — `mind_track_checkins`에 `reflection_payload jsonb` 컬럼 추가(nullable). 인덱스 불필요. 마이그레이션 description은 비기술 사용자 친화 문구로 작성.
2. **`src/components/mind-track/seven-day/MissionStepsForm.tsx` 신규** — 위의 자동 판별 + chips/list/text/check 4가지 입력 렌더링, `onChange(payload)` 콜백.
3. **`Day1DiagnosisScreen.tsx`** — 슬라이더 아래에 `<MissionStepsForm>` + 자유 저널 textarea 삽입, 저장 시 `reflection_payload` upsert.
4. **`LightMissionScreen.tsx`** — 기존 textarea를 `MissionStepsForm` + 자유 저널 구조로 교체.
5. **`Day4ExpertMatchScreen.tsx`** — '직접 해결' 분기에 동일 폼 삽입.
6. **`Day7ReportScreen.tsx`** — 회고 영역에 정형 폼 옵션(선택 사용).
7. **`PersonalizedMissionCard.tsx`** — 하단 안내 문구를 "아래 칸을 채우고 완료를 눌러주세요"로 일치 시키고, 자체 안내 라인은 짧게 정리.

LLM 호출 없음(클라이언트 + 단순 upsert). 기존 미션 재생성 플로우/이론 근거는 그대로 유지됩니다.
