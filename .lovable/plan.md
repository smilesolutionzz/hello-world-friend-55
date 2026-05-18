# ABA 코칭 트랙 — 일일 카드 · 데이터 폼 · 7일 리포트

## 전제: B2B 매출 정합성

B2B(어린이집·발달센터·소아과)가 주매출원이라는 직관은 맞습니다. 단, B2B 영업의 무기는 결국 **"우리 부모가 7일 동안 이 미션을 진짜로 했고, 데이터가 남는다"** 라는 증거입니다. 지금 만들 ABA 자산은 두 가지로 동시에 작동합니다.

- **B2C (mind_track_7 ₩7,900)** — 30-45 부모가 직접 결제하고 매일 데이터를 입력 → 7일 리포트.
- **B2B 화이트라벨 자산** — 같은 ABA 데이터 스키마를 `b2b_jobcoach_*` / `client_data_sharing` 파이프라인에 그대로 흘려보낼 수 있어, 발달센터·어린이집이 부모에게 "우리 기관이 처방한 7일 ABA 프로토콜"로 재포장 가능. 즉 **이번 작업은 B2C 전환 + B2B 영업 데모용 자산을 동시에 짓는 작업**입니다. (별도 B2B UI 작업 아님 — B2C가 잘 돌면 B2B 자동 따라옴)

## 범위 (이번 턴)

### 1. DB — `aba_observations`
부모가 각 Day에 입력한 표적 행동/ABC 데이터를 저장.

| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | RLS 본인만 |
| enrollment_id | uuid | mind_track_enrollments.id (FK 없이 nullable, 호환성) |
| child_profile_id | uuid nullable | 다자녀 대비 |
| day | int (1–7) | |
| phase | text | Baseline / ABC 기록 / 강화 설계 / 선행 조작 / 대체 행동 / 일반화 / 유지 |
| target_behavior | text | 부모가 정의한 표적 행동 |
| data_method | text | frequency / duration / interval / abc_narrative |
| frequency_count | int nullable | |
| duration_seconds | int nullable | |
| interval_hits | int nullable | / interval_total |
| interval_total | int nullable | |
| abc_antecedent | text nullable | |
| abc_behavior | text nullable | |
| abc_consequence | text nullable | |
| reinforcer_used | text nullable | DRA 강화제 |
| parent_script_used | boolean | |
| notes | text nullable | |
| created_at / updated_at | timestamptz | trigger |

RLS: 본인만 select/insert/update/delete. `(user_id, enrollment_id, day, child_profile_id)` unique 인덱스로 day별 1행 upsert 보장.

### 2. UI — `ABAMissionCard.tsx`
`src/components/mind-track/aba/ABAMissionCard.tsx`. 각 Day 카드:
- 헤더: `Day N · {phase}` + 후킹 한 줄(`abaChildCurriculum`에서 import)
- 학습 목표 / 표적 행동 정의 / 부모 스크립트 예시 / 안전 메모
- **데이터 입력 폼** — `data_method`에 따라 동적:
  - frequency → 카운터(±1, 즉시 저장)
  - duration → 스톱워치(시작/정지 → 누적 초)
  - interval → "N회 중 발생 횟수" 두 칸
  - abc_narrative → A/B/C 3칸 textarea
- 강화제 사용 체크 + 자유 메모
- "저장" / 자동저장 (debounce 800ms) — 동일 day 행 upsert

### 3. TrackMissions 통합
`src/pages/TrackMissions.tsx`에서 `selected === "child_development"`일 때:
- 30일 매트릭스 위쪽에 **"오늘의 ABA 미션"** 섹션 신규 — `currentDay`에 해당하는 `ABAMissionCard` 1개 + 다음/이전 Day로 슬라이드.
- 기존 매트릭스는 유지하되 Day 1~7 셀은 ABA phase 라벨 추가.

### 4. 7일 요약 리포트 — `ABASummaryReport.tsx`
`src/components/mind-track/aba/ABASummaryReport.tsx`. 트리거: `currentDay >= 7` 이고 child_development.
- Day 1 baseline vs Day 6 비교 (frequency/duration 변화율)
- ABC 패턴 요약 (가장 흔한 트리거/결과)
- DRA 강화 일관성률 (parent_script_used true 비율)
- 다음 23일 유지 처방 — `mind_track_extend_23` CTA로 연결
- 다운로드:
  - **PNG** (html2canvas — 이미 PDF 모듈에서 쓰는 패턴) → 부모 카톡 공유용
  - **PDF** (`src/utils/pdfDownload.ts` 기존 헬퍼 재사용) → 발달센터/소아과 지참용

### 5. 라이브러리
- `src/lib/abaChildCurriculum.ts` (이미 생성됨) → `data_method` 필드를 폼 분기에 사용하도록 확장.
- `src/lib/abaObservations.ts` (신규) — CRUD helper (`upsertObservation`, `listObservationsForEnrollment`, `summarizeObservations`).

## 의도적으로 제외 (다음 턴)

- B2B 어드민에서 기관별 ABA 데이터 집계 뷰 (B2B 영업 자산화 — 이번 ICP 검증 후)
- 동영상/사진 첨부 (Storage 정책 검토 필요)
- 전문가에게 데이터 공유(이미 `client_data_sharing` 파이프라인 있음 — 다음 턴에 ABA 데이터를 동일 파이프라인에 흘려넣기)

## 기술 세부

```text
TrackMissions (child_development 선택 시)
 ├─ ABAMissionCard (currentDay)        ← 신규
 │   └─ ABAObservationForm
 │        └─ upsertObservation → aba_observations
 ├─ ABASummaryReport (Day ≥ 7)         ← 신규
 │   ├─ summarizeObservations (client)
 │   ├─ Download PNG (html2canvas)
 │   └─ Download PDF (pdfDownload)
 └─ 기존 30일 매트릭스 (유지, Day 1~7에 phase 라벨)
```

승인 시: 마이그레이션 → 코드 작성 → 빌드/테스트 1회 통과까지 한 번에 진행합니다.
