# Mind Track Workbook 진화 계획

이전 단계에서 남은 **데일리 코칭 메일**과, 이번에 요청하신 **워크북 고민 트래킹 시스템**을 한 번에 묶어서 진행합니다.

---

## 01. 데일리 코칭 메일 (남은 작업 마무리)

- `supabase/functions/_shared/transactional-email-templates/daily-action-coaching.tsx` 신규 (골드 #C8B88A, 발신: AIHPRO 코칭팀)
  - 오늘의 한 줄 진단 → 3개 액션 카드 → 근거 → 추천 영상 1개 → (발달 트랙 한정) 관찰 포인트 1줄
- `registry.ts` 에 `daily-action-coaching` 키 추가
- `mind-track-mission-email-cron` 확장:
  - 매일 07:00 KST 실행 (기존 cron job 시간 조정)
  - 활성 enrollment 순회 → `mind_track_action_prescriptions` 조회
  - 없으면 `mind-track-action-prescribe` 호출하여 생성
  - `email_status='pending'` 인 경우 `send-transactional-email` 호출 → 성공 시 `sent_at`/`email_status='sent'` 업데이트
  - `user_coaching_goals.daily_email_enabled` 와 충돌 시 mind-track 메일이 우선

## 02. 워크북 고민 트래킹 (`/mind-track/workbook`)

### 데이터 모델 (신규)

**`mind_track_concern_threads`** — enrollment 단위로 "내 고민"을 1개 보관
- `enrollment_id` (UNIQUE), `user_id`, `audience`, `track_focus`
- `concern_title`, `concern_detail`, `goal_statement`
- `baseline_score` (1-10 자기평가), `current_score`, `target_score=8`
- `status` (active/graduated), `started_at`, `graduated_at`

**`mind_track_progress_snapshots`** — 매 세션 종료 시 점수/근거 기록
- `thread_id`, `day_number`, `session_index`
- `self_score` (1-10), `mood_delta`, `evidence_summary` (LLM 요약)
- `actions_completed` (jsonb), `observations` (jsonb)
- `created_at` → 그래프 X축

**`mind_track_session_reports`** — 회차 리포트 (Day 1·4·8·11 세션 종료 후 생성)
- `thread_id`, `day_number`, `report_html`, `report_json`
- `key_wins`, `risk_flags`, `next_focus`

**`mind_track_graduation_workbooks`** — 졸업 워크북 (Day 14 완주 시 1회)
- `thread_id`, `audience`, `track_focus`
- `narrative_html` (PDF/공유용), `score_journey` (jsonb), `keepsake_quote`
- `pdf_url` (storage 'graduation-workbooks/{user_id}/{id}.pdf')

### 흐름

```text
시작(Day0)
 └ ConcernIntakeDialog: 제목/상세/목표/현재점수(1-10) 입력
   → mind_track_concern_threads 생성
세션 Day (1/4/8/11)
 ├ 상단: ConcernProgressHeader (제목·목표·현재점수)
 ├ ActionPrescriptionCard (기존, prescribe 함수가 thread context 받음)
 ├ 미션 수행 + 관찰일지 입력
 └ 세션 종료 시: SessionWrapDialog
     - 자기점수 1-10 선택
     - 한 줄 회고
     → progress_snapshots insert
     → mind-track-session-report 호출 → session_reports insert
비세션 Day (2/3/5/6/9/10/12/13)
 ├ ProgressGraph (recharts LineChart, snapshots 시계열)
 ├ 가벼운 회고 + 관찰
 └ snapshots insert (session_index=null)
Day 14 졸업
 └ mind-track-graduate 호출
     → graduation_workbooks 생성, PDF 렌더, 졸업 모달 → 다운로드/공유
```

### 적응형 미션

`mind-track-action-prescribe` 입력에 다음 추가:
- `concern_thread` (제목/목표/baseline)
- `recent_snapshots` (최근 3개 점수·증거·관찰)
- `last_session_report.next_focus`

→ LLM이 "지난번 X가 효과 있었으니 Y로 강화" 형태의 연속성 있는 처방을 생성. 점수가 정체/하락이면 framework 내 다른 기법으로 전환 지시.

### 그래프

- 컴포넌트: `ConcernProgressChart.tsx`
- recharts `LineChart`: X=날짜, Y=self_score(1-10), 목표선=`target_score`
- 세션 포인트는 강조, 비세션은 점선
- 헤더 텍스트: "고민 OO이 baseline 4 → 현재 7 (목표 8)"

### 회차 리포트

`mind-track-session-report` 신규 Edge Function
- 입력: thread + day_number + 해당 회차 snapshot + 관찰일지/액션수행
- 출력 jsonb: `summary`, `key_wins[]`, `evidence_of_change[]`, `risk_flags[]`, `next_focus`
- UI: 세션 종료 직후 모달 + `/mind-track/workbook/report/[day]` 라우트에서 재열람

### 졸업 워크북

`mind-track-graduate` 신규 Edge Function
- 입력: thread + 전체 snapshots + 전체 session_reports
- 출력: HTML 스토리북 (표지 → 14일 여정 → 점수 그래프 → 핵심 변화 3가지 → 부모/본인 다짐 → 다음 30일 가이드)
- PDF 변환: `html2pdf` (기존 PDF 인프라 재사용) → storage 업로드 → 다운로드 링크 반환
- UI: `GraduationModal` (콘페티 + PDF 다운로드 + 카카오 공유 + 23일 연장 업셀)

---

## 03. 새 파일

- `supabase/migrations/{ts}_concern_tracking.sql` — 4개 테이블 + RLS + GRANT
- `supabase/functions/_shared/transactional-email-templates/daily-action-coaching.tsx`
- `supabase/functions/mind-track-session-report/index.ts`
- `supabase/functions/mind-track-graduate/index.ts`
- `src/lib/mindTrackConcernThread.ts` — 헬퍼 (start/get/updateScore/listSnapshots)
- `src/components/mind-track/workbook/ConcernIntakeDialog.tsx`
- `src/components/mind-track/workbook/ConcernProgressHeader.tsx`
- `src/components/mind-track/workbook/ConcernProgressChart.tsx`
- `src/components/mind-track/workbook/SessionWrapDialog.tsx`
- `src/components/mind-track/workbook/SessionReportCard.tsx`
- `src/components/mind-track/workbook/GraduationModal.tsx`

## 04. 수정 파일

- `src/pages/MindTrackWorkbook.tsx` — thread 부트스트랩(없으면 인테이크), 헤더/그래프 노출, 세션 종료 핸들러, Day14 졸업 분기
- `src/components/mind-track/workbook/TwoWeekSessionView.tsx` — onComplete → SessionWrapDialog
- `src/components/mind-track/workbook/TwoWeekRestView.tsx` — 상단에 ConcernProgressChart
- `supabase/functions/mind-track-action-prescribe/index.ts` — thread/snapshots context 반영
- `supabase/functions/mind-track-mission-email-cron/index.ts` — 07:00 + 처방 fetch/생성 + 전송
- `supabase/functions/_shared/transactional-email-templates/registry.ts`
- `src/integrations/supabase/types.ts` (자동)
- `mem://features/mind-track/two-week-session-structure-ko` 업데이트 (thread/그래프/졸업 흐름 추가)

## 05. 정책 가드

- 위기 키워드 감지 시 그래프/리포트 대신 `/expert-hiring?urgent=true` 카드 노출 (기존 정책)
- baseline 미입력 enrollment에는 모든 화면이 인테이크 다이얼로그를 강제
- PMF 베타 기간 동안 졸업 PDF·세션 리포트 전부 무료

---

진행할까요? 승인하시면 위 순서대로 한 번에 만들겠습니다.