
## 무엇을 만들까

### 1. 새 트랙 구조: `mind_2week` (14일 / 4 세션)
- **세션 일정**: Day 1(월) · Day 4(목) · Day 8(월) · Day 11(목) — 총 4세션
- **세션 구성**: ① AI 코칭 → ② 관찰 일지 작성 → ③ AI 피드백 (3단계 stepper)
- **비세션 날(Day 2·3·5·6·7·9·10·12·13)**: "쉬는 날" 안내 + 다음 세션 카운트다운 + 지난 세션 하이라이트 카드
- **마지막 날(Day 14)**: 2주 종합 변화 리포트

기존 `mind_7day` / `mind_30day` 트랙은 그대로 유지 (호환). 신규 결제·진입 흐름만 `mind_2week`로 전환.

### 2. `/mind-track` 진입 동작 변경
- 결제(또는 베타 무료 활성) 사용자가 `/mind-track`에 진입하면 → **곧바로 오늘의 워크북** (`/mind-track/workbook?day=N`)으로 리다이렉트
- 미가입 사용자: 기존 마케팅 랜딩 그대로 (`/mind-track`)
- 기존 `/mind-track/dashboard` 라우트는 유지하되 사이드바·CTA에서 제거 (직접 URL로만 접근)

### 3. 워크북 화면 (`MindTrackWorkbook.tsx`) 모드 분기
- `track_type === 'mind_2week'` && **세션 날**: 새 `TwoWeekSessionView` (코칭→일지→피드백 3-step)
- `track_type === 'mind_2week'` && **비세션 날**: 새 `TwoWeekRestView` (쉬는 날 카드 + 지난 세션 회고)
- 그 외: 기존 7일/30일 뷰 그대로

### 4. 콘텐츠 라이브러리
`src/lib/mindTrack2WeekContent.ts` 신규
- 세션 4회 × audience(child/adult/parent/teen) 콘텐츠
- 각 세션: 코칭 카피, 일지 프롬프트 3개, 피드백 생성용 시스템 프롬프트
- 비세션 날: "쉬는 날" 카피 + 회고 카드 템플릿

### 5. DB
- 기존 `mind_track_enrollments.track_type`에 `'mind_2week'` 값 추가 (Postgres text 컬럼이라 마이그레이션 불필요 — enum 아님 확인 후 진행)
- 세션 진행 상태는 기존 `mind_track_workbook_progress` 그대로 재사용 (day 인덱스 1~14)

### 6. 코어 헬퍼
- `getDayCopy(day, 14, audience)` 케이스 추가 → `mindTrackDayCopy.ts` 확장
- `isSessionDay(day)` 헬퍼: `[1,4,8,11].includes(day)`
- `getNextSessionDay(day)` 헬퍼: 다음 세션까지 D-N 계산
- `startMindTrackTrial`에 `trackType` 파라미터 추가 (기본 `'mind_2week'`로 변경)

## 건드리지 않는 것
- 7일/30일 트랙 코드, 결제 SKU, 가격 상수 (`mind_track_7` 등) — 호환 유지
- 사이드바·랜딩 마케팅 카피의 "7일" 표기는 다음 작업에서 별도로 일괄 변경 (이번 PR은 구조만)
- 위기 안전망 / 전문가 매칭 로직

## 산출물 (파일별)
**신규**
- `src/lib/mindTrack2WeekContent.ts` — 4세션 콘텐츠 + audience 분기
- `src/components/mind-track/workbook/TwoWeekSessionView.tsx` — 코칭→일지→피드백 3-step
- `src/components/mind-track/workbook/TwoWeekRestView.tsx` — 쉬는 날 + 회고 카드

**수정**
- `src/lib/mindTrackDayCopy.ts` — 14일 case, `isSessionDay`, `getNextSessionDay` export
- `src/lib/mindTrackEnrollment.ts` — `startMindTrackTrial(trackType='mind_2week')` 분기
- `src/pages/MindTrack.tsx` — 결제 활성 사용자 자동 리다이렉트 to workbook
- `src/pages/MindTrackWorkbook.tsx` — `mind_2week` 분기 추가
- `src/App.tsx` — (필요 시) 라우트 정리 없음, 기존 그대로

## 메모리 업데이트
완료 후 `mem://features/mind-track/two-week-session-structure-ko` 신규 작성 + index Core의 가격 정책에 `mind_2week` 표기 추가.

## 한 줄 요약
**"2주 동안 주 2회만, 오늘 뭘 할지만 보여주는" 트랙**을 새 SKU 없이 기존 결제/베타 위에 얹는 구조. 기존 7일/30일은 호환 유지하고, /mind-track 진입은 오늘 워크북으로 즉시 이동.
