# 워크북·대시보드 동기화/네비게이션 개선

요청 4가지를 한 번에 정리해서 적용합니다. 모두 프론트엔드 한정 작업이고 DB 스키마 변경은 없습니다.

## 1. 워크북 상단에 "다음 Day"·"오늘 미션으로 점프" 버튼 추가

대상: `src/pages/MindTrackWorkbook.tsx`

선택된 Day(`selectedDay`)와 오늘(`currentDay`)을 기준으로, 캘린더 위쪽 헤더 영역에 작은 네비게이션 바를 추가합니다.

- ◀ 이전 Day 버튼: `selectedDay > 1`일 때 활성, 클릭 시 `setSelectedDay(selectedDay - 1)` + URL `?day=` 동기화.
- ▶ 다음 Day 버튼: `selectedDay < 30`일 때 활성, 클릭 시 `setSelectedDay(selectedDay + 1)` + URL `?day=` 동기화. 미래 Day(잠긴 Day)인 경우 버튼은 보이되 살짝 흐리게(disabled tooltip "아직 잠긴 미래 Day예요") 처리.
- 🎯 "오늘 미션으로 점프" 버튼: `selectedDay !== currentDay`일 때만 노출. 클릭 시 `setSelectedDay(currentDay)` + URL `?day=currentDay&openMission=1` → 기존 자동 다이얼로그 오픈 로직(395~426줄)이 미션 모달을 띄움.
- 키보드: ← / → 화살표 키로 같은 동작(이미 dialog가 열려있을 때는 무시).

URL 업데이트는 기존 `setSearchParams` 사용 패턴(190~200줄 근처) 그대로.

## 2. 체크인 제출 시 대시보드 진행률·스트릭 즉시 반영

대상: `src/pages/MindTrackDashboard.tsx`

문제: 대시보드는 `enrollment.id`/`day` 변할 때만 fetch하고 realtime 구독이 없어, 워크북에서 체크인 완료해도 대시보드 탭으로 돌아왔을 때 갱신이 늦음.

수정:
- `useEffect`로 Supabase realtime 채널을 구독: `mind_track_checkins` 테이블의 `enrollment_id=eq.<enrollment.id>` 필터로 INSERT/UPDATE 이벤트 시 fetch 함수를 다시 호출.
- 안정성을 위해 fetch 로직을 `loadDashboard()` 함수로 추출하고, mount 시점·realtime 이벤트 시점에 모두 호출.
- 동일 탭 내에서도 즉시 반영되도록, 워크북 `submitCheckin` 성공 직후 `clearMindTrackDashboardCache()` (이미 존재하는 헬퍼)를 호출 + `window.dispatchEvent(new CustomEvent('mt:checkin-updated'))` 발행. 대시보드는 해당 이벤트 리스너로도 refetch.

`useMindTrackDashboard` 훅은 이미 realtime 구독이 있으므로 사이드바 위젯 쪽 진행률은 자동 갱신됨 — 별도 수정 불필요.

## 3. `?day=` 딥링크 개선

대상: `src/pages/MindTrackWorkbook.tsx`

현재 동작 정리:
- `?day=N` (1~30) 으로 들어오면 해당 Day가 selected 됨. 잘못된 값은 Day 1로 보정 후 토스트.
- `?day=N&openMission=1` → 자동으로 미션 다이얼로그 오픈.

개선 사항:
- selectedDay가 사용자 인터랙션으로 바뀔 때 항상 URL `?day=` 를 업데이트(이미 일부 분기에 있음 — 누락된 캘린더 클릭 핸들러 1402, 1455, 1346줄 케이스 검수해서 통일).
- `?day=N&checkin=1` 별칭을 추가: openMission=1과 동일하게 동작 (사용자/공유 링크 가독성용).
- 미래 Day(잠긴 Day)로의 딥링크는 토스트 "아직 열리지 않은 Day예요. Day {currentDay}로 이동했어요." 후 currentDay로 보정.
- 30일 종료(currentDay > 30) 상태에서도 ?day=N 으로 과거 미션 회고 보기를 허용하도록 가드 정리.
- 대시보드/워크북 카드(`MindTrackDashboardCard.tsx`, `MindTrackProgressWidget.tsx`)의 워크북 링크에 `?day=` 파라미터 일관 부여(이미 일부 적용 — 누락 부분 보강).

## 4. 대시보드 vs 워크북 차이 도움말 배너

대상: 새 컴포넌트 `src/components/mind-track/DashboardVsWorkbookHelp.tsx` + 두 페이지에 삽입.

- 대시보드 상단(헤더 카드 바로 아래, 첫 진입 시): "대시보드 = 오늘 한눈에 / 워크북 = Day별 미션·체크인" 한 줄 + 펼치기 토글.
- 워크북 상단: 동일 컴포넌트의 워크북 모드 — "여기는 Day별 상세 워크북이에요. 오늘 요약은 대시보드에서 확인하세요." + 대시보드로 가는 링크.
- 닫기 버튼 → `localStorage` 키(`mt_help_banner_dismissed_v1`)로 영구 숨김. 헤더의 ⓘ "이용 방법" 버튼(309줄)에서 다시 열 수 있게 dismissed 상태도 reset 가능하도록 prop 노출.
- 디자인: 화이트 미니멀(`bg-white rounded-2xl border border-slate-200`), `Lightbulb` 아이콘 + gold accent(#C8B88A) 한 줄 — 그라디언트/이모지 금지(메모리 룰).

## 기술 메모

- Realtime 구독은 페이지 unmount 시 `supabase.removeChannel()` 정리.
- 키보드 핸들러는 Dialog open 상태/inputfocus 상태 체크 후 동작.
- 모든 변경 프론트엔드 only — 마이그레이션 없음.
- 영향 파일:
  - edit `src/pages/MindTrackWorkbook.tsx`
  - edit `src/pages/MindTrackDashboard.tsx`
  - edit `src/components/mind-track/MindTrackDashboardCard.tsx` (deep link 파라미터 통일 검토)
  - new  `src/components/mind-track/DashboardVsWorkbookHelp.tsx`

## 작업 순서

```text
1. DashboardVsWorkbookHelp 컴포넌트 작성
2. 워크북: 네비 버튼 + 키보드 + checkin 별칭 + 미래Day 보정
3. 워크북: submitCheckin 후 캐시 무효화 + 이벤트 발행
4. 대시보드: loadDashboard 추출 → realtime + 이벤트 리스너 추가
5. 두 페이지에 도움말 배너 삽입
```
