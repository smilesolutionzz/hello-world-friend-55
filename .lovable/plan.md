
## 7일 트랙 콘텐츠 구조 설계

### 1. Day 유형 — Hybrid 구조

7일을 **무거운 Day**(이벤트성)와 **가벼운 Day**(5분 미션) 두 종류로 나눠 완주율을 챙기면서 핵심 Day엔 변화의 임팩트를 만든다.

```text
Day 1 ━━━━━━ [무거움] 진단 (10~15분)
Day 2 ───── [가벼움] 5분 미션
Day 3 ───── [가벼움] 5분 미션
Day 4 ━━━━━━ [무거움] 전문가 매칭 제안 (스킵 가능)
Day 5 ───── [가벼움] 5분 미션
Day 6 ───── [가벼움] 5분 미션
Day 7 ━━━━━━ [무거움] 변화 리포트 (PDF)
```

**무거운 Day 화면 구성**
- Day 1: 출발점 진단 위젯 (5종 자가체크 + 마음 점수) → DB에 baseline 저장
- Day 4: "전문가 1:1 매칭" 카드 (audience별 태그된 전문가 1명 자동 추천 + "다음에" 스킵 버튼)
- Day 7: Day1 vs Day7 비교 리포트 + PDF 다운로드 + 7일 연장권/30일 트랙 업셀

**가벼운 Day 화면 구성** (Day 2·3·5·6)
- 오늘의 미션 카드 1개 (제목·How·소요 시간)
- 미션 완료 체크 버튼
- 2줄 자유 기록 (선택)
- 어제 vs 오늘 미니 트렌드 (점수가 있으면)

### 2. audience별 미션 풀 분리

`src/lib/mindTrack7DayMissions.ts` 신규 — Day 2·3·5·6 (가벼운 4일치)에 대해 audience별 풀 분리.

| audience | 미션 톤 | 예 |
|---|---|---|
| `child` (부모용 자녀 발달) | ABA 부모 코칭 | "{{name}} 강점 칭찬 3회", "감정 단어 1개 가르치기" |
| `adult` | 번아웃·불안 회복 | "에너지 누수 시간대 기록", "4-7-8 호흡 × 3세트" |
| `parent` (부모 자기 회복) | 부모 회복 | "나만의 10분 만들기", "거절 1개 연습" |
| `teen` (Phase 2) | 자기 이해 | (Phase 2에서 추가) |

각 audience × Day(2·3·5·6) = 4개 미션씩 × 3 audience = **12개 미션 카피**만 새로 작성.

### 3. Day 4 전문가 처리 (Phase 1)

- Day 4 화면: 매칭 카드 + "지금 매칭" CTA + "다음에 (계속 진행)" 보조 버튼
- 카드 내부: audience 태그 매칭으로 전문가 1명 자동 추천 (이미 `expert-hiring` 인프라/매칭 함수 재사용)
- 스킵 시 Day 4를 일반 미션 1개로 대체 ("전문가 없이 셀프 정리" 미션)
- 매칭 클릭 시 `/expert-hiring?audience={audience}&from=mind_track_d4`로 라우팅

### 4. 데이터 모델

DB 변경 최소화 — 기존 `mind_track_enrollments` + `mind_track_mission_progress` 재사용. 단:
- `mind_track_enrollments.baseline_data jsonb` (Day1 진단 결과 — 없으면 추가)
- `mind_track_enrollments.day7_report_url text` (Day7 PDF 캐시 — 없으면 추가)

### 5. 파일 구조 (신규 / 수정)

```text
src/lib/
  mindTrack7DayMissions.ts          [신규] audience×Day(2·3·5·6) 미션 풀
  mindTrack7DayResolver.ts          [신규] Day번호 → 화면 종류 + 미션 분기

src/components/mind-track/seven-day/
  Day1DiagnosisScreen.tsx           [신규]
  Day4ExpertMatchScreen.tsx         [신규]
  Day7ReportScreen.tsx              [신규]
  LightMissionScreen.tsx            [신규] Day 2·3·5·6 공통

src/pages/MindTrackWorkbook.tsx     [수정] totalDays===7 분기 → 위 4종 화면 라우팅
```

기존 30일 트랙 코드(`mindTrackDayCopy.ts`의 `DAY_COPY` 30일, `mindTrackChildMissions.ts`)는 그대로 둠.

### 6. 단계 (이 순서로 빌드)

1. **데이터 레이어**: `mindTrack7DayMissions.ts` + `mindTrack7DayResolver.ts` (DB 변경 없이 시작)
2. **가벼운 Day 화면** (Day 2·3·5·6): `LightMissionScreen.tsx` — 가장 단순한 카드 1장
3. **Day 1 진단 화면**: 기존 자가체크 위젯 재사용 + baseline 저장 (DB 컬럼 1개 추가)
4. **Day 4 매칭 화면**: 전문가 추천 카드 (스킵 가능)
5. **Day 7 리포트 화면**: Day1 vs Day7 비교 컴포넌트 + PDF
6. `MindTrackWorkbook.tsx`에서 `totalDays===7` 분기 → 새 4종 화면으로 라우팅
7. (마지막) DB 컬럼 2개 추가 마이그레이션

### 7. 비범위 (이번에 안 함)

- 30일 트랙 콘텐츠 (기존 유지)
- `teen` audience (Phase 2)
- 푸시 알림 / 매일 이메일 (이미 `daily-coaching-email` 인프라 별도)
- 트랙 내부 전문가 1:1 채팅 UI (Day 4는 `/expert-hiring`으로 라우팅)
